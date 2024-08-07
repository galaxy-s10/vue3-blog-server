import { ParameterizedContext } from 'koa';

import successHandler from '@/app/handler/success-handle';
import { IBuryingPoint, IList } from '@/interface';
import buryingPointService from '@/service/buryingPoint.service';
import { strSlice } from '@/utils';

class BuryingPointController {
  async create(ctx: ParameterizedContext, next) {
    const ip = strSlice(String(ctx.request.headers['x-real-ip']), 490);
    const ua = strSlice(String(ctx.request.headers['user-agent']), 490);
    const data: IBuryingPoint = ctx.request.body;
    await buryingPointService.create({ ...data, ip, user_agent: ua });
    successHandler({ ctx });
    await next();
  }

  async getList(ctx: ParameterizedContext, next) {
    const {
      id,
      user_id,
      article_id,
      extend_field_a,
      extend_field_b,
      extend_field_c,
      extend_field_d,
      extend_field_e,
      extend_field_f,
      extend_field_g,
      orderBy = 'asc',
      orderName = 'id',
      nowPage,
      pageSize,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    }: IList<IBuryingPoint> = ctx.request.query;
    const result = await buryingPointService.getList({
      id,
      user_id,
      article_id,
      extend_field_a,
      extend_field_b,
      extend_field_c,
      extend_field_d,
      extend_field_e,
      extend_field_f,
      extend_field_g,
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
}

export default new BuryingPointController();
