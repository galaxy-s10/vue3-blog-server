import { Op, col, fn } from 'sequelize';

import articleTagModel from '@/model/articleTag.model';

class ArticleTagService {
  async create(props) {
    const res = await articleTagModel.create(props);
    return res;
  }

  async getList() {
    const res = await articleTagModel.findAndCountAll();
    return res;
  }

  async findArticleTagCount(article_ids: number[]) {
    const res = await articleTagModel.findAndCountAll({
      attributes: ['article_id', [fn('COUNT', col('*')), 'count']],
      where: {
        article_id: {
          [Op.in]: article_ids,
        },
      },
      group: ['article_id'],
    });
    return res;
  }

  async findArticleTag(article_ids: number[]) {
    const res = await articleTagModel.findAll({
      attributes: [
        'article_id',
        'tag_id',
        // [fn('GROUP_CONCAT', col('tag.id')), 'tag_id'],
        // [fn('GROUP_CONCAT', col('tag.name')), 'tag_name'],
        // [fn('GROUP_CONCAT', col('tag.color')), 'tag_color'],
      ],
      where: {
        article_id: {
          [Op.in]: article_ids,
        },
      },
      // group: ['article_id'],
    });
    return res;
  }
}

export default new ArticleTagService();
