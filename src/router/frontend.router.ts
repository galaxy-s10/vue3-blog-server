import Router from 'koa-router';

import frontendController from '@/controller/frontend.controller';

const frontendRouter = new Router({ prefix: '/frontend' });

frontendRouter.get('/detail', frontendController.getDetail);
frontendRouter.put('/update/:id', frontendController.update);

export default frontendRouter;
