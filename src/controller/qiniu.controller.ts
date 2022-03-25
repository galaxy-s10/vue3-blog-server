import { ParameterizedContext } from 'koa';

import emitError from '@/app/handler/emit-error';
import successHandler from '@/app/handler/success-handle';
import qiniuModel from '@/utils/qiniu';

class QiniuController {
  async getToken(ctx: ParameterizedContext, next) {
    try {
      const token = qiniuModel.getQiniuToken();
      successHandler({
        ctx,
        data: token,
        message: '获取七牛云token成功，有效期1小时？',
      });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  /**
   * 备份数据库
   */
  async uploadBackupsDb(ctx: ParameterizedContext, next) {
    try {
      const res = await qiniuModel.uploadBackupsDb();
      successHandler({
        ctx,
        data: res,
      });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }
}

export default new QiniuController();
