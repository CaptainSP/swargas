import { Location, ParamSchema, Schema } from "express-validator";
import { splitType } from "./split-type";
import { OID } from "../../helpers/generate-object-id";

export function buildParamOptions(position: Location | Location[], param: any) {
  const options: Schema = {};
  const items: {
    key: string;
    options: ParamSchema;
  }[] = [];
  getAllWithChildren(items, param, null, position != "body");
  for (let item of items) {
    options[item.key] = {
      in: position,
      ...item.options,
    };
  }
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

export function buildTypeOptions(param: string): ParamSchema {
  const options: ParamSchema = {};
  const splitted = splitType(param);
  if (splitted == "string") {
    options.isString = true;
  } else if (splitted == "number") {
    options.isNumeric = true;
  } else if (splitted == "boolean") {
    options.isBoolean = true;
  } else if (splitted == "email") {
    options.isEmail = true;
  } else if (splitted == "date" || splitted == "Date") {
    options.isDate = true;
  } else if (
    splitted?.toLowerCase() == "objectid" ||
    splitted == "oid" ||
    splitted == "mongoId"
  ) {
    options.isMongoId = true;
    options.customSanitizer = {
      options: (value: string) => {
        try {
          return OID(value);
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

function buildSplittedOptions(param: string, required = true): ParamSchema {
  const options: ParamSchema = {};
  const splitted = param.split("|");
  if (required) {
    options.exists = true;
  } else {
    options.optional = { options: { nullable: true, checkFalsy:true } };
  }
  if (splitted.length > 1) {
    for (let i = 1; i < splitted.length; i++) {
      if (splitted[i] == "required") {
        options.exists = true;
      } else if (splitted[i] == "optional") {
        options.optional = { options: { nullable: true, checkFalsy:true } };
      } else if (splitted[i] == "email") {
        options.isEmail = true;
      } else if (splitted[i].includes("min")) {
        if (!options.isLength) options.isLength = { options: {} };
        (options as any).isLength.min = parseInt(splitted[i].split(":")[1]);
      } else if (splitted[i].includes("max")) {
        if (!options.isLength) options.isLength = { options: {} };
        (options as any).isLength.max = parseInt(splitted[i].split(":")[1]);
      } else if (splitted[i].includes("isIn")) {
        if (!options.isIn) options.isIn = { options: [] };
        (options as any).isIn.options = splitted[i].split(":")[1].split(",");
      }
    }
  }
  return options;
}

function getAllWithChildren(
  items: {
    key: string;
    options: ParamSchema;
  }[],
  param: any,
  parent: string = null,
  required = true
) {
  if (typeof param == "string") {
    let paramToAdd = parent ? parent : param;
    let splitted = splitType(param);
    const obj: { key: string; options: ParamSchema } = {
      key: paramToAdd,
      options: {
        ...buildTypeOptions(param),
        ...buildSplittedOptions(param, required),
      },
    };
    items.push(obj);
  } else if (Array.isArray(param)) {
    getItemsOfArrayParam(items, param, parent);
  } else if (typeof param == "object") {
    getItemsOfObjectParam(items, param, parent);
  }
}

function getItemsOfObjectParam(
  items: {
    key: string;
    options: ParamSchema;
  }[],
  param: any,
  parent: string
) {
  if (parent) {
    items.push({
      key: parent,
      options: {
        isObject: true,
      },
    });
  }
  for (let key in param) {
    let value = param[key];
    getAllWithChildren(items, value, parent ? parent + "." + key : key);
  }
}

function getItemsOfArrayParam(
  items: {
    key: string;
    options: ParamSchema;
  }[],
  param: any,
  parent: string
) {
  if (parent) {
    items.push({
      key: parent,
      options: {
        isArray: true,
      },
    });
  }
  if (param?.length > 0) {
    getAllWithChildren(items, param[0], parent ? parent + ".*" : parent);
  }
}
