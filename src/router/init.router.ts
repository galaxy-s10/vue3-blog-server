import Router from 'koa-router';
import initController from '@/controller/init.controller';

const initRouter = new Router({ prefix: '/init' });

// 初始化角色
initRouter.post('/role', initController.createRole);

// 初始化权限
initRouter.post('/auth', initController.createAuth);

// 初始化角色权限
initRouter.post('/role_auth', initController.createRoleAuth);

// 初始化时间表
initRouter.post('/day_data', initController.createDayData);

export default initRouter;
