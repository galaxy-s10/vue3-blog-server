import Sequelize from 'sequelize';

import { authJwt } from '@/app/authJwt';
import { IComment } from '@/interface';
import articleModel from '@/model/article.model';
import commentModel from '@/model/comment.model';
import roleModel from '@/model/role.model';
import starModel from '@/model/star.model';
import userModel from '@/model/user.model';
import { handlePaging } from '@/utils';

const { Op, fn, col, literal } = Sequelize;

class CommentService {
  /** 评论是否存在 */
  async isExist(comment_ids: number[]) {
    const res = await commentModel.findAll({
      where: {
        id: {
          [Op.or]: comment_ids,
        },
      },
    });
    return res.length === comment_ids.length;
  }

  /** 文章评论列表 */
  async getArticleCommentList({
    article_id,
    nowPage,
    pageSize,
    orderBy,
    orderName,
    from_user_id,
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
              // as: 'all_star',

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
          include: [
            {
              model: roleModel,
              through: { attributes: [] },
            },
          ],
        },
        {
          model: userModel,
          attributes: { exclude: ['password', 'token'] },
          as: 'to_user',
        },
      ],
      distinct: true,
      where: {
        article_id,
      },
      // attributes: {
      //   include: [
      //     [
      //       literal(
      //         `(select count(*) from star where comment_id = comment.id)`
      //       ),
      //       'star_total',
      //     ],
      //     [
      //       literal(
      //         `(select count(*) from star where comment_id = comment.id and from_user_id = ${from_user_id})`
      //       ),
      //       'is_star',
      //     ],
      //   ],
      // },
    });
    const total = await commentModel.count({
      where: {
        article_id,
      },
    });
    const promiseTotalRes = [];
    result.rows.forEach((v) => {
      promiseTotalRes.push(
        new Promise((resolve) => {
          // @ts-ignore
          starModel
            .count({
              where: {
                article_id,
                comment_id: v.id,
                to_user_id: v.from_user_id,
              },
            })
            .then((res) => {
              // @ts-ignore
              resolve({ res, comment_id: v.id });
            });
        }),
        new Promise((resolve) => {
          // @ts-ignore
          starModel
            .count({
              where: {
                article_id,
                comment_id: v.id,
                from_user_id,
              },
            })
            .then((res) => {
              // @ts-ignore
              resolve({ res, comment_id: v.id, judgeStar: true });
            });
        })
      );
    });
    const totalRes = await Promise.all(promiseTotalRes);
    const lastRes = [];
    result.rows.forEach((v) => {
      const obj = {
        ...v.get(),
        // @ts-ignore
        star_total: totalRes.find((x) => !x.judgeStar && x.comment_id === v.id)
          .res,
        // @ts-ignore
        is_star: totalRes.find((x) => x.judgeStar && x.comment_id === v.id).res,
      };
      lastRes.push(obj);
    });
    console.log(lastRes, 22222222211);
    return {
      ...handlePaging(nowPage, pageSize, { ...result, rows: lastRes }),
      total,
    };
  }

  /** 留言板评论列表 */
  async getCommentList({
    article_id,
    childrenPageSize,
    nowPage,
    pageSize,
    orderBy,
    orderName,
    from_user_id,
  }) {
    const offset = (parseInt(nowPage, 10) - 1) * parseInt(pageSize, 10);
    const limit = parseInt(pageSize, 10);
    const startTime = +new Date();
    const result: any = await commentModel.findAndCountAll({
      order: [[orderName, orderBy]],
      limit,
      offset,
      include: [
        {
          model: starModel,
          attributes: ['id'],
        },
        {
          model: starModel,
          as: 'is_star',
          attributes: ['id'],
          where: {
            from_user_id,
          },
          required: false,
        },
        {
          model: commentModel,
          as: 'children_comment',
          attributes: {
            include: [],
          },
          include: [
            {
              model: starModel,
              attributes: ['id'],
            },
            {
              model: starModel,
              as: 'is_star',
              attributes: ['id'],
            },
            {
              model: userModel,
              attributes: {
                exclude: ['password', 'token'],
              },
              as: 'from_user',
            },
            {
              model: userModel,
              attributes: {
                exclude: ['password', 'token'],
              },
              as: 'to_user',
            },
            {
              model: commentModel,
              as: 'reply_comment',
              paranoid: false,
            },
          ],
          limit: parseInt(childrenPageSize, 10),
          order: [[orderName, orderBy]],
        },
        {
          model: userModel,
          attributes: {
            exclude: ['password', 'token'],
          },
          as: 'from_user',
          include: [
            {
              model: roleModel,
              through: { attributes: [] },
            },
          ],
        },
        {
          model: userModel,
          attributes: {
            exclude: ['password', 'token'],
          },
          as: 'to_user',
          include: [
            {
              model: roleModel,
              through: { attributes: [] },
            },
          ],
        },
      ],
      where: {
        article_id,
        parent_comment_id: -1,
      },
      attributes: {
        include: [],
      },
      distinct: true,
    });
    const total = await commentModel.count({
      where: {
        article_id,
      },
    });
    const sql_duration = +new Date() - startTime;
    result.rows.forEach((item) => {
      const v = item.get();
      v.star_total = v.stars.length;
      v.is_star = v.is_star !== null;
      delete v.stars;
      item.children_comment.forEach((child) => {
        const children = child.get();
        children.is_star = children.is_star !== null;
        delete children.stars;
      });
    });
    return {
      ...handlePaging(nowPage, pageSize, { ...result }),
      total,
      childrenPageSize: parseInt(childrenPageSize, 10),
      sql_duration,
    };
  }

  /** 子级评论列表 */
  async getChildrenCommentList({
    nowPage,
    pageSize,
    orderBy,
    orderName,
    from_user_id,
    parent_comment_id,
    article_id,
  }) {
    const offset = (parseInt(nowPage, 10) - 1) * parseInt(pageSize, 10);
    const limit = parseInt(pageSize, 10);
    const startTime = +new Date();
    const result = await commentModel.findAndCountAll({
      order: [[orderName, orderBy]],
      limit,
      offset,
      include: [
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
          as: 'is_star',
          attributes: ['id'],
          where: {
            from_user_id,
          },
          required: false,
        },
      ],
      where: {
        article_id,
        parent_comment_id,
      },
    });
    const total = await commentModel.count({
      where: {
        article_id: -1,
        parent_comment_id,
      },
    });
    const sql_duration = +new Date() - startTime;

    result.rows.forEach((item) => {
      const v = item.get();
      v.is_star = v.is_star !== null;
      delete v.stars;
    });
    return { ...handlePaging(nowPage, pageSize, result), total, sql_duration };
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
    parent_comment_id,
    content,
  }: IComment) {
    const result = await commentModel.update(
      { article_id, from_user_id, to_user_id, parent_comment_id, content },
      { where: { id } }
    );
    return result;
  }

  /** 创建评论 */
  async create({
    article_id,
    from_user_id,
    to_user_id,
    parent_comment_id,
    reply_comment_id,
    content,
    ua,
    ip,
    ip_data,
  }: IComment) {
    const result = await commentModel.create({
      article_id,
      from_user_id,
      to_user_id,
      parent_comment_id,
      reply_comment_id,
      content,
      ua,
      ip,
      ip_data,
    });
    if (parent_comment_id !== -1) {
      const total = await commentModel.count({
        where: { parent_comment_id },
      });
      await commentModel.update(
        // 如果新增的评论是在子评论，则需要将父评论的children_comment_total
        // { children_comment_total: literal('`children_comment_total` +1') },
        { children_comment_total: total },
        {
          where: { id: parent_comment_id },
          silent: true, // silent如果为true，则不会更新updateAt时间戳。
        }
      );
    }

    return result;
  }

  /** 删除评论 */
  async delete(id: number) {
    const res: any = await this.find(id);
    const result = await commentModel.destroy({
      where: { id },
      individualHooks: true,
    });
    if (res.parent_comment_id !== -1) {
      const total = await commentModel.count({
        where: { parent_comment_id: res.parent_comment_id },
      });
      await commentModel.update(
        // 如果删除的是父评论下面的子评论，则需要将父评论的children_comment_total-1
        // { children_comment_total: literal('`children_comment_total` -1') },
        { children_comment_total: total },
        {
          where: { id: res.parent_comment_id },
          silent: true, // silent如果为true，则不会更新updateAt时间戳。
        }
      );
    }
    console.log(res, 2222222);
    return result;
  }
}

export default new CommentService();
