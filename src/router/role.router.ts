import Router from 'koa-router';

import roleController from '@/controller/role.controller';
import { verifyProp } from '@/middleware/role.middleware';

const roleRouter = new Router({ prefix: '/role' });

// 角色列表（分页）
roleRouter.get('/list', roleController.getList);

// 所有角色列表（不分页）
roleRouter.get('/all_list', roleController.getAllList);

// 获取所有角色（树型）
roleRouter.get('/get_tree_role', roleController.getTreeRole);

// 获取除了父级以外的所有角色（树型）
roleRouter.get('/get_tree_child_role', roleController.getTreeChildRole);

// 给某角色设置多一类角色
roleRouter.put('/set_add_child_role', roleController.setAddChildRoles);

// 批量删除子角色
roleRouter.delete(
  '/delete_child_roles',
  verifyProp,
  roleController.deleteChildRoles
);

// 创建角色
roleRouter.post('/create', verifyProp, roleController.create);

// 更新角色
roleRouter.put('/update/:id', verifyProp, roleController.update);

// 查找角色
roleRouter.get('/find/:id', roleController.find);

// 删除角色
roleRouter.delete('/delete/:id', roleController.delete);

// 获取该角色的子角色（只找一层）
roleRouter.get('/get_child_role/:id', roleController.getChildRole);

// 获取该角色的子角色（递归查找所有）
roleRouter.get('/get_all_child_role/:id', roleController.getAllChildRole);

// 获取某个用户的角色（只找一层）
roleRouter.get('/get_user_role/:user_id', roleController.getUserRole);

// 获取某个用户的角色（递归找所有）
roleRouter.get('/get_user_all_role/:user_id', roleController.getUserAllRole);

// 获取我的角色（只找一层）
roleRouter.get('/get_my_role', roleController.getMyRole);

// 获取我的角色（递归找所有）
roleRouter.get('/get_my_all_role', roleController.getMyAllRole);

// 获取某个角色的权限（只找一层）
roleRouter.get('/get_role_auth/:id', roleController.getRoleAuth);

// 获取某个角色的权限（递归找所有）
roleRouter.get('/get_all_role_auth/:id', roleController.getAllRoleAuth);

// 修改某个角色的权限
roleRouter.put('/update_role_auth', roleController.updateRoleAuth);

export default roleRouter;
