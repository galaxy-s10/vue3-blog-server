import Router from 'koa-router';
import authController from '@/controller/auth.controller';
import { verifyProp } from '@/middleware/auth.middleware';

const authRouter = new Router({ prefix: '/auth' });

// 获取权限列表
authRouter.get('/list', authController.getList);

// 获取嵌套权限列表
authRouter.get('/nese_list', authController.getNestList);

// 获取某个用户的所有权限
authRouter.get('/get_user_auth/:userid', authController.getUserAuth);

// 新增权限
authRouter.post('/create', authController.create);

// 修改权限
authRouter.put('/update/:id', verifyProp, authController.update);

// 删除权限
authRouter.delete('/delete/:id', verifyProp, authController.delete);
export default authRouter;
