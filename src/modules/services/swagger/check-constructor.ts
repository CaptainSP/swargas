import { Types } from "mongoose";
import { Email } from "../../../models/email";

export function isStringConstructor(param: any): param is String {
  return param === String;
}

export function isNumberConstructor(param: any): param is Number {
  return param === Number;
}

export function isDateConstructor(param: any): param is Date {
  return param === Date;
}

export function isEmailConstructor(param: any): param is Email {
  return param === Email;
}

export function isBooleanConstructor(param: any): param is Boolean {
  return param === Boolean;
}

export function isObjectIdConstructor(param: any): param is Types.ObjectId {
  return param === Types.ObjectId;
}

export function isArrayConstructor(param: any): param is Array<any> {
  return param === Array;
}
