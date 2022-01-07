import articleModel from '../model/article.model';

class ArticleService {
  async create(article) {
    const res = await articleModel.create(article);
    return res;
  }

  async getList(article) {
    const res = await articleModel.findAndCountAll({});
    return res;
  }
}

export default new ArticleService();
