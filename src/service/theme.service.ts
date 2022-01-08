import Sequelize from 'sequelize';
import themeModel from '../model/theme.model';

const fn2 = async () => {
  console.log('dddd');
  const xx = await new Promise((res, rej) => {
    setTimeout(() => {
      console.log('fn2');
      res(100);
    }, 1000);
  });
  return xx;
};

class ThemeService {
  async create(theme) {
    // const res = await themeModel.create(theme, { validate: true });//使用sequence的验证。
    // try {
    // const res = await fn2();
    const res = await themeModel.create(theme);
    console.log(res, '00');
    return res;
    // } catch (err) {
    //   console.log(333);
    //   // return err;
    // }
  }

  async getList(theme) {
    const res = await themeModel.findAndCountAll({
      // attributes: {
      //   include: [
      //     [
      //       Sequelize.fn(
      //         'DATE_FORMAT',
      //         Sequelize.col('createdAt'),
      //         '%Y-%m-%d %H:%i:%s'
      //       ),
      //       'createdAt',
      //     ],
      //   ],
      // },
    });
    // console.log(Sequelize.fn('upper', Sequelize.col('key')), 3333);
    return res;
  }
}

export default new ThemeService();
