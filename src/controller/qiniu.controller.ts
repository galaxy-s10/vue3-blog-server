import { Context } from 'koa';

import errorHandler from '@/app/handler/error-handle';
import successHandler from '@/app/handler/success-handle';
import qiniuModel from '@/utils/qiniu';

class QiniuController {
  async getToken(ctx: Context, next) {
    try {
      const token = qiniuModel.getQiniuToken();
      successHandler({
        ctx,
        data: token,
        message: '获取七牛云token成功，有效期1小时？',
      });
    } catch (error) {
      errorHandler({ ctx, code: 400, error });
    }
    await next();
  }

  /**
   * 备份数据库
   */
  async uploadBackupsDb(ctx: Context, next) {
    try {
      const res = await qiniuModel.uploadBackupsDb();
      successHandler({
        ctx,
        data: res,
      });
    } catch (error) {
      errorHandler({ ctx, code: 400, error });
    }
    await next();
  }
}

export default new QiniuController();
