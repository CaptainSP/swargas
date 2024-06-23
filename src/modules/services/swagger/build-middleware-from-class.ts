import { getKeysOfType } from "../../swagger/object-of";

import { Location, ParamSchema, Schema } from "express-validator";
import { splitType } from "./split-type";
import { Types } from "mongoose";
import { Email } from "../../../models/email";
import { getInstance } from "./get-instance";
import {
  isStringConstructor,
  isNumberConstructor,
  isBooleanConstructor,
  isEmailConstructor,
  isDateConstructor,
  isObjectIdConstructor,
  isArrayConstructor,
} from "./check-constructor";
import { isIsoDate } from "./is-iso-date";

export function buildMiddlewareFromClass<T, V>(
  type: new () => T,
  valueOptions: ParamSchema,
  valueType: new () => V,
  itemOptions: ParamSchema
): Schema {
  const items: {
    key: string;
    options: ParamSchema;
  }[] = [];

  getAllWithChildren(
    items,
    type,
    valueOptions,
    itemOptions,
    valueType,
    null,
    false
  );
  const options: Schema = {};
  for (let item of items) {
    options[item.key] = {
      in: "body",
      ...item.options,
    };
  }

  console.log(options);
  return options;
}

const exampleBody = {
  name: "string",
  child: {
    test1: "string",
    items: [
      {
        name: "string",
        age: "number",
        deep: {
          test: "string",
        },
      },
    ],
  },
};

const nExample = [
  "name",
  "child*test1",
  "child*items*name",
  "child*items*age",
  "child*items*deep*test",
];

export function buildTypeOptions<T>(param: new () => T): ParamSchema {
  const options: ParamSchema = {};
  if (isStringConstructor(param)) {
    options.isString = true;
  } else if (isNumberConstructor(param)) {
    options.isNumeric = true;
  } else if (isBooleanConstructor(param)) {
    options.isBoolean = true;
  } else if (isEmailConstructor(param)) {
    options.isEmail = true;
  } else if (isDateConstructor(param)) {
    // add custom validator
    options.custom = {
      options: (value: string, { req }) => {
        return isIsoDate(value);
      },
    };
    options.customSanitizer = {
      options: (value: string) => {
        return new Date(value);
      },
    };
  } else if (isObjectIdConstructor(param)) {
    options.isMongoId = true;
    options.customSanitizer = {
      options: (value: string) => {
        try {
          return new Types.ObjectId(value);
        } catch (error) {
          return value;
        }
      },
    };
  } else {
    options.isObject = true;
  }
  return options;
}

function getAllWithChildren<T, V>(
  items: {
    key: string;
    options: ParamSchema;
  }[],
  param: new () => T,
  paramOptions: ParamSchema,
  itemOptions: ParamSchema,
  valueType: new () => V,
  parent: any = null,
  required = true
) {
  if (
    isStringConstructor(param) ||
    isNumberConstructor(param) ||
    isBooleanConstructor(param) ||
    isDateConstructor(param) ||
    isEmailConstructor(param) ||
    isObjectIdConstructor(param)
  ) {
    const obj: { key: string; options: ParamSchema } = {
      key: parent,
      options: {
        ...buildTypeOptions(param),
        ...paramOptions,
      },
    };
    items.push(obj);
  } else if (isArrayConstructor(param) || Array.isArray(param)) {
    //console.log("isArray", parent, param, valueType);
    getItemsOfArrayParam(items, valueType, paramOptions, itemOptions, parent);
  } else {
    getItemsOfObjectParam(items, param, paramOptions, parent);
  }
}

function getItemsOfObjectParam<T, V>(
  items: {
    key: string;
    options: ParamSchema;
  }[],
  param: new () => T,
  paramOptions: ParamSchema,
  parent: any
) {
  if (parent) {
    items.push({
      key: parent,
      options: {
        isObject: true,
        ...paramOptions,
      },
    });
  }

  const instance = getInstance(param);
  //console.log("isObject", parent, param, instance);
  for (let key of instance.keys) {
    const asString = key as string;
    const type = instance.types[key];
    const options = instance.options[key];
    const value = instance.valueTypes[key];
    const itemOptions = instance.itemOptions[key];
    getAllWithChildren(
      items,
      type,
      options,
      itemOptions,
      value,
      parent ? parent + "." + asString : asString
    );
  }
}

function getItemsOfArrayParam<T, V>(
  items: {
    key: string;
    options: ParamSchema;
  }[],
  valueType: new () => V,
  options: ParamSchema,
  itemOptions: ParamSchema | ParamSchema[],
  parent: string
) {
  if (parent) {
    items.push({
      key: parent,
      options: {
        isArray: true,
        ...options,
      },
    });
  }

  getAllWithChildren(
    items,
    valueType,
    Array.isArray(itemOptions) ? itemOptions[0] : itemOptions,
    Array.isArray(itemOptions) ? itemOptions[1] : itemOptions,
    Array.isArray(valueType) ? valueType[0] : valueType,
    parent ? parent + ".*" : parent
  );
}
