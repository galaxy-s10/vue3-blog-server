import Router from 'koa-router';

import roleController from '@/controller/role.controller';
import { verifyProp } from '@/middleware/role.middleware';

const roleRouter = new Router({ prefix: '/role' });

// 角色列表
roleRouter.get('/list', roleController.getList);

// 创建角色
roleRouter.post('/create', verifyProp, roleController.create);

// 查找角色
roleRouter.get('/find/:id', roleController.find);

// 更新角色
roleRouter.put('/update/:id', verifyProp, roleController.update);

// 删除角色
roleRouter.delete('/delete/:id', roleController.delete);

export default roleRouter;
