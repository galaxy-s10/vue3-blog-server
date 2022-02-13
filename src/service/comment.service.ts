import Sequelize from 'sequelize';
import commentModel from '@/model/comment.model';
import { IComment } from '@/interface';

import articleModel from '@/model/article.model';
import starModel from '@/model/star.model';
import userModel from '@/model/user.model';
import { handlePaging } from '@/utils';
import roleModel from '@/model/role.model';

const { Op, fn, col } = Sequelize;

class CommentService {
  /** 评论是否存在 */
  async isExist(theme_ids: number[]) {
    const res = await commentModel.findAll({
      where: {
        id: {
          [Op.or]: theme_ids,
        },
      },
    });
    return res.length === theme_ids.length;
  }

  /** 文章评论列表 */
  async getArticleCommentList({
    article_id,
    nowPage,
    pageSize,
    orderBy,
    orderName,
  }) {
    const offset = (parseInt(nowPage, 10) - 1) * parseInt(pageSize, 10);
    const limit = parseInt(pageSize, 10);
    const result = await commentModel.findAndCountAll({
      order: [[orderName, orderBy]],
      limit,
      offset,
      include: [
        {
          order: [['created_at', 'ASC']],
          model: commentModel,
          required: false,
          as: 'children_comment',
          include: [
            {
              model: starModel,
              required: false,
              include: [
                {
                  model: userModel,
                  attributes: { exclude: ['password', 'token'] },
                  as: 'from_user',
                },
                {
                  model: userModel,
                  attributes: { exclude: ['password', 'token'] },
                  as: 'to_user',
                },
              ],
            },
            {
              model: userModel,
              attributes: { exclude: ['password', 'token'] },
              as: 'from_user',
            },
            {
              model: userModel,
              attributes: { exclude: ['password', 'token'] },
              as: 'to_user',
            },
          ],
        },
        {
          model: userModel,
          attributes: { exclude: ['password', 'token'] },
          as: 'from_user',
        },
        {
          model: userModel,
          attributes: { exclude: ['password', 'token'] },
          as: 'to_user',
        },
        {
          model: starModel,
          // include: [
          //   {
          //     model: userModel,
          //     attributes: { exclude: ['password', 'token'] },
          //     as: 'from_user',
          //   },
          //   {
          //     model: userModel,
          //     attributes: { exclude: ['password', 'token'] },
          //     as: 'to_user',
          //   },
          // ],
          // where: {
          //   to_user_id: { [Op.ne]: -1 },
          // },
          // required: false,
        },
      ],
      distinct: true,
      where: {
        article_id,
      },
    });
    return handlePaging(nowPage, pageSize, result);
  }

  /** 留言板评论列表 */
  async getCommentList({
    childrenPageSize,
    nowPage,
    pageSize,
    orderBy,
    orderName,
  }) {
    const offset = (parseInt(nowPage, 10) - 1) * parseInt(pageSize, 10);
    const limit = parseInt(pageSize, 10);
    const result = await commentModel.findAndCountAll({
      order: [[orderName, orderBy]],
      limit,
      offset,
      include: [
        {
          model: commentModel,
          as: 'children_comment',
          include: [
            {
              model: starModel,
              // required: false,
              include: [
                {
                  model: userModel,
                  attributes: { exclude: ['password', 'token'] },
                  as: 'from_user',
                },
                {
                  model: userModel,
                  attributes: { exclude: ['password', 'token'] },
                  as: 'to_user',
                },
              ],
            },
            {
              model: userModel,
              attributes: { exclude: ['password', 'token'] },
              as: 'from_user',
              include: [{ model: roleModel }],
            },
            {
              model: userModel,
              attributes: { exclude: ['password', 'token'] },
              as: 'to_user',
              include: [{ model: roleModel }],
            },
          ],
          limit: parseInt(childrenPageSize, 10),
        },
        {
          model: userModel,
          attributes: { exclude: ['password', 'token'] },
          as: 'from_user',
          include: [{ model: roleModel }],
        },
        {
          model: userModel,
          attributes: { exclude: ['password', 'token'] },
          as: 'to_user',
          include: [{ model: roleModel }],
        },
        {
          model: starModel,
        },
      ],
      where: {
        article_id: -1,
        to_comment_id: -1,
      },
    });
    const total = await commentModel.count({
      where: {
        article_id: -1,
      },
    });
    return {
      ...handlePaging(nowPage, pageSize, result),
      total,
      childrenPageSize: parseInt(childrenPageSize, 10),
    };
  }

  /** 子级评论列表 */
  async getChildrenCommentList({
    article_id,
    to_comment_id,
    nowPage,
    pageSize,
    orderBy,
    orderName,
  }) {
    const offset = (parseInt(nowPage, 10) - 1) * parseInt(pageSize, 10);
    const limit = parseInt(pageSize, 10);
    const result = await commentModel.findAndCountAll({
      order: [[orderName, orderBy]],
      limit,
      offset,
      include: [
        {
          model: commentModel,
          // required: false,
          as: 'children_comment',
          include: [
            {
              model: starModel,
              // required: false,
              include: [
                {
                  model: userModel,
                  attributes: { exclude: ['password', 'token'] },
                  as: 'from_user',
                },
                {
                  model: userModel,
                  attributes: { exclude: ['password', 'token'] },
                  as: 'to_user',
                },
              ],
            },
            {
              model: userModel,
              attributes: { exclude: ['password', 'token'] },
              as: 'from_user',
              include: [{ model: roleModel }],
            },
            {
              model: userModel,
              attributes: { exclude: ['password', 'token'] },
              as: 'to_user',
              include: [{ model: roleModel }],
            },
          ],
          limit,
        },
        {
          model: userModel,
          attributes: { exclude: ['password', 'token'] },
          as: 'from_user',
          include: [{ model: roleModel }],
        },
        {
          model: userModel,
          attributes: { exclude: ['password', 'token'] },
          as: 'to_user',
          include: [{ model: roleModel }],
        },
        {
          model: starModel,
        },
      ],
      where: {
        article_id,
        to_comment_id,
      },
    });
    const total = await commentModel.count({
      where: {
        article_id: -1,
      },
    });
    return { ...handlePaging(nowPage, pageSize, result), total };
  }

  /** 查找评论 */
  async find(id: number) {
    const result = await commentModel.findOne({ where: { id } });
    return result;
  }

  /** 修改评论 */
  async update({
    id,
    article_id,
    from_user_id,
    to_user_id,
    to_comment_id,
    content,
  }: IComment) {
    const result = await commentModel.update(
      { article_id, from_user_id, to_user_id, to_comment_id, content },
      { where: { id } }
    );
    return result;
  }

  /** 创建评论 */
  async create({
    article_id,
    from_user_id,
    to_user_id,
    to_comment_id,
    content,
    ua,
    ip,
    ip_data,
  }: IComment) {
    const result = await commentModel.create({
      article_id,
      from_user_id,
      to_user_id,
      to_comment_id,
      content,
      ua,
      ip,
      ip_data,
    });
    return result;
  }

  /** 删除评论 */
  async delete(id: number) {
    const result = await commentModel.destroy({
      where: { id },
      individualHooks: true,
    });
    return result;
  }
}

export default new CommentService();
