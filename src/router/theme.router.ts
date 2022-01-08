// import Router from '@koa/router';
import Router from 'koa-router';
// import ThemeService from '../service/theme.service';
// import themeController from '../controller/theme.controller';
import themeController from '@/controller/theme.controller';
import { verifyProp } from '@/middleware/theme.middleware';

const themeRouter = new Router({ prefix: '/theme' });
const fn2 = async () => {
  console.log('dddd');
  return new Promise((res, rej) => {
    setTimeout(() => {
      console.log('fn2');
      res(100);
    }, 1000);
  });
  // console.log(xx, 865);
  // return xx;
};
themeRouter.get('/list', themeController.list);
themeRouter.post('/create', themeController.create);
// themeRouter.post('/create', async (ctx, next) => {
//   console.log('llllll');
//   const aa = await fn2();
//   console.log(aa, 23532);
//   console.log('llll11');
//   ctx.body = 'fsdgds';
// });
export default themeRouter;
