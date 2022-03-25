import { chalkSUCCESS } from './chalkTip';

const path = require('path');

const moduleAlias = require('module-alias');

moduleAlias.addAlias('@', path.join(process.cwd(), '/src'));

const aliasOk = () => {
  console.log(chalkSUCCESS('添加路径别名成功!'));
};

export default aliasOk;
