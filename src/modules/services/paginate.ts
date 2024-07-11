import { body } from "express-validator"
import {
  AnyParamConstructor,
  BeAnObject,
  ReturnModelType,
} from "@typegoose/typegoose/lib/types";
import { Request, request } from "express";

export function Paginated(data) {
  return {
    current_page: "number",
    last_page: "number",
    per_page: "number",
    total: "number",
    data: [data],
  };
}

export default class PaginateService {
  /**
   * Usage: paginate(req,Model,Model.find())
   * @param req
   * @param count
   * @param query
   * @returns
   */
  static async paginate<T extends AnyParamConstructor<any>>(
    req: Request,
    model: ReturnModelType<T, BeAnObject>,
    query: any,
    options: {
      toObject?: boolean;
      lean?: boolean;
    } = {
      toObject: true,
      lean: false,
    }
  ) {
    let page = parseInt((req.query.page as string) || "1");
    let perPage = parseInt((req.query.perPage as string) || "15");

    if (perPage > 200) {
      perPage = 200;
    }

    const count = await model.find().merge(query).count();

    if (page <= 0) {
      page = 1;
    }
    const skip = (page - 1) * perPage;

    const init = query.limit(perPage).skip(skip);

    const data = options.lean
      ? await init.lean({
          virtuals: true,
          getters: true,
          autopopulate: true,
        })
      : await init.exec();

    const current_page = page;
    const lastPageItemCount = count % perPage;
    const last_page =
      Math.round(count / perPage) + (lastPageItemCount > 0 ? 1 : 0);
    return {
      current_page,
      last_page,
      per_page: perPage,
      data:
        options.toObject && !options.lean
          ? data.map((d: any) => d?.toObject() || d)
          : data,
      total: count,
    };
  }

  static async paginateAggregate(req: Request, count: number, query: any) {
    let page = parseInt((req.query.page as string) || "1");
    let perPage = parseInt((req.query.perPage as string) || "15");
    if (page <= 0) {
      page = 1;
    }
    const data = await query
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    const current_page = page;
    const lastPageItemCount = count % perPage;
    const last_page =
      Math.round(count / perPage) + (lastPageItemCount > 0 ? 1 : 0);
    return {
      current_page,
      last_page,
      per_page: perPage,
      data,
      total: count,
    };
  }
}
