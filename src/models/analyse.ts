import { ReturnModelType } from "@typegoose/typegoose";
import {
  AnyParamConstructor,
  BeAnObject,
  DocumentType,
} from "@typegoose/typegoose/lib/types";

export type AnalyseFn<T extends AnyParamConstructor<any>> = (
  model: ReturnModelType<T, BeAnObject>,
  data: any
) => Promise<DocumentType<T>>;
