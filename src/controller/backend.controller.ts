import { ParameterizedContext } from 'koa';

import successHandler from '@/app/handler/success-handle';
import { ALLOW_HTTP_CODE } from '@/constant';
import { IBackend, IList } from '@/interface';
import { CustomError } from '@/model/customError.model';
import backendService from '@/service/backend.service';
import { execCmd } from '@/utils/clearCache';

class BackendController {
  async getDetail(ctx: ParameterizedContext, next) {
    const result = await backendService.findAll();
    const obj: any = {};
    result.forEach((item) => {
      const val = item.get();
      obj[val.key!] = {
        value: val.value,
        desc: val.desc,
        created_at: val.created_at,
        updated_at: val.updated_at,
      };
    });
    successHandler({ ctx, data: obj });
    await next();
  }

  async execCmd(ctx: ParameterizedContext, next) {
    const { cmd } = ctx.request.body;
    const result = await execCmd(cmd as string);
    successHandler({ ctx, data: result });
    await next();
  }

  async find(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const result = await backendService.find(id);
    successHandler({ ctx, data: result });
    await next();
  }

  async create(ctx: ParameterizedContext, next) {
    const { type, key, value, desc }: IBackend = ctx.request.body;
    await backendService.create({
      type,
      key,
      value,
      desc,
    });
    successHandler({ ctx });
    await next();
  }

  async getList(ctx: ParameterizedContext, next) {
    const {
      id,
      orderBy = 'asc',
      orderName = 'id',
      nowPage,
      pageSize,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    }: IList<IBackend> = ctx.request.query;
    const result = await backendService.getList({
      id,
      orderBy,
      orderName,
      nowPage,
      pageSize,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    });
    successHandler({ ctx, data: result });
    await next();
  }

  async getStatis(ctx: ParameterizedContext, next) {
    const result = await backendService.static();
    successHandler({ ctx, data: result });
    await next();
  }

  async update(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const { key, value, desc }: IBackend = ctx.request.body;
    await backendService.update({
      id,
      key,
      value,
      desc,
    });
    successHandler({ ctx });
    await next();
  }

  async delete(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const isExist = await backendService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的后台设置！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    await backendService.delete(id);
    successHandler({ ctx });

    await next();
  }
}

export default new BackendController();
