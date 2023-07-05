import articleTypeModel from '@/model/articleType.model';

class ArticleTypeService {
  async create(props) {
    const res = await articleTypeModel.create(props);
    return res;
  }

  async getList() {
    const res = await articleTypeModel.findAndCountAll();
    return res;
  }

  async Counttypeid(typeid: number) {
    const res = await articleTypeModel.findAndCountAll({
      where: {
        type_id: typeid,
      },
    });

    return res;
  }
}

export default new ArticleTypeService();
