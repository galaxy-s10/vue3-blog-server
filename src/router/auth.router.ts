import Router from 'koa-router';

import authController from '@/controller/auth.controller';
import { verifyProp } from '@/middleware/auth.middleware';

const authRouter = new Router({ prefix: '/auth' });

// 查找权限
authRouter.get('/find/:id', authController.find);

// 权限列表(分页)
authRouter.get('/list', authController.getList);

// 权限列表(不分页)
authRouter.get('/all_list', authController.getAllList);

// 获取树型权限
authRouter.get('/tree_list', authController.getTreeList);

// 新增权限
authRouter.post('/create', authController.create);

// 修改权限
authRouter.put('/update/:id', verifyProp, authController.update);

// 删除权限
authRouter.delete('/delete/:id', verifyProp, authController.delete);

// 获取该权限的子权限（只找一层）
authRouter.get('/get_child_auth/:id', authController.getChildAuth);

// 获取该权限的子权限（递归查找所有）
authRouter.get('/get_all_child_auth/:id', authController.getAllChildAuth);

// 获取某个用户的所有权限
authRouter.get('/get_user_auth/:id', authController.getUserAuth);

// 获取我的所有权限
authRouter.get('/get_my_auth', verifyProp, authController.getMyAuth);

export default authRouter;
