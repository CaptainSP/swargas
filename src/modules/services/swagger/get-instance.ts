import { getKeysOfType } from "../../swagger/object-of";

export function getInstance(type: any) {

  if (!type) {
    return {
      keys: [],
      types: {},
      options: {},
      valueTypes: {},
      itemOptions: {},
    };
  }

  const keys = type.__keys__;
  const types = type.__types__;
  const options = type.__options__;
  const valueTypes = type.__valueTypes__;
  const itemOptions = type.__itemOptions__;
  console.log("keys", keys);
  return {
    keys: keys,
    types: types,
    options: options,
    valueTypes: valueTypes,
    itemOptions: itemOptions,
  };
}
