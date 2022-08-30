import fs from 'fs';

import Router from 'koa-router';

import { chalkINFO, chalkERROR } from '@/utils/chalkTip';

const router = new Router();

export function loadAllRoutes(app) {
  fs.readdirSync(__dirname).forEach((file) => {
    try {
      if (file === 'index.ts') return;
      const linkRouter = require(`./${file}`).default;
      app.use(linkRouter.routes()).use(linkRouter.allowedMethods());
      // router.use('/front', linkRouter.routes()).use(linkRouter.allowedMethods());
      router
        .use('/admin', linkRouter.routes())
        .use(linkRouter.allowedMethods());
      app.use(router.routes()).use(router.allowedMethods()); // 这个有啥用？？？
      console.log(chalkINFO(`加载路由: ${file}`));
    } catch (error) {
      console.log(chalkERROR(`加载${file}路由出错:`));
      console.log(error);
    }
  });
}
