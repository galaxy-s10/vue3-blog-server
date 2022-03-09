import Router from 'koa-router';
import starController from '@/controller/star.controller';
import { verifyProp } from '@/middleware/star.middleware';

const starRouter = new Router({ prefix: '/star' });

// star列表
starRouter.get('/list', starController.getList);

// 创建star
starRouter.post('/create', verifyProp, starController.create);

// 查找star
starRouter.get('/find/:id', starController.find);

// 更新star
starRouter.put('/update/:id', verifyProp, starController.update);

// 删除star
starRouter.delete('/delete/:id', starController.delete);

// 删除评论/文章star
starRouter.delete('/delete/other', starController.deleteOtherStar);

export default starRouter;
