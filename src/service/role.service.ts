import Sequelize from 'sequelize';

import { IRole } from '@/interface';
import authModel from '@/model/auth.model';
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

  /** 获取角色列表 */
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

  /** 查找角色 */
  async find(id: number) {
    const result = await roleModel.findOne({
      where: {
        id,
      },
    });
    return result;
  }

  /** 获取我的角色 */
  async getMyRole(id: number) {
    const result = await userModel.findOne({
      include: [
        {
          model: roleModel,
          through: {
            attributes: [],
          },
        },
      ],
      attributes: {
        exclude: ['password', 'token'],
      },
      where: {
        id,
      },
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
    const result = await roleModel.findOne({
      include: [{ model: roleModel, as: 'c_role' }],
      where: {
        id,
      },
    });
    return result.get();
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
