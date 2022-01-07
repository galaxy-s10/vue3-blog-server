import Router from 'koa-router';
import articleTagController from '../controller/articleTag.controller';
import { verifyProp } from '../middleware/articleTag.middleware';

const articleRouter = new Router({ prefix: '/articleTag' });

articleRouter.post('/create', verifyProp, articleTagController.create);
articleRouter.get('/list', articleTagController.list);
export default articleRouter;
