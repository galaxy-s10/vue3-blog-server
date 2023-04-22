import Router from 'koa-router';

import otherController from '@/controller/other.controller';

const otherRouter = new Router({ prefix: '/other' });

// 发送验证码
otherRouter.post('/send_email', otherController.sendCode);

// 获取运行信息
otherRouter.get('/server_info', otherController.getServerInfo);

export default otherRouter;
