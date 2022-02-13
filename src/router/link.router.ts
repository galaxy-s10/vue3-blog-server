import Router from 'koa-router';
import linkController from '@/controller/link.controller';
import { verifyProp } from '@/middleware/link.middleware';

const linkRouter = new Router({ prefix: '/link' });

// 标签列表
linkRouter.get('/list', linkController.getList);

// 创建标签
linkRouter.post('/create', verifyProp, linkController.create);

// 查找标签
linkRouter.get('/find/:id', linkController.find);

// 更新标签
linkRouter.put('/update/:id', verifyProp, linkController.update);

// 删除标签
linkRouter.delete('/delete/:id', linkController.delete);

export default linkRouter;
