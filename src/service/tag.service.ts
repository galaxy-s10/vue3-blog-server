import Sequelize from 'sequelize';

import { ITag } from '@/interface';
import articleModel from '@/model/article.model';
import commentModel from '@/model/comment.model';
import starModel from '@/model/star.model';
import tagModel from '@/model/tag.model';
import userModel from '@/model/user.model';
import { handlePaging } from '@/utils';

const { Op, fn, col, literal } = Sequelize;

class TagService {
  /** 标签是否存在 */
  async isExist(tag_ids: number[]) {
    const res = await tagModel.findAll({
      where: {
        id: {
          [Op.or]: tag_ids,
        },
      },
    });
    return res.length === tag_ids.length;
  }

  /** 获取标签列表 */
  async getList({ nowPage, pageSize, orderBy, orderName }) {
    const offset = (parseInt(nowPage, 10) - 1) * parseInt(pageSize, 10);
    const limit = parseInt(pageSize, 10);
    const result = await tagModel.findAndCountAll({
      order: [[orderName, orderBy]],
      limit,
      offset,
      include: [
        {
          model: articleModel,
          attributes: ['id'],
          through: { attributes: [] },
        },
      ],
      attributes: {
        include: [],
      },
    });
    result.rows.forEach((item) => {
      const v = item.get();
      v.article_total = v.articles.length;
      delete v.articles;
    });
    // const count = await tagModel.count();
    // const result = await tagModel.findAll({
    //   order: [[orderName, orderBy]],
    //   limit,
    //   offset,
    //   include: [
    //     { model: articleModel, attributes: [], through: { attributes: [] } },
    //   ],
    //   attributes: {
    //     include: [
    //       [literal(`(select count(distinct articles.id))`), 'article_total'],
    //     ],
    //     // include: [
    //     //   [
    //     //     literal(`(select count(*) from article_tag where article_id = id)`),
    //     //     'article_total',
    //     //   ],
    //     // ],
    //   },
    //   group: ['id'],
    //   subQuery: false,
    // });
    return handlePaging(nowPage, pageSize, result);
  }

  /** 获取标签文章列表 */
  async getArticleList({ tag_id, nowPage, pageSize }) {
    const offset = (parseInt(nowPage, 10) - 1) * parseInt(pageSize, 10);
    const limit = parseInt(pageSize, 10);
    const inst = await tagModel.findOne({ where: { id: tag_id } });
    // @ts-ignore
    const count = await inst.countArticles();
    // @ts-ignore
    const result = await inst.getArticles({
      limit,
      offset,
      include: [
        {
          model: tagModel,
          through: {
            attributes: [],
          },
        },
        {
          model: commentModel,
          attributes: ['id'],
        },
        { model: starModel, attributes: ['id'] },
        {
          attributes: { exclude: ['password', 'token'] },
          model: userModel,
          through: {
            attributes: [],
          },
        },
      ],
      attributes: {
        exclude: ['content'],
      },
    });
    result.forEach((item) => {
      const v = item.get();
      v.star_total = v.stars.length;
      v.comment_total = v.comments.length;
      delete v.stars;
      delete v.comments;
    });
    return handlePaging(nowPage, pageSize, { rows: result, count });
  }

  /** 查找标签 */
  async find(id: number) {
    const result = await tagModel.findOne({ where: { id } });
    return result;
  }

  /** 修改标签 */
  async update({ id, name, color }: ITag) {
    const result = await tagModel.update({ name, color }, { where: { id } });
    return result;
  }

  /** 创建标签 */
  async create({ name, color }: ITag) {
    const result = await tagModel.create({ name, color });
    return result;
  }

  /** 删除标签 */
  async delete(id: number) {
    const result = await tagModel.destroy({
      where: { id },
      individualHooks: true,
    });
    return result;
  }
}

export default new TagService();
