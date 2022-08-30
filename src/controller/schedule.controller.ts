import { ParameterizedContext } from 'koa';
import schedule from 'node-schedule';

import { authJwt } from '@/app/auth/authJwt';
import successHandler from '@/app/handler/success-handle';
import { MONIT_JOB } from '@/constant';
import { CustomError } from '@/model/customError.model';
import { main } from '@/monit/monitBackupsDb';
import { showMemory, clearCache, restartPm2 } from '@/utils/clearCache';

class ScheduleController {
  async getDbJob(ctx: ParameterizedContext, next) {
    const dbJob = schedule.scheduledJobs[MONIT_JOB.BACKUPSDB];
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

    await next();
  }

  async invokeDbJob(ctx: ParameterizedContext, next) {
    const { code, userInfo, message } = await authJwt(ctx);
    if (code !== 200) {
      throw new CustomError(message, code, code);
    }
    if (userInfo!.id !== 1) {
      throw new CustomError(`权限不足！`, 403, 403);
    }
    main(userInfo!.id);
    successHandler({
      ctx,
      data: '开始执行备份任务，大约5分钟执行完成',
    });

    await next();
  }

  async invokeClearCacheJob(ctx: ParameterizedContext, next) {
    const { code, userInfo, message } = await authJwt(ctx);
    if (code !== 200) {
      throw new CustomError(message, code, code);
    }
    if (userInfo!.id !== 1) {
      throw new CustomError(`权限不足！`, 403, 403);
    }
    clearCache();
    successHandler({
      ctx,
      message: '开始执行清除buff/cache任务',
    });

    await next();
  }

  async restartPm2(ctx: ParameterizedContext, next) {
    const { code, userInfo, message } = await authJwt(ctx);
    if (code !== 200) {
      throw new CustomError(message, code, code);
    }
    if (userInfo!.id !== 1) {
      throw new CustomError(`权限不足！`, 403, 403);
    }
    successHandler({
      ctx,
      message: '开始执行重启pm2任务',
    });
    restartPm2();
    await next();
  }

  async invokeShowMemoryJob(ctx: ParameterizedContext, next) {
    const { code, userInfo, message } = await authJwt(ctx);
    if (code !== 200) {
      throw new CustomError(message, code, code);
    }
    if (userInfo!.id !== 1) {
      throw new CustomError(`权限不足！`, 403, 403);
    }
    const data = await showMemory();
    successHandler({
      ctx,
      data,
    });

    await next();
  }
}

export default new ScheduleController();
