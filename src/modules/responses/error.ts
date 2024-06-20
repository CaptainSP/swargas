import { tr } from "../services/translator";

export default function error(message: any, code: number = 500) {
  return {
    success: false,
    error: message,
    code: code,
    status: code,
  };
}

export function errorTr(message: string, code: number = 500) {
  return {
    success: false,
    error: tr(message),
    code: code,
    status: code,
  };
}