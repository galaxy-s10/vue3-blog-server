import Router from 'koa-router';
import userController from '../controller/user.controller';
import { verifyProp } from '../middleware/user.middleware';

const userRouter = new Router({ prefix: '/user' });

userRouter.post('/create', verifyProp, userController.create, (ctx, next) => {
  console.log('lllll;;');
});
export default userRouter;
