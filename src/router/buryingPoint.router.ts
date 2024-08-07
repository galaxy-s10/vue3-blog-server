import Router from 'koa-router';

import buryingPointController from '@/controller/buryingPoint.controller';

const buryingPointRouter = new Router({ prefix: '/burying_point' });

buryingPointRouter.get('/list', buryingPointController.getList);

buryingPointRouter.post('/create', buryingPointController.create);

export default buryingPointRouter;
