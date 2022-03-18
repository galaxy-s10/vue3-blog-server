import Router from 'koa-router';

import scheduleController from '@/controller/schedule.controller';

const scheduleRouter = new Router({ prefix: '/schedule' });

// 备份任务
scheduleRouter.get('/db_job', scheduleController.getDbJob);

// 立即执行备份任务
scheduleRouter.get('/invoke_db_job', scheduleController.invokeDbJob);

export default scheduleRouter;
