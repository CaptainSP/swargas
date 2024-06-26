import { ReturnModelType } from "@typegoose/typegoose";
import {
  BeAnObject,
  DocumentType,
  ModelType,
} from "@typegoose/typegoose/lib/types";

export type AnalyseFn<T> = (
  model: ModelType<T, BeAnObject>,
  data: Partial<T>
) => Promise<DocumentType<T>>;
