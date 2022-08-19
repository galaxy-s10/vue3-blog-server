import dayjs from 'dayjs';
import schedule from 'node-schedule';

import { chalkINFO, chalkWRAN } from '@/app/chalkTip';
import { QQ_EMAIL_USER } from '@/config/secret';
import {
  MONIT_TYPE_MEMORY_THRESHOLD,
  MONIT_TYPE_RESTART_PM2,
  MONIT_TYPE_CLEAR_CACHE,
  PROJECT_ENV,
  MONIT_TYPE_MEMORY_LOG,
  MONIT_MEMORY_JOB,
} from '@/constant';
import otherController from '@/controller/other.controller';
import monitService from '@/service/monit.service';
import { clearCache, restartPm2, showMemory } from '@/utils/clearCache';
import { formatMemorySize } from '@/utils/index';

const threshold = 85 / 100; // 内存阈值
const buffCacheThreshold = 20 / 100; // buff/cache阈值
const restartPm2Threshold = 95 / 100; // 内存达到重启pm2的阈值

export const main = async () => {
  const res: any = await showMemory();
  if (res.error) {
    const result = res.error;
    otherController.sendEmail(QQ_EMAIL_USER, result, result);
    return;
  }
  const res1 = {};
  Object.keys(res).forEach((v) => {
    res1[v] = formatMemorySize(Number(res[v]));
  });
  const total = res['Mem:total'];
  const used = res['Mem:used'];

  try {
    let result = '';
    const rate = `${((res['Mem:used'] / res['Mem:total']) * 100).toFixed(2)}%`;
    const thresholdRate = `${(threshold * 100).toFixed(2)}%`;
    const restartPm2ThresholdRate = `${(restartPm2Threshold * 100).toFixed(
      2
    )}%`;
    const currBuffCacheRate = res['Mem:buff/cache'] / res['Mem:total'];

    if (total * restartPm2Threshold < used) {
      result = `服务器内存使用率达到重启pm2的阈值（${restartPm2ThresholdRate}）！当前使用率：${rate}，开始重启所有pm2进程`;
      otherController.sendEmail(QQ_EMAIL_USER, result, result);
      restartPm2();
      monitService.create({
        type: MONIT_TYPE_RESTART_PM2,
        info: result,
      });
      return;
    }
    if (total * threshold < used) {
      result = `服务器内存使用率超过阈值（${thresholdRate}），当前使用率：${rate}（总内存：${res1['Mem:total']}，已使用：${res1['Mem:used']}，可用：${res1['Mem:free']}，buff/cache：${res1['Mem:buff/cache']}）`;
      otherController.sendEmail(QQ_EMAIL_USER, result, result);
      monitService.create({
        type: MONIT_TYPE_MEMORY_THRESHOLD,
        info: result,
      });
    } else {
      result = `服务器内存使用率阈值：${thresholdRate}，当前使用率：${rate}（总内存：${res1['Mem:total']}，已使用：${res1['Mem:used']}，可用：${res1['Mem:free']}，buff/cache：${res1['Mem:buff/cache']}）`;
      monitService.create({
        type: MONIT_TYPE_MEMORY_LOG,
        info: result,
      });
    }
    if (currBuffCacheRate > buffCacheThreshold) {
      const str = `buff/cache超过阈值，清除buff/cache，当前buff/cache占用：${
        res1['Mem:buff/cache']
      }，阈值：${formatMemorySize(res['Mem:total'] * buffCacheThreshold)}`;
      console.log(chalkINFO(str));
      clearCache();
      monitService.create({
        type: MONIT_TYPE_CLEAR_CACHE,
        info: str,
      });
      otherController.sendEmail(QQ_EMAIL_USER, str, str);
    }
  } catch (err) {
    console.log(err);
  }
};

const rule = new schedule.RecurrenceRule();

const allHour = 24;
const allMinute = 60;
const allSecond = 60;
const allHourArr = [];
const allMinuteArr = [];
const allSecondArr = [];

for (let i = 0; i < allHour; i += 1) {
  allHourArr.push(i);
}
for (let i = 0; i < allMinute; i += 1) {
  allMinuteArr.push(i);
}
for (let i = 0; i < allSecond; i += 1) {
  allSecondArr.push(i);
}

// 每10分钟执行
rule.minute = allMinuteArr.filter((v) => v % 10 === 0);
rule.second = 0;

export const monitMemoryJob = () => {
  console.log(chalkWRAN('监控内存定时任务启动！'));
  schedule.scheduleJob(MONIT_MEMORY_JOB, rule, () => {
    if (PROJECT_ENV === 'prod') {
      console.log(
        chalkINFO(
          `${dayjs().format(
            'YYYY-MM-DD HH:mm:ss'
          )}，执行${MONIT_MEMORY_JOB}定时任务`
        )
      );
      main();
    } else {
      console.log(
        chalkWRAN(
          `${dayjs().format(
            'YYYY-MM-DD HH:mm:ss'
          )}，非生产环境，不执行${MONIT_MEMORY_JOB}定时任务`
        )
      );
    }
  });
};
