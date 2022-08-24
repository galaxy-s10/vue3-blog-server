import Router from 'koa-router';

import qiniuController from '@/controller/qiniuData.controller';
import { verifyEnv } from '@/middleware/qiniuData.middleware';

const qiniuRouter = new Router({ prefix: '/qiniu_data' });

// 获取token
// qiniuRouter.get('/get_token', qiniuController.getToken);

qiniuRouter.post('/upload', verifyEnv, qiniuController.upload);

qiniuRouter.get('/diff', verifyEnv, qiniuController.getDiff);

qiniuRouter.get('/batch_list', verifyEnv, qiniuController.getBatchFileInfo);

qiniuRouter.get('/list', qiniuController.getList);

qiniuRouter.delete('/delete/:id', verifyEnv, qiniuController.delete);

qiniuRouter.put('/update/:id', verifyEnv, qiniuController.update);

qiniuRouter.post('/sync_qiniu_data', verifyEnv, qiniuController.syncQiniuData);

export default qiniuRouter;
