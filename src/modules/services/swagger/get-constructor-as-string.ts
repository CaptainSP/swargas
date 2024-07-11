import {
  isBooleanConstructor,
  isDateConstructor,
  isEmailConstructor,
  isNumberConstructor,
  isObjectIdConstructor,
  isStringConstructor,
} from "./check-constructor";

export function getConstructorAsString<T>(type: new () => T) {
  if (isStringConstructor(type)) {
    return "string";
  } else if (isNumberConstructor(type)) {
    return "number";
  } else if (isObjectIdConstructor(type)) {
    return "objectId";
  } else if (isEmailConstructor(type)) {
    return "string";
  } else if (isDateConstructor(type)) {
    return "date";
  } else if (isBooleanConstructor(type)) {
    return "boolean";
  } else {
    return "object";
  }
}
