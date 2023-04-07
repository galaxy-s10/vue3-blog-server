import Router from 'koa-router';

import { betaError } from '@/app/auth/verifyEnv';
import scheduleController from '@/controller/schedule.controller';
import { verifyIdOne } from '@/middleware/utils.middleware';

const scheduleRouter = new Router({ prefix: '/schedule' });

// 查看备份任务
scheduleRouter.get(
  '/db_job',
  betaError,
  verifyIdOne,
  scheduleController.getDbJob
);

// 查看内存
scheduleRouter.get(
  '/invoke_showMemory_job',
  betaError,
  verifyIdOne,
  scheduleController.invokeShowMemoryJob
);

// 执行备份任务
scheduleRouter.post(
  '/invoke_db_job',
  betaError,
  verifyIdOne,
  scheduleController.invokeDbJob
);

// 执行清除buff/cache任务
scheduleRouter.post(
  '/invoke_clearCache_job',
  betaError,
  verifyIdOne,
  scheduleController.invokeClearCacheJob
);

// 执行重启pm2
scheduleRouter.post(
  '/restart_pm2',
  betaError,
  verifyIdOne,
  scheduleController.restartPm2
);

export default scheduleRouter;
