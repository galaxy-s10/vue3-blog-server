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
  async create({
    article_id = -1,
    to_user_id = -1,
    from_user_id,
    comment_id = -1,
  }: IStar) {
    const result = await starModel.create({
      article_id,
      to_user_id,
      from_user_id,
      comment_id,
    });
    if (comment_id !== -1) {
      const total = await starModel.count({
        where: { comment_id },
      });
      await commentModel.update(
        { star_total: total },
        {
          where: { id: comment_id },
          silent: true, // silent如果为true，则不会更新updateAt时间戳。
        }
      );
    }
    return result;
  }

  /** 删除star */
  async delete(id: number) {
    // 注意顺序，先找到这个star的数据，然后再删数据。别删了数据再找这个star
    const res: any = await this.find(id);
    const result = await starModel.destroy({
      where: { id },
    });
    if (res.comment_id !== -1) {
      const total = await starModel.count({
        where: { comment_id: res.comment_id },
      });
      await commentModel.update(
        { star_total: total },
        {
          where: { id: res.comment_id },
          silent: true, // silent如果为true，则不会更新updateAt时间戳。
        }
      );
    }
    return result;
  }

  /** 删除评论/文章star */
  async deleteOtherStar({ article_id, comment_id, from_user_id }: IStar) {
    // 注意顺序，先找到这个star的数据，然后再删数据。别删了数据再找这个star
    const res: any = await starModel.findOne({
      where: {
        article_id,
        comment_id,
        from_user_id,
      },
    });
    const result = await starModel.destroy({
      where: { article_id, comment_id, from_user_id },
    });
    if (res.comment_id !== -1) {
      const total = await starModel.count({
        where: { comment_id: res.comment_id },
      });
      await commentModel.update(
        { star_total: total },
        {
          where: { id: res.comment_id },
          silent: true, // silent如果为true，则不会更新updateAt时间戳。
        }
      );
    }
    return result;
  }
}

export default new StarService();