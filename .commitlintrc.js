const { _INFO } = require('./src/app/chalkTip');

console.log(_INFO(`读取：${__filename.slice(__dirname.length + 1)}`));

module.exports = {
  extends: ['@commitlint/config-conventional'],
};
