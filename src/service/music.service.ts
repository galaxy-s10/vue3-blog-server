import Sequelize from 'sequelize';

import { IMusic } from '@/interface';
import musicModel from '@/model/music.model';
import { handlePaging } from '@/utils';

const { Op } = Sequelize;
class MusicService {
  /** 音乐是否存在 */
  async isExist(ids: number[]) {
    const res = await musicModel.findAll({
      where: {
        id: {
          [Op.or]: ids,
        },
      },
    });
    return res.length === ids.length;
  }

  /** 获取音乐列表 */
  async getList({ nowPage, pageSize, orderBy, orderName }) {
    const offset = (parseInt(nowPage, 10) - 1) * parseInt(pageSize, 10);
    const limit = parseInt(pageSize, 10);
    const result = await musicModel.findAndCountAll({
      order: [[orderName, orderBy]],
      limit,
      offset,
    });
    return handlePaging(nowPage, pageSize, result);
  }

  /** 查找音乐 */
  async find(id: number) {
    const result = await musicModel.findOne({ where: { id } });
    return result;
  }

  /** 修改音乐 */
  async update({ id, name, img, author, url, status }: IMusic) {
    const result = await musicModel.update(
      { name, img, author, url, status },
      { where: { id } }
    );
    return result;
  }

  /** 创建音乐 */
  async create({ name, img, author, url, status }: IMusic) {
    const result = await musicModel.create({ name, img, author, url, status });
    return result;
  }

  /** 删除音乐 */
  async delete(id: number) {
    const result = await musicModel.destroy({
      where: { id },
      individualHooks: true,
    });
    return result;
  }
}

export default new MusicService();
