import Sequelize from 'sequelize';

import { IAuth } from '@/interface';
import authModel from '@/model/auth.model';
import RoleModel from '@/model/role.model';
import userRoleModel from '@/model/userRole.model';
import { handlePaging } from '@/utils';

const { Op } = Sequelize;
class AuthService {
  /** 权限是否存在 */
  async isExist(auth_ids: number[]) {
    const res = await authModel.findAll({
      where: {
        id: {
          [Op.or]: auth_ids,
        },
      },
    });
    return res.length === auth_ids.length;
  }

  /** 获取权限列表 */
  async getList({ nowPage, pageSize, orderBy, orderName }) {
    const offset = (parseInt(nowPage, 10) - 1) * parseInt(pageSize, 10);
    const limit = parseInt(pageSize, 10);
    const result = await authModel.findAndCountAll({
      order: [[orderName, orderBy]],
      limit,
      offset,
    });
    return handlePaging(nowPage, pageSize, result);
  }

  /** 获取嵌套权限列表 */
  async getNestList() {
    const { count, rows } = await authModel.findAndCountAll({
      include: [
        {
          model: authModel,
          as: 'auth_children',
        },
      ],
      distinct: true,
    });
    return {
      count,
      rows,
    };
  }

  /** 获取用户权限 */
  async getUserAuth(id: number) {
    const { count, rows } = await userRoleModel.findAndCountAll({
      include: [
        {
          model: RoleModel,
          include: [
            {
              model: authModel,
              through: {
                attributes: [],
              },
            },
          ],
        },
      ],
      where: {
        user_id: id,
      },
      distinct: true,
    });
    return {
      count,
      rows,
    };
  }

  /** 查找权限 */
  async find(id: number) {
    const result = await authModel.findOne({
      where: {
        id,
      },
    });
    return result;
  }

  /** 修改权限 */
  async update({ id, p_id, auth_name, auth_description }: IAuth) {
    console.log(id, p_id, auth_name, auth_description, 3223223);
    if (id === p_id) throw new Error(`id不能等于p_id!`);
    if (p_id === 0) {
      const result = await authModel.update(
        {
          p_id,
          auth_name,
          auth_description,
        },
        {
          where: {
            id,
          },
        }
      );
      return result;
    }
    const idAuth = await this.isExist([p_id]);
    if (!idAuth) throw new Error(`id为${p_id}的权限不存在!`);
    const result = await authModel.update(
      {
        p_id,
        auth_name,
        auth_description,
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
  async create({ p_id, auth_name, auth_description }: IAuth) {
    if (p_id !== 0) {
      const result = await authModel.findOne({
        where: {
          id: p_id,
        },
      });
      if (!result) throw new Error(`id为${p_id}的权限不存在!`);
    }
    const result = await authModel.create({
      p_id,
      auth_name,
      auth_description,
    });
    return result;
  }

  /** 删除权限 */
  async delete(id: number) {
    const result = await authModel.destroy({
      where: {
        id,
      },
      individualHooks: true,
    });
    return result;
  }
}

export default new AuthService();
