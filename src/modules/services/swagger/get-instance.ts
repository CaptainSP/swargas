import { getKeysOfType } from "../../swagger/object-of";

export function getInstance<T>(type: new () => T) {
  const instance: any = new type();
  const keys = instance.constructor.__keys__;
  const types = instance.constructor.__types__;
  const options = instance.constructor.__options__;
  const valueTypes = instance.constructor.__valueTypes__;
  const itemOptions = instance.constructor.__itemOptions__;
  return {
    instance: instance,
    keys: keys,
    types: types,
    options: options,
    valueTypes: valueTypes,
    itemOptions: itemOptions,
  };
}
