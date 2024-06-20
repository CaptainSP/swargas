import { Severity, getModelForClass } from "@typegoose/typegoose";
import {
  AnyParamConstructor,
  ReturnModelType,
} from "@typegoose/typegoose/lib/types";
import { swagger } from "./swagger";

export function registerModel<T extends AnyParamConstructor<any>>(
  model: T
): ReturnModelType<T> {
  const modelClass = getModelForClass(model, {
    options: {
      allowMixed: Severity.ALLOW,
      
    },
    
  });

  swagger.components.schemas[model.name] = {
    type: "object",
    properties: getProperties(modelClass),
  };

  return modelClass;
}

export function registerNonModel(name: string, model: any) {
  swagger.components.schemas[name] = {
    type: "object",
    properties: getPropertiesOfNormalObject(model),
  };
}

function getPropertiesOfNormalObject(model: any) {
  const properties: any = {};
  for (const key in model) {
    const path = model[key];
    //console.log(model.name, path);
    let type = typeof path;
    let items = undefined;
    let ref = undefined;

    properties[key] = {
      type: type,
      required: path.isRequired,
      items: items,
      $ref: ref,
    };
  }
  return properties;
}

function getProperties(model: any) {
  const properties: any = {};
  for (const key in model.schema.paths) {
    const path = model.schema.paths[key];
    //console.log(model.name, path);
    let type = path.instance.toLowerCase();
    let items = undefined;
    let ref = undefined;

    if (type == "objectid") {
      ref = getTypeOrRef(path);
      type = "ref" ? "object" : "string";
    } else if (type == "array") {
      type = "array";
      
      items = {
        type: getTypeFromOptions(path),
        $ref: getTypeOrRef(path),
      };
    } else if (type == "mixed") {
      type = "object";
    } else if (type == "date") {
      type = "string";
    } else if (type == "number") {
      type = "number";
    } else if (type == "boolean") {
      type = "boolean";
    } else if (type == "string") {
      type = "string";
    } else {
      type = "object";
      ref = getTypeOrRef(path);
    }

    properties[key] = {
      type: type,
      required: path.isRequired,
      items: items,
      $ref: ref,
    };
  }
  return properties;
}

function getTypeOrRef(path: any) {
  if (path.options.ref) {
    // is function ref
    if (path.options.ref == Function) {
      return `#/components/schemas/${path.options.ref().name}`;
    }
    // is string ref
    return `#/components/schemas/${path.options.ref}`;
  } else {
    if (path.caster?.options?.ref) {
      // is function ref
      if (path.caster.options.ref == Function) {
        return `#/components/schemas/${path.caster.options.ref().name}`;
      }
      // is string ref
      return `#/components/schemas/${path.caster.options.ref}`;
    } else {
       return undefined;
    }
  }
}

function getTypeFromOptions(path: any) {
  // evulate if its is function
  if (path.options.type[0] == Function) {
    return "object";
  }
  if (path.options.type) {
    if (path.options.type[0] == String) {
      return "string";
    } else if (path.options.type[0] == Number) {
      return "number";
    } else if (path.options.type[0] == Date) {
      return "string";
    } else if (path.options.type[0] == Boolean) {
      return "boolean";
    } else {
      return "object";
    }
  } else {
    return "object";
  }
}
