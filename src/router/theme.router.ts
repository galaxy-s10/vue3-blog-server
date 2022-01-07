// import Router from '@koa/router';
import Router from 'koa-router';
// import ThemeService from '../service/theme.service';
// import themeController from '../controller/theme.controller';
import themeController from '../controller/theme.controller';
import { verifyProp } from '../middleware/theme.middleware';

const themeRouter = new Router({ prefix: '/theme' });

themeRouter.get('/list', themeController.list);
themeRouter.post('/create', themeController.create);
export default themeRouter;
