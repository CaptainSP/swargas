import { type } from "os";
import {
  isArrayConstructor,
  isDateConstructor,
  isEmailConstructor,
  isNumberConstructor,
  isObjectIdConstructor,
  isStringConstructor,
} from "./check-constructor";
import { getKeysOfObject } from "./get-keys-of-object";
import { splitType } from "./split-type";
import { getConstructorAsString } from "./get-constructor-as-string";
import { getKeysOfObjectClass } from "./get-keys-object-class";

export function getItemsOfArrayClass<T, V>(
  arr: new () => T,
  valueType: new () => V,
) {
  if (Array.isArray(valueType)) {
    return {
      type: "array",
      items: getItemsOfArrayClass(valueType, valueType[0]),
    };
  } else if (
    isStringConstructor(valueType) ||
    isNumberConstructor(valueType) ||
    isDateConstructor(valueType) || 
    isEmailConstructor(valueType) ||
    isObjectIdConstructor(valueType)
  ) {
    
    let ref = undefined;
    let typeValue = getConstructorAsString(valueType);
    if (
      !["string", "number", "boolean", "date", "objectId"].includes(typeValue)
    ) {
      ref = "#/components/schemas/" + typeValue;
      typeValue = "object";
    }

    if (typeValue === "objectId") {
      typeValue = "string";
    }

    return {
      type: typeValue,
      $ref: ref,
    };
  } else {
    return {
      type: "object",
      properties: getKeysOfObjectClass(valueType),
    };
  }
}
