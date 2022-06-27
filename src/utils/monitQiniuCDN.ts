import dayjs from 'dayjs';
import schedule from 'node-schedule';

import { chalkINFO, chalkWRAN } from '@/app/chalkTip';
import { PROJECT_ENV } from '@/app/constant';
import qiniuModel from '@/controller/qiniu.controller';

const rule = new schedule.RecurrenceRule();
const allMinute = 60;
const minuteArr = [];
for (let i = 0; i < allMinute; i += 1) {
  minuteArr.push(i);
}
// 每十分钟监控一次
rule.minute = minuteArr.filter((v) => v % 10 === 0);

export const monitQiniuCDN = () => {
  console.log(chalkWRAN('监控七牛云cdn任务开始启动！'));
  schedule.scheduleJob('monitQiniuCDN', rule, () => {
    if (PROJECT_ENV === 'prod') {
      console.log(
        chalkINFO(
          `执行monitQiniuCDN定时任务，${dayjs().format('YYYY-MM-DD HH:mm:ss')}`
        )
      );
      qiniuModel
        .monitCDN()
        .then((flag: boolean) => {
          if (flag) {
            console.log('达到阈值，停掉cdn');
          } else {
            console.log('没达到阈值');
          }
        })
        .catch((err) => {
          console.log('监控七牛云cdn异常', err);
        });
    } else {
      console.log(chalkWRAN('非生产环境，不执行monitQiniuCDN定时任务'));
    }
  });
};
