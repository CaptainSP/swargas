import { ParamSchema } from "express-validator";

export function item<T>(
  options: ParamSchema,
  itemOptions: ParamSchema = null,
  valueType: new () => T = null
) {
  return function (target: any, propertyKey: string) {
    const type = Reflect.getMetadata("design:type", target, propertyKey);
    if (!target.constructor.__types__) {
      target.constructor.__types__ = {};
    }
    if (!target.constructor.__options__) {
      target.constructor.__options__ = {};
    }

    if (!target.constructor.__valueTypes__) {
      target.constructor.__valueTypes__ = {};
    }

    if (!target.constuctor.__itemOptions__) {
      target.constructor.__itemOptions__ = {};
    }

    target.constructor.__types__[propertyKey] = type;

    target.constructor.__valueTypes__[propertyKey] = valueType;

    target.constructor.__options__[propertyKey] = options;

    target.constructor.__itemOptions__[propertyKey] = itemOptions;
  };
}
