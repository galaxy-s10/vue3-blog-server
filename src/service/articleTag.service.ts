// import articleTagModel from '../model/articleTag.model';
import articleTagModel from '../model/dayData.model';

class ArticleTagService {
  async create(article) {
    const res = await articleTagModel.create(article);
    return res;
  }

  async getList(article) {
    const res = await articleTagModel.findAndCountAll({});
    return res;
  }
}

export default new ArticleTagService();
