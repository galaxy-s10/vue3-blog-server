import Sequelize from 'sequelize';

import { THIRD_PLATFORM, PROJECT_ENV } from '@/constant';
import { IUser, IList } from '@/interface';
import articleModel from '@/model/article.model';
import commentModel from '@/model/comment.model';
import emailModel from '@/model/emailUser.model';
import githubUserModel from '@/model/githubUser.model';
import qqUserModel from '@/model/qqUser.model';
import roleModel from '@/model/role.model';
import starModel from '@/model/star.model';
import userModel from '@/model/user.model';
import { handlePaging } from '@/utils';

interface ISearch extends IUser, IList {}

const { Op, where, literal } = Sequelize;

class UserService {
  /** 用户是否存在 */
  async isExist(ids: number[]) {
    const res = await userModel.count({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res === ids.length;
  }

  async login(id: number, password: string) {
    const result = await userModel.findOne({
      attributes: {
        exclude: ['password', 'token'],
      },
      where: {
        id,
        password,
      },
    });
    return result;
  }

  /** 获取用户列表 */
  async getList({
    id,
    keyWord,
    nowPage,
    pageSize,
    orderBy,
    orderName,
  }: ISearch) {
    const offset = (parseInt(nowPage, 10) - 1) * parseInt(pageSize, 10);
    const limit = parseInt(pageSize, 10);
    const allWhere: any = {};
    if (id) {
      allWhere.id = +id;
    }
    if (keyWord) {
      const keyWordWhere = [
        {
          username: {
            [Op.like]: `%${keyWord}%`,
          },
        },
        {
          desc: {
            [Op.like]: `%${keyWord}%`,
          },
        },
      ];
      allWhere[Op.or] = keyWordWhere;
    }

    const result = await userModel.findAndCountAll({
      attributes: {
        exclude: ['password', 'token'],
      },
      order: [[orderName, orderBy]],
      limit,
      offset,
      where: {
        ...allWhere,
      },
      distinct: true,
    });
    return handlePaging(nowPage, pageSize, result);
  }

  /** 根据id查找用户 */
  async find(id: number) {
    const result = await userModel.findOne({
      include: [
        {
          model: qqUserModel,
          through: {
            attributes: ['third_platform'],
            where: {
              third_platform: THIRD_PLATFORM.qq_admin,
            },
          },
        },
        {
          model: githubUserModel,
          through: {
            attributes: ['third_platform'],
            where: {
              third_platform: THIRD_PLATFORM.github,
            },
          },
        },
        {
          model: emailModel,
          through: {
            attributes: [],
            where: {
              third_platform: THIRD_PLATFORM.email,
            },
          },
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
    const userInfo: any = await userModel.findOne({
      include: [
        {
          model: qqUserModel,
          through: {
            attributes: ['third_platform'],
            where: {
              third_platform: THIRD_PLATFORM.qq_admin,
            },
          },
        },
        {
          model: githubUserModel,
          through: {
            attributes: ['third_platform'],
            where: {
              third_platform: THIRD_PLATFORM.github,
            },
          },
        },
        {
          model: emailModel,
          through: {
            attributes: [],
            where: {
              third_platform: THIRD_PLATFORM.email,
            },
          },
        },
        {
          model: roleModel,
          through: { attributes: [] },
        },
      ],
      attributes: {
        exclude: ['password', 'token'],
        include: [
          // [
          //   literal(
          //     `(select count(*) from comment where from_user_id = ${id})`
          //   ),
          //   'comment_total',
          // ],
          // [
          //   literal(`(select count(*) from star where to_user_id = ${id})`),
          //   'receive_star_total',
          // ],
        ],
      },
      where: { id },
    });
    const userArticlePromise = userModel.count({
      include: [{ model: articleModel }],
      where: { id },
    });
    const userSendCommentPromise = userModel.count({
      include: [{ model: commentModel, as: 'send_comments' }],
      where: { id },
    });
    const userReceiveCommentPromise = userModel.count({
      include: [{ model: commentModel, as: 'receive_comments' }],
      where: { id },
    });
    const userSendStarPromise = userModel.count({
      include: [{ model: starModel, as: 'send_stars' }],
      where: { id },
    });
    const userReceiveStarPromise = userModel.count({
      include: [{ model: starModel, as: 'receive_stars' }],
      where: { id },
    });
    const [
      userSendComment,
      userReceiveComment,
      userSendStar,
      userReceiveStar,
      userArticle,
    ] = await Promise.all([
      userSendCommentPromise,
      userReceiveCommentPromise,
      userSendStarPromise,
      userReceiveStarPromise,
      userArticlePromise,
    ]);
    const result = userInfo.get();
    result.send_comments_total = userSendComment;
    result.receive_comments_total = userReceiveComment;
    result.send_stars_total = userSendStar;
    result.receive_stars_total = userReceiveStar;
    result.articles_total = userArticle;
    return result;
  }

  /** 是否同名，区分大小写。同名则返回同名用户的信息,否则返回false */
  async isSameName(username: string) {
    const result = await userModel.findOne({
      attributes: {
        exclude: ['password', 'token'],
      },
      where: {
        username: where(literal(`BINARY username`), username),
      },
    });
    return result || false;
  }

  /** 根据id修改用户 */
  async update({ id, username, desc, status, avatar, token }: IUser) {
    const result = await userModel.update(
      { username, desc, status, avatar, token },
      { where: { id } }
    );
    return result;
  }

  /** 创建用户 */
  async create(props: IUser) {
    // @ts-ignore
    const result: any = await userModel.create(props);
    if (PROJECT_ENV === 'prod') {
      // 生产环境注册用户权限就是SVIP用户
      await result.setRoles([5]);
    } else {
      // 非生产环境注册用户权限就是SUPER_ADMIN管理员
      await result.setRoles([2, 3]);
    }
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
