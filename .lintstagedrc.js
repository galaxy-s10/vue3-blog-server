const chalk = require('chalk');

console.log(
  `${chalk.bgBlueBright.black(' INFO ')} ${chalk.blueBright(
    `读取了: ${__filename.slice(__dirname.length + 1)}`
  )}`
);

module.exports = {
  // 只对这几种格式的代码进行prettier美化
  '*.{js,ts}': ['prettier --write'],
};
