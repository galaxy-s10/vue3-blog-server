import { Context } from 'koa';
import schedule from 'node-schedule';

import { authJwt } from '@/app/authJwt';
import errorHandler from '@/app/handler/error-handle';
import successHandler from '@/app/handler/success-handle';
import { dbJob } from '@/utils/backupsDb';

class ScheduleController {
  async getDbJob(ctx: Context, next) {
    try {
      if (schedule.scheduledJobs.dbJob && dbJob) {
        successHandler({
          ctx,
          data: { status: 1, nextInvocation: dbJob.nextInvocation().getTime() },
        });
      } else {
        successHandler({
          ctx,
          data: { status: 2, message: '任务异常' },
        });
      }
    } catch (error) {
      errorHandler({ ctx, code: 400, error });
    }
    await next();
  }

  async invokeDbJob(ctx: Context, next) {
    try {
      const { code, userInfo, message } = await authJwt(ctx.request);
      if (code !== 200) {
        errorHandler({ ctx, code: 400, error: message });
        return;
      }
      if (userInfo.id !== 1) {
        errorHandler({
          ctx,
          code: 403,
          error: '权限不够哦~',
          message: '权限不够哦~',
        });
        return;
      }
      if (schedule.scheduledJobs.dbJob && dbJob) {
        dbJob.invoke();
        successHandler({
          ctx,
          data: '开始执行备份任务，大约5分钟执行完成',
        });
      } else {
        successHandler({
          ctx,
          data: { status: 2, message: '任务异常' },
        });
      }
    } catch (error) {
      errorHandler({ ctx, code: 400, error });
    }
    await next();
  }
}

export default new ScheduleController();
