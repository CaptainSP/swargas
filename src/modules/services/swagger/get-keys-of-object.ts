import { getItemsOfArray } from "./get-items-of-array";
import { splitType } from "./split-type";

export function getKeysOfObject(obj: any, valueAsType: boolean = false) {
  let value: any = {};
  let keys = Object.keys(obj);

  for (let key of keys) {
    let type = typeof obj[key];
    if (type === "object") {
      if (Array.isArray(obj[key])) {
        value[key] = {
          type: "array",
          items: getItemsOfArray(obj[key], valueAsType),
        };
      } else {
        value[key] = {
          type: "object",
          properties: getKeysOfObject(obj[key], valueAsType),
        };
      }
    } else {
      let typeValue = splitType(valueAsType ? obj[key] : type);
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

      value[key] = {
        type: typeValue,
        $ref: ref,
      };
    }
  }

  return value;
}
