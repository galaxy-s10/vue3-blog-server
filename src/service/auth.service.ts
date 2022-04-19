import Sequelize from 'sequelize';

import { IAuth } from '@/interface';
import authModel from '@/model/auth.model';
import { handlePaging } from '@/utils';

const { Op } = Sequelize;
class AuthService {
  /** 权限是否存在 */
  async isExist(ids: number[]) {
    const res = await authModel.count({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res === ids.length;
  }

  /** 获取权限列表(分页) */
  async getList({ nowPage, pageSize, orderBy, orderName }) {
    const offset = (parseInt(nowPage, 10) - 1) * parseInt(pageSize, 10);
    const limit = parseInt(pageSize, 10);
    const result = await authModel.findAndCountAll({
      order: [[orderName, orderBy]],
      limit,
      offset,
      distinct: true,
    });
    return handlePaging(nowPage, pageSize, result);
  }

  /** 获取权限列表(不分页) */
  async getAllList() {
    const result = await authModel.findAndCountAll();
    return result;
  }

  /** 获取所有p_id不为null的权限 */
  async getPidNotNullAuth() {
    const result = await authModel.findAndCountAll({
      where: {
        p_id: {
          [Op.not]: null, // IS NOT NULL
          // [Op.not]: true, // IS NOT TRUE
        },
      },
    });
    return result;
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

  /** 查找id为[a,b,c....]的权限 */
  async findAllByInId(ids: number[]) {
    const result = await authModel.findAll({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return result;
  }

  /** 根据p_id查找权限 */
  async findByPid(p_id: number) {
    const result = await authModel.findAll({
      where: {
        p_id,
      },
    });
    return result;
  }

  /** 修改权限 */
  async update({ id, p_id, auth_name, auth_value, type, priority }: IAuth) {
    const result = await authModel.update(
      {
        p_id,
        auth_name,
        auth_value,
        type,
        priority,
      },
      {
        where: {
          id,
        },
      }
    );
    return result;
  }

  /** 修改权限 */
  async updateMany(ids: number[], p_id: number) {
    const result = await authModel.update(
      {
        p_id,
      },
      {
        where: {
          id: {
            [Op.in]: ids,
          },
        },
      }
    );
    return result;
  }

  async findAllChildren(id: number) {
    const result = await authModel.findAll({
      where: {
        p_id: id,
      },
    });
    return result;
  }

  /** 创建权限 */
  async create({ p_id, auth_name, auth_value, type, priority }: IAuth) {
    const result = await authModel.create({
      p_id,
      auth_name,
      auth_value,
      type,
      priority,
    });
    return result;
  }

  /** 删除权限 */
  async delete(ids: number[]) {
    const result = await authModel.destroy({
      where: {
        id: {
          [Op.in]: ids, // [Op.in]的话，ids是[]，就一个也不会删。如果是[Op.or]，ids是[]，就会删除所有。
        },
      },
    });
    return result;
  }
}

export default new AuthService();
