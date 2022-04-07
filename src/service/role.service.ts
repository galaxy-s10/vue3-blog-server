import Sequelize from 'sequelize';

import { IRole } from '@/interface';
import roleModel from '@/model/role.model';
import userModel from '@/model/user.model';
import { handlePaging } from '@/utils';

const { Op } = Sequelize;
class RoleService {
  /** 角色是否存在 */
  async isExist(role_ids: number[]) {
    const res = await roleModel.findAll({
      where: {
        id: {
          [Op.or]: role_ids,
        },
      },
    });
    return res.length === role_ids.length;
  }

  /** 获取角色列表(分页) */
  async getList({ nowPage, pageSize, orderBy, orderName }) {
    const offset = (parseInt(nowPage, 10) - 1) * parseInt(pageSize, 10);
    const limit = parseInt(pageSize, 10);
    const result = await roleModel.findAndCountAll({
      order: [[orderName, orderBy]],
      limit,
      offset,
      distinct: true,
    });
    return handlePaging(nowPage, pageSize, result);
  }

  /** 获取角色列表(不分页) */
  async getAllList() {
    const result = await roleModel.findAndCountAll();
    return result;
  }

  /** 查找角色 */
  async find(id: number) {
    const result = await roleModel.findOne({
      where: {
        id,
      },
    });
    return result;
  }

  /** 根据p_id查找权限 */
  async findByPid(p_id: number) {
    const result = await roleModel.findAll({
      where: {
        p_id,
      },
    });
    return result;
  }

  /** 根据角色id查找对应的权限 */
  async getRoleAuth(id: number) {
    const role: any = await roleModel.findByPk(id);
    const auths = await role.getAuths();
    const result = [];
    auths.forEach((v) => {
      const obj = v.get();
      delete obj.role_auth;
      result.push(obj);
    });
    return result;
  }

  /** 获取我的角色 */
  async getMyRole(id: number) {
    // const user = await userModel.findOne({ where: { id } });
    const user: any = await userModel.findByPk(id);
    if (!user) {
      throw new Error(`不存在id为${id}的用户!`);
    }
    const roles: any[] = await user.getRoles();
    const result = [];
    roles.forEach((v) => {
      const obj = v.get();
      delete obj.user_role;
      result.push(obj);
    });
    return result;
  }

  /** 修改角色 */
  async update({ id, p_id, role_name, role_description }: IRole) {
    if (id === p_id) throw new Error(`id不能等于p_id!`);
    if (p_id === 0) {
      const result = await roleModel.update(
        {
          p_id,
          role_name,
          role_description,
        },
        {
          where: {
            id,
          },
        }
      );
      return result;
    }
    const result = await roleModel.update(
      {
        p_id,
        role_name,
        role_description,
      },
      {
        where: {
          id,
        },
      }
    );
    return result;
  }

  async findAllChildren(id: number) {
    const result = await roleModel.findAll({
      where: {
        p_id: id,
      },
    });
    return result;
  }

  /** 创建角色 */
  async create({ p_id, role_name, role_description }: IRole) {
    const result = await roleModel.create({
      p_id,
      role_name,
      role_description,
    });
    return result;
  }

  /** 删除角色 */
  async delete(id: number) {
    const result = await roleModel.destroy({
      where: {
        id,
      },
      individualHooks: true,
    });
    return result;
  }
}

export default new RoleService();
