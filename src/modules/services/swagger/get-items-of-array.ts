import { getKeysOfObject } from "./get-keys-of-object";
import { splitType } from "./split-type";

export function getItemsOfArray(arr: any[], valueAsType: boolean = false) {
  let first = arr[0];
  let type = typeof first;
  if (type === "object") {
    if (Array.isArray(first)) {
      return {
        type: "array",
        items: getItemsOfArray(first, valueAsType),
      };
    } else {
      return {
        type: "object",
        properties: getKeysOfObject(first, valueAsType),
      };
    }
  } else {
    let typeValue = splitType(valueAsType ? first : type);
    let ref = undefined;

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
  }
}
