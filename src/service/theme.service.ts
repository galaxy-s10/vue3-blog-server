import Sequelize from 'sequelize';

import { ITheme } from '@/interface';
import themeModel from '@/model/theme.model';
import { handlePaging } from '@/utils';

const { Op } = Sequelize;
class ThemeService {
  /** 主题是否存在 */
  async isExist(ids: number[]) {
    const res = await themeModel.findAll({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res.length === ids.length;
  }

  /** 主题列表 */
  async getList({ nowPage, pageSize, orderBy, orderName }) {
    const offset = (parseInt(nowPage, 10) - 1) * parseInt(pageSize, 10);
    const limit = parseInt(pageSize, 10);
    const result = await themeModel.findAndCountAll({
      order: [[orderName, orderBy]],
      limit,
      offset,
    });
    return handlePaging(nowPage, pageSize, result);
  }

  /** 查找主题 */
  async find(id: number) {
    const result = await themeModel.findOne({ where: { id } });
    return result;
  }

  /** 修改主题 */
  async update({ id, model, key, value, lang }: ITheme) {
    const result = await themeModel.update(
      { model, key, value, lang },
      { where: { id } }
    );
    return result;
  }

  /** 创建主题 */
  async create({ model, key, value, lang }: ITheme) {
    const result = await themeModel.create({ model, key, value, lang });
    return result;
  }

  /** 删除主题 */
  async delete(id: number) {
    const result = await themeModel.destroy({
      where: { id },
      individualHooks: true,
    });
    return result;
  }
}

export default new ThemeService();
