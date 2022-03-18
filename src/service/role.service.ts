import Sequelize from 'sequelize';

import { IRole } from '@/interface';
import authModel from '@/model/auth.model';
import roleModel from '@/model/role.model';
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
      include: [
        {
          model: authModel,
        },
      ],
      order: [[orderName, orderBy]],
      limit,
      offset,
      distinct: true,
    });
    return handlePaging(nowPage, pageSize, result);
  }

  /** 查找权限 */
  async find(id: number) {
    const result = await roleModel.findOne({
      where: {
        id,
      },
    });
    return result;
  }

  /** 修改权限 */
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

  /** 创建权限 */
  async create({ p_id, role_name, role_description }: IRole) {
    const result = await roleModel.create({
      p_id,
      role_name,
      role_description,
    });
    return result;
  }

  /** 删除权限 */
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
