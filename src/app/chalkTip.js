const chalk = require('chalk');
// import chalk from 'chalk';

const emoji = require('node-emoji');

const _INFO = (v) =>
  `${chalk.bgBlueBright.black(' INFO ')} ${chalk.blueBright(v)}`;
const _SUCCESS = (v) =>
  `${chalk.bgGreenBright.black(' SUCCESS ')} ${chalk.greenBright(
    v
  )} ${emoji.get('white_check_mark')}`;
const _ERROR = (v) =>
  `${chalk.bgRedBright.black(' ERROR ')} ${chalk.redBright(v)} ${emoji.get(
    'x'
  )}`;
const _chalk = chalk;

module.exports = { _INFO, _SUCCESS, _ERROR, _chalk, emoji };
