import Router from 'koa-router';
import visitorLogController from '@/controller/visitorLog.controller';
import { verifyProp } from '@/middleware/visitorLog.middleware';

const visitorLogRouter = new Router({ prefix: '/visitor_log' });

// 访客日志列表
visitorLogRouter.get('/list', visitorLogController.getList);

// 创建访客日志
visitorLogRouter.post('/create', verifyProp, visitorLogController.create);

// 删除访客日志
visitorLogRouter.delete('/delete/:id', visitorLogController.delete);

export default visitorLogRouter;
