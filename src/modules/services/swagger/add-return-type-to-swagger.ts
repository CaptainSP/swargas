import { swagger } from "../../swagger/swagger";
import { changeResponseType } from "./change-response-type";

export function addReturnTypeToSwagger(
  path: string,
  method: string,
  target: any,
  propertyKey: string
) {
  const response = Reflect.getMetadata("success", target, propertyKey);
  if (response) {
    swagger.paths[path][method.toLocaleLowerCase()].responses["200"] = response["200"];
  }
}
