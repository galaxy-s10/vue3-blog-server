import path from 'path';

import moduleAlias from 'module-alias';

import { chalkSUCCESS } from '../utils/chalkTip';

moduleAlias.addAlias('@', path.join(process.cwd(), 'dist'));

export const aliasOk = () => {
  console.log(chalkSUCCESS('添加路径别名成功！'));
};
