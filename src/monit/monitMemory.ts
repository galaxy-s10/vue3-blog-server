import dayjs from 'dayjs';
import schedule from 'node-schedule';

import { QQ_EMAIL_USER } from '@/config/secret';
import { PROJECT_ENV, MONIT_JOB, MONIT_TYPE } from '@/constant';
import otherController from '@/controller/other.controller';
import monitService from '@/service/monit.service';
import { chalkINFO, chalkWARN } from '@/utils/chalkTip';
import { clearCache, restartPm2, showMemory } from '@/utils/clearCache';
import { formatMemorySize, replaceKeyFromValue } from '@/utils/index';
import { emailTmp } from '@/utils/tmp';

const memoryThreshold = 85 / 100; // 内存阈值
const buffCacheThreshold = 20 / 100; // buff/cache阈值
const restartPm2Threshold = 10 / 100; // 如果可用内存小于10%，则重启pm2

const memoryRate = `${memoryThreshold}%`; // 内存比率
const buffCacheRate = `${buffCacheThreshold}%`; // buff/cache比率
const restartPm2Rate = `${restartPm2Threshold}%`; // 重启pm2比率

export const main = async () => {
  try {
    const memoryRes: any = await showMemory();
    const formatRes = {};
    Object.keys(memoryRes).forEach((v) => {
      formatRes[v] = formatMemorySize(Number(memoryRes[v]));
    });
    const total = memoryRes['Mem:total'];
    const used = memoryRes['Mem:used'];
    const free = memoryRes['Mem:free'];
    let result = '';
    // 当前内存使用比率
    const currMemoryRate = `${(
      (memoryRes['Mem:used'] / memoryRes['Mem:total']) *
      100
    ).toFixed(2)}%`;
    // 当前buff/cache使用比率
    const currBuffCacheRate =
      memoryRes['Mem:buff/cache'] / memoryRes['Mem:total'];

    // 如果可用内存小于10%，则重启pm2
    if (total * restartPm2Threshold > free) {
      result = `服务器可用内存小于${`${restartPm2Threshold}%`}，开始重启所有pm2进程`;
      const emialContent = replaceKeyFromValue(emailTmp, {
        title: result,
        memoryThreshold,
        memoryRate,
        buffCacheThreshold,
        buffCacheRate,
        restartPm2Threshold,
        restartPm2Rate,
        currMemoryRate,
        currBuffCacheRate,
        Memtotal: formatRes['Mem:total'],
        Memused: formatRes['Mem:used'],
        Memfree: formatRes['Mem:free'],
        Membuffcache: formatRes['Mem:buff/cache'],
        Swaptotal: formatRes['Swap:total'],
        Swapused: formatRes['Swap:used'],
        Swapfree: formatRes['Swap:free'],
      });
      await otherController.sendEmail(
        QQ_EMAIL_USER,
        emialContent,
        emialContent
      );
      await monitService.create({
        type: MONIT_TYPE.RESTART_PM2,
        info: emialContent,
      });
      restartPm2();
      return;
    }
    if (total * memoryThreshold < used) {
      result = `服务器内存使用率超过阈值（${currMemoryRate}）`;
      const emialContent = replaceKeyFromValue(emailTmp, {
        title: result,
        memoryThreshold,
        memoryRate,
        buffCacheThreshold,
        buffCacheRate,
        restartPm2Threshold,
        restartPm2Rate,
        currMemoryRate,
        currBuffCacheRate,
        Memtotal: formatRes['Mem:total'],
        Memused: formatRes['Mem:used'],
        Memfree: formatRes['Mem:free'],
        Membuffcache: formatRes['Mem:buff/cache'],
        Swaptotal: formatRes['Swap:total'],
        Swapused: formatRes['Swap:used'],
        Swapfree: formatRes['Swap:free'],
      });
      await otherController.sendEmail(
        QQ_EMAIL_USER,
        emialContent,
        emialContent
      );
      await monitService.create({
        type: MONIT_TYPE.MEMORY_THRESHOLD,
        info: emialContent,
      });
    } else {
      result = `服务器内存使用率阈值：${memoryRate}，当前使用率：${currMemoryRate}（总内存：${
        formatRes['Mem:total'] as ''
      }，已使用：${formatRes['Mem:used'] as ''}，可用：${
        formatRes['Mem:free'] as ''
      }，buff/cache：${formatRes['Mem:buff/cache'] as ''}）`;
      monitService.create({
        type: MONIT_TYPE.MEMORY_LOG,
        info: result,
      });
    }
    if (currBuffCacheRate > buffCacheThreshold) {
      const result = `buff/cache超过阈值（${currBuffCacheRate}），开始清除buff/cache`;
      const emialContent = replaceKeyFromValue(emailTmp, {
        title: result,
        memoryThreshold,
        memoryRate,
        buffCacheThreshold,
        buffCacheRate,
        restartPm2Threshold,
        restartPm2Rate,
        currMemoryRate,
        currBuffCacheRate,
        Memtotal: formatRes['Mem:total'],
        Memused: formatRes['Mem:used'],
        Memfree: formatRes['Mem:free'],
        Membuffcache: formatRes['Mem:buff/cache'],
        Swaptotal: formatRes['Swap:total'],
        Swapused: formatRes['Swap:used'],
        Swapfree: formatRes['Swap:free'],
      });
      await otherController.sendEmail(
        QQ_EMAIL_USER,
        emialContent,
        emialContent
      );
      console.log(chalkINFO(result));
      await monitService.create({
        type: MONIT_TYPE.CLEAR_CACHE,
        info: emialContent,
      });
      clearCache();
    }
  } catch (err) {
    console.log(err);
  }
};

const rule = new schedule.RecurrenceRule();

const allHour = 24;
const allMinute = 60;
const allSecond = 60;
const allHourArr: number[] = [];
const allMinuteArr: number[] = [];
const allSecondArr: number[] = [];

for (let i = 0; i < allHour; i += 1) {
  allHourArr.push(i);
}
for (let i = 0; i < allMinute; i += 1) {
  allMinuteArr.push(i);
}
for (let i = 0; i < allSecond; i += 1) {
  allSecondArr.push(i);
}

// 每30分钟执行
rule.minute = allMinuteArr.filter((v) => v % 30 === 0);
rule.second = 0;

export const monitMemoryJob = () => {
  console.log(chalkINFO('监控任务: 内存定时任务启动！'));
  const monitJobName = MONIT_JOB.MEMORY;
  schedule.scheduleJob(monitJobName, rule, () => {
    if (PROJECT_ENV === 'prod') {
      console.log(
        chalkINFO(
          `${dayjs().format(
            'YYYY-MM-DD HH:mm:ss'
          )}，执行${monitJobName}定时任务`
        )
      );
      main();
    } else {
      console.log(
        chalkWARN(
          `${dayjs().format(
            'YYYY-MM-DD HH:mm:ss'
          )}，当前非生产环境，不执行${monitJobName}定时任务`
        )
      );
    }
  });
};
