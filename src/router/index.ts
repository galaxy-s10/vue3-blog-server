const fs = require('fs');

const useRoutes = function () {
  fs.readdirSync(__dirname).forEach((file) => {
    if (file === 'index.ts') return;
    // eslint-disable-next-line
    const router = require(`./${file}`).default;
    this.use(router.routes()).use(router.allowedMethods());
  });
};

export default useRoutes;
