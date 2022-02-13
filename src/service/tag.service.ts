import Sequelize from 'sequelize';

import { ITag } from '@/interface';
import articleModel from '@/model/article.model';
import commentModel from '@/model/comment.model';
import starModel from '@/model/star.model';
import tagModel from '@/model/tag.model';
import userModel from '@/model/user.model';
import { handlePaging } from '@/utils';

const { Op } = Sequelize;

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
      include: [{ model: articleModel }],
    });
    return handlePaging(nowPage, pageSize, result);
  }

  /** 获取标签文章列表 */
  async getArticleList({ tag_id, nowPage, pageSize }) {
    const offset = (parseInt(nowPage, 10) - 1) * parseInt(pageSize, 10);
    const limit = parseInt(pageSize, 10);
    const result = await articleModel.findAndCountAll({
      include: [
        {
          model: tagModel,
          where: { id: tag_id },
        },
        {
          model: commentModel,
        },
        {
          model: starModel,
          where: {
            to_user_id: -1,
          },
          required: false,
        },
        {
          attributes: { exclude: ['password', 'token'] },
          model: userModel,
        },
        {
          model: commentModel,
        },
      ],
      limit,
      offset,
      distinct: true,
    });
    return handlePaging(nowPage, pageSize, result);
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
