import Router from 'koa-router';

import emailController from '@/controller/emailUser.controller';

const emailRouter = new Router({ prefix: '/email_user' });

// 发送验证码
// emailRouter.post('/send', emailController.sendCode);

// 查找邮箱
emailRouter.get('/find', emailController.find);

// 邮箱列表
emailRouter.get('/list', emailController.getList);

export default emailRouter;
