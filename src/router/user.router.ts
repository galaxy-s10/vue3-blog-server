import Router from 'koa-router';
import userController from '@/controller/user.controller';
import { verifyProp } from '@/middleware/user.middleware';

const userRouter = new Router({ prefix: '/user' });

// WARN:中间件接收两个参数，ctx和next，如果这个中间件是异步的（即加了async），
// 则这个中间件必须调用next时必须加上await，如果是直接next，就会直接返回404给前端！
userRouter.get('/list', verifyProp, userController.list);
userRouter.post('/create', verifyProp, userController.create);
userRouter.get('/login', userController.login);

export default userRouter;
