import { deleteUseLessObjectKey, filterObj } from 'billd-utils';
import Sequelize from 'sequelize';

import { IList, IMusic } from '@/interface';
import musicModel from '@/model/music.model';
import { handlePaging } from '@/utils';

const { Op } = Sequelize;
class MusicService {
  /** 音乐是否存在 */
  async isExist(ids: number[]) {
    const res = await musicModel.count({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res === ids.length;
  }

  /** 获取音乐列表 */
  async getList({
    id,
    status,
    orderBy,
    orderName,
    nowPage,
    pageSize,
    keyWord,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<IMusic>) {
    let offset;
    let limit;
    if (nowPage && pageSize) {
      offset = (+nowPage - 1) * +pageSize;
      limit = +pageSize;
    }
    const allWhere = deleteUseLessObjectKey({ id, status });

    if (keyWord) {
      const keyWordWhere = [
        {
          name: {
            [Op.like]: `%${keyWord}%`,
          },
        },
        {
          author: {
            [Op.like]: `%${keyWord}%`,
          },
        },
      ];
      allWhere[Op.or] = keyWordWhere;
    }
    if (rangTimeType) {
      allWhere[rangTimeType] = {
        [Op.gt]: new Date(+rangTimeStart!),
        [Op.lt]: new Date(+rangTimeEnd!),
      };
    }
    // @ts-ignore
    const result = await musicModel.findAndCountAll({
      order: [[orderName, orderBy]],
      limit,
      offset,
      where: {
        ...allWhere,
      },
    });
    return handlePaging(result, nowPage, pageSize);
  }

  /** 查找音乐 */
  async find(id: number) {
    const result = await musicModel.findOne({ where: { id } });
    return result;
  }

  /** 创建音乐 */
  async create(data: IMusic) {
    const result = await musicModel.create(data);
    return result;
  }

  /** 修改音乐 */
  async update(data: IMusic) {
    const { id } = data;
    const data2 = filterObj(data, ['id']);
    const result = await musicModel.update(data2, {
      where: { id },
      limit: 1,
    });
    return result;
  }

  /** 删除音乐 */
  async delete(id: number) {
    const result = await musicModel.destroy({
      where: { id },
      limit: 1,
      individualHooks: true,
    });
    return result;
  }
}

export default new MusicService();
