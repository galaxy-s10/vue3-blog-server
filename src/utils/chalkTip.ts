import nodeChalk from 'chalk';
import nodeEmoji from 'node-emoji';

import { PROJECT_ENV, PROJECT_ENV_ENUM } from '../constant';

export const emoji = nodeEmoji;
export const chalk = nodeChalk;
const disablePrettier = PROJECT_ENV === PROJECT_ENV_ENUM.prod;

export const chalkINFO = (v: string) => {
  const time = new Date().toLocaleString('zh-CN');
  const prefix = `[${time}]  INFO    `;
  if (disablePrettier) {
    return `${prefix} ${v}`;
  }
  return `${chalk.bgBlueBright.black(prefix)} ${chalk.blueBright(v)}`;
};
export const chalkSUCCESS = (v: string) => {
  const time = new Date().toLocaleString('zh-CN');
  const prefix = `[${time}]  SUCCESS `;
  if (disablePrettier) {
    return `${prefix} ${v}`;
  }
  return `${chalk.bgGreenBright.black(prefix)} ${chalk.greenBright(v)}`;
};
export const chalkERROR = (v: string) => {
  const time = new Date().toLocaleString('zh-CN');
  const prefix = `[${time}]  ERROR   `;
  if (disablePrettier) {
    return `${prefix} ${v}`;
  }
  return `${chalk.bgRedBright.black(prefix)} ${chalk.redBright(v)}`;
};
export const chalkWARN = (v: string) => {
  const time = new Date().toLocaleString('zh-CN');
  const prefix = `[${time}]  WARN    `;
  if (disablePrettier) {
    return `${prefix} ${v}`;
  }
  return `${chalk.bgHex('#FFA500').black(`${prefix}`)} ${chalk.hex('#FFA500')(
    v
  )}`;
};
