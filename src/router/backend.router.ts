import Router from 'koa-router';

import { betaError } from '@/app/auth/verifyEnv';
import backendController from '@/controller/backend.controller';
import { verifyIdOne } from '@/middleware/utils.middleware';

const backendRouter = new Router({ prefix: '/backend' });

backendRouter.get('/list', betaError, verifyIdOne, backendController.getList);

backendRouter.get(
  '/detail',
  betaError,
  verifyIdOne,
  backendController.getDetail
);

backendRouter.get('/find/:id', betaError, verifyIdOne, backendController.find);

backendRouter.post('/create', betaError, verifyIdOne, backendController.create);

backendRouter.post(
  '/exec_cmd',
  betaError,
  verifyIdOne,
  backendController.execCmd
);

backendRouter.put(
  '/update/:id',
  betaError,
  verifyIdOne,
  backendController.update
);

backendRouter.delete(
  '/delete/:id',
  betaError,
  verifyIdOne,
  backendController.delete
);

export default backendRouter;
