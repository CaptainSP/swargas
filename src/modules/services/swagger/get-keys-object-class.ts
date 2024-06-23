import {
  isArrayConstructor,
  isDateConstructor,
  isEmailConstructor,
  isNumberConstructor,
  isObjectIdConstructor,
  isStringConstructor,
} from "./check-constructor";
import { getInstance } from "./get-instance";
import { getItemsOfArray } from "./get-items-of-array";
import { getItemsOfArrayClass } from "./get-items-of-array-class";
import { getKeysOfObject } from "./get-keys-of-object";
import { splitType } from "./split-type";
import { getConstructorAsString } from "./get-constructor-as-string";

export function getKeysOfObjectClass<T>(obj: new () => T) {
  let value: any = {};
  const instance = getInstance(obj);
  let keys = instance.keys;
  

  for (let key of keys) {
    let type = instance.types[key];
    let valueType = instance.valueTypes[key];

    if (isArrayConstructor(type)) {
      value[key] = {
        type: "array",
        items: getItemsOfArrayClass(obj[key], valueType),
      };
    } else if (
      isStringConstructor(type) ||
      isNumberConstructor(type) ||
      isDateConstructor(type) ||
      isEmailConstructor(type) ||
      isObjectIdConstructor(type)
    ) {
      let ref = undefined;
      let typeValue = getConstructorAsString(type as any);
      
      if (
        !["string", "number", "boolean", "date", "objectId"].includes(typeValue)
      ) {
        ref = "#/components/schemas/" + typeValue;
        typeValue = "object";
      }

      if (typeValue === "objectId") {
        typeValue = "string";
      }

      value[key] = {
        type: typeValue,
        $ref: ref,
      };
    } else {
      value[key] = {
        type: "object",
        properties: getKeysOfObjectClass(type),
      };
    }
  }

  return value;
}
