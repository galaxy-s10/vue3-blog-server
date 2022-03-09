import Router from 'koa-router';

const fs = require('fs');
const { _SUCCESS } = require('@/app/chalkTip');

const router = new Router();

function useRoutes() {
  fs.readdirSync(__dirname).forEach((file) => {
    if (file === 'index.ts') return;
    // eslint-disable-next-line
    const linkRouter = require(`./${file}`).default;
    this.use(linkRouter.routes()).use(linkRouter.allowedMethods());
    // router.use('/front', linkRouter.routes()).use(linkRouter.allowedMethods());
    router.use('/admin', linkRouter.routes()).use(linkRouter.allowedMethods());
    this.use(router.routes()).use(router.allowedMethods());
    console.log(_SUCCESS(`加载${file}路由`));
  });
}

export default useRoutes;
