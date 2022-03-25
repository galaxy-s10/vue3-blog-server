import Router from 'koa-router';

import emailController from '@/controller/email.controller';

const emailRouter = new Router({ prefix: '/email' });

// 发送验证码
emailRouter.post('/send', emailController.send);

export default emailRouter;
