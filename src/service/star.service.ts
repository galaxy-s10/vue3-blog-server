import Sequelize from 'sequelize';
import starModel from '@/model/star.model';
import { IStar } from '@/interface';
import commentModel from '@/model/comment.model';
import userModel from '@/model/user.model';
import articleModel from '@/model/article.model';
import { handlePaging } from '@/utils';

const { Op } = Sequelize;

class StarService {
  /** star是否存在 */
  async isExist(star_ids: number[]) {
    const res = await starModel.findAll({
      where: {
        id: {
          [Op.or]: star_ids,
        },
      },
    });
    return res.length === star_ids.length;
  }

  /** 获取star列表 */
  async getList({ nowPage, pageSize, orderBy, orderName }) {
    const offset = (parseInt(nowPage, 10) - 1) * parseInt(pageSize, 10);
    const limit = parseInt(pageSize, 10);
    const result = await starModel.findAndCountAll({
      include: [
        {
          model: userModel,
          as: 'from_user',
          attributes: { exclude: ['password', 'token'] },
        },
        {
          model: userModel,
          as: 'to_user',
          attributes: { exclude: ['password', 'token'] },
        },
        {
          model: articleModel,
        },
        {
          model: commentModel,
        },
      ],
      order: [[orderName, orderBy]],
      limit,
      offset,
    });
    return handlePaging(nowPage, pageSize, result);
  }

  /** 查找star */
  async find(id: number) {
    const result = await starModel.findOne({ where: { id } });
    return result;
  }

  /** 修改star */
  async update({
    id,
    article_id,
    to_user_id,
    from_user_id,
    comment_id,
  }: IStar) {
    const result = await starModel.update(
      { article_id, to_user_id, from_user_id, comment_id },
      { where: { id } }
    );
    return result;
  }

  /** 创建star */
  async create({ article_id, to_user_id, from_user_id, comment_id }: IStar) {
    const result = await starModel.create({
      article_id,
      to_user_id,
      from_user_id,
      comment_id,
    });
    return result;
  }

  /** 删除star */
  async delete(id: number) {
    const result = await starModel.destroy({
      where: { id },
      individualHooks: true,
    });
    return result;
  }
}

export default new StarService();
