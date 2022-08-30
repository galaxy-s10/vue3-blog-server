import dayjs from 'dayjs';
import schedule from 'node-schedule';

import { QQ_EMAIL_USER } from '@/config/secret';
import { PROJECT_ENV, MONIT_JOB, MONIT_TYPE } from '@/constant';
import otherController from '@/controller/other.controller';
import monitService from '@/service/monit.service';
import { chalkINFO, chalkWARN } from '@/utils/chalkTip';
import { clearCache, restartPm2, showMemory } from '@/utils/clearCache';
import { formatMemorySize } from '@/utils/index';

const threshold = 85 / 100; // 内存阈值
const buffCacheThreshold = 20 / 100; // buff/cache阈值
const restartPm2Threshold = 95 / 100; // 内存达到重启pm2的阈值

export const main = async () => {
  try {
    const res: any = await showMemory();
    const res1 = {};
    Object.keys(res).forEach((v) => {
      res1[v] = formatMemorySize(Number(res[v]));
    });
    const total = res['Mem:total'];
    const used = res['Mem:used'];
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
      await monitService.create({
        type: MONIT_TYPE.RESTART_PM2,
        info: result,
      });
      restartPm2();
      return;
    }
    if (total * threshold < used) {
      result = `服务器内存使用率超过阈值（${thresholdRate}），当前使用率：${rate}（总内存：${
        res1['Mem:total'] as ''
      }，已使用：${res1['Mem:used'] as ''}，可用：${
        res1['Mem:free'] as ''
      }，buff/cache：${res1['Mem:buff/cache'] as ''}）`;
      otherController.sendEmail(QQ_EMAIL_USER, result, result);
      monitService.create({
        type: MONIT_TYPE.MEMORY_THRESHOLD,
        info: result,
      });
    } else {
      result = `服务器内存使用率阈值：${thresholdRate}，当前使用率：${rate}（总内存：${
        res1['Mem:total'] as ''
      }，已使用：${res1['Mem:used'] as ''}，可用：${
        res1['Mem:free'] as ''
      }，buff/cache：${res1['Mem:buff/cache'] as ''}）`;
      monitService.create({
        type: MONIT_TYPE.MEMORY_LOG,
        info: result,
      });
    }
    if (currBuffCacheRate > buffCacheThreshold) {
      const str = `buff/cache超过阈值，清除buff/cache，当前buff/cache占用：${
        res1['Mem:buff/cache'] as ''
      }，阈值：${formatMemorySize(res['Mem:total'] * buffCacheThreshold)}`;
      console.log(chalkINFO(str));
      await monitService.create({
        type: MONIT_TYPE.CLEAR_CACHE,
        info: str,
      });
      clearCache();
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
