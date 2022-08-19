import { ParameterizedContext } from 'koa';
import schedule from 'node-schedule';

import { authJwt } from '@/app/auth/authJwt';
import emitError from '@/app/handler/emit-error';
import successHandler from '@/app/handler/success-handle';
import { MONIT_BACKUPSDB_JOB } from '@/constant';
import { main } from '@/monit/monitBackupsDb';
import { showMemory, clearCache } from '@/utils/clearCache';

class ScheduleController {
  async getDbJob(ctx: ParameterizedContext, next) {
    try {
      const dbJob = schedule.scheduledJobs[MONIT_BACKUPSDB_JOB];
      if (dbJob) {
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
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async invokeDbJob(ctx: ParameterizedContext, next) {
    try {
      const { code, userInfo, message } = await authJwt(ctx);
      if (code !== 200) {
        emitError({ ctx, code: 400, error: message });
        return;
      }
      if (userInfo.id !== 1) {
        emitError({
          ctx,
          code: 403,
          error: '权限不够哦~',
          message: '权限不够哦~',
        });
        return;
      }
      main();
      successHandler({
        ctx,
        data: '开始执行备份任务，大约5分钟执行完成',
      });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async invokeClearCacheJob(ctx: ParameterizedContext, next) {
    try {
      const { code, userInfo, message } = await authJwt(ctx);
      if (code !== 200) {
        emitError({ ctx, code: 400, error: message });
        return;
      }
      if (userInfo.id !== 1) {
        emitError({
          ctx,
          code: 403,
          error: '权限不够哦~',
          message: '权限不够哦~',
        });
        return;
      }
      clearCache();
      successHandler({
        ctx,
        message: '开始执行清除buff/cache任务',
      });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async invokeShowMemoryJob(ctx: ParameterizedContext, next) {
    try {
      const { code, userInfo, message } = await authJwt(ctx);
      if (code !== 200) {
        emitError({ ctx, code: 400, error: message });
        return;
      }
      if (userInfo.id !== 1) {
        emitError({
          ctx,
          code: 403,
          error: '权限不够哦~',
          message: '权限不够哦~',
        });
        return;
      }
      const data = await showMemory();
      successHandler({
        ctx,
        data,
      });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }
}

export default new ScheduleController();
