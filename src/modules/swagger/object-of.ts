import { ParamSchema } from "express-validator";

export function objectOf(items: any, options?: ParamSchema) {
  return {
    type: "object",
    properties: items,
    options: options,
  };
}

export function arrayOf(items: any, options?: ParamSchema) {
  return {
    type: "array",
    items: items,
    options: options,
  };
}

export function anyOf<T>(type: new () => T, options?: ParamSchema) {

    const keys = getKeysOfType(new type());

  return {
    type: "any",
    valueType: type,
    options: options,
  };
}

export function getKeysOfType<T>(obj: T): Array<keyof T> {
  return Object.keys(obj) as Array<keyof T>;
}