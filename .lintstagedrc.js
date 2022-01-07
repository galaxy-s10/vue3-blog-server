const { _INFO, emoji } = require('./src/utils/chalkTip');

console.log(
  _INFO(`读取：${__filename.slice(__dirname.length + 1)}`),
  emoji.get('white_check_mark')
);

module.exports = {
  '*.{js,jsx,ts,tsx}': ['prettier --write'],
};
