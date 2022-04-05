import Router from 'koa-router';

import roleController from '@/controller/role.controller';
import { verifyProp } from '@/middleware/role.middleware';

const roleRouter = new Router({ prefix: '/role' });

// 角色列表
roleRouter.get('/list', roleController.getList);

// 创建角色
roleRouter.post('/create', verifyProp, roleController.create);

// 更新角色
roleRouter.put('/update/:id', verifyProp, roleController.update);

// 查找角色
roleRouter.get('/find/:id', roleController.find);

// 删除角色
roleRouter.delete('/delete/:id', roleController.delete);

// 获取该权限的所有子权限
roleRouter.get('/get_all_child_role/:id', roleController.getAllChildRole);

// 获取我的角色
roleRouter.get('/get_my_role', roleController.getMyRole);

// 获取某个用户的所有角色
roleRouter.get('/get_user_role/:id', roleController.getUserRole);

export default roleRouter;
