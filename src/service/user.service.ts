import Sequelize from 'sequelize';

import { IUserList } from '@/controller/user.controller';
import { IUser } from '@/interface';
import qqUserModel from '@/model/qqUser.model';
import userModel from '@/model/user.model';
import { handlePaging } from '@/utils';
import articleModel from '@/model/article.model';
import starModel from '@/model/star.model';
import commentModel from '@/model/comment.model';
import roleModel from '@/model/role.model';
import githubUserModel from '@/model/githubUser.model';

const { Op, where, literal } = Sequelize;

class UserService {
  /** 用户是否存在 */
  async isExist(user_ids: number[]) {
    const res = await userModel.findAll({
      where: {
        id: {
          [Op.or]: user_ids,
        },
      },
    });
    return res.length === user_ids.length;
  }

  /** 获取用户列表 */
  async getList({
    username,
    title,
    nowPage,
    pageSize,
    orderBy,
    orderName,
    created_at,
    updated_at,
  }: IUserList) {
    const offset = (parseInt(nowPage, 10) - 1) * parseInt(pageSize, 10);
    const limit = parseInt(pageSize, 10);
    const where1: any = {};
    const where2 = [];
    if (created_at) {
      where1.created_at = {
        [Op.between]: [created_at, `${created_at} 23:59:59`],
      };
    }
    if (updated_at) {
      where1.updated_at = {
        [Op.between]: [updated_at, `${updated_at} 23:59:59`],
      };
    }
    if (username) {
      where2.push({
        username: {
          [Op.like]: `%${username}%`,
        },
      });
    }
    if (title) {
      where2.push({
        title: {
          [Op.like]: `%${title}%`,
        },
      });
    }
    const result = await userModel.findAndCountAll({
      include: [
        {
          model: qqUserModel,
        },
      ],
      attributes: {
        exclude: ['password', 'token'],
      },
      order: [[orderName, orderBy]],
      limit,
      offset,
      where: {
        ...where1,
        ...where2,
      },
      distinct: true,
    });
    return handlePaging(nowPage, pageSize, result);
  }

  /** 查找用户 */
  async find(id: number) {
    const result = await userModel.findOne({
      include: [
        {
          model: qqUserModel,
        },
      ],
      attributes: {
        exclude: ['password', 'token'],
      },
      where: { id },
    });
    return result;
  }

  /** 获取用户信息 */
  async getUserInfo(id: number) {
    const result = await userModel.findOne({
      include: [
        {
          model: qqUserModel,
        },
        {
          model: githubUserModel,
        },
        {
          model: articleModel,
        },
        {
          model: commentModel,
        },
        {
          model: starModel,
        },
        {
          model: roleModel,
        },
      ],
      attributes: {
        exclude: ['password', 'token'],
      },
      where: { id },
    });
    return result;
  }

  /** 是否同名,同名则返回用户的信息,否则返回false */
  async isSameName(username: string) {
    const result = await userModel.findOne({
      where: {
        username: where(literal(`BINARY username`), username),
      },
    });
    return result || false;
  }

  /** 修改用户 */
  async update({
    id,
    username,
    password,
    title,
    status,
    avatar,
    token,
  }: IUser) {
    const result = await userModel.update(
      { username, password, title, status, avatar, token },
      { where: { id } }
    );
    return result;
  }

  /** 创建用户 */
  async create({ username, password, title, avatar }: IUser) {
    const result = await userModel.create({
      username,
      password,
      title,
      avatar,
    });
    result.setRoles([2]);
    return result;
  }

  /** 删除用户 */
  async delete(id: number) {
    const result = await userModel.destroy({
      where: { id },
      individualHooks: true,
    });
    return result;
  }
}

export default new UserService();
