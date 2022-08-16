import dayjs from 'dayjs';
import fs from 'fs-extra';
import schedule from 'node-schedule';
import { Client } from 'ssh2';

import { formatMemorySize } from '.';

import { chalkINFO, chalkWRAN } from '@/app/chalkTip';
import { PROJECT_ENV } from '@/app/constant';
import { QQ_EMAIL_USER, SSH_CONFIG } from '@/config/secret';
import otherController from '@/controller/other.controller';

// 备份目录文件
const backupsDirectory = '/node/backups/server/';
// 备份文件名
const backupsFileName = 'monitMemory.txt';
// 备份目录是否存在
const backupsDirectoryIsExistCmd = `
if [ ! -d "${backupsDirectory}" ];then
echo "备份目录不存在，先创建备份目录${backupsDirectory}"
mkdir ${backupsDirectory}
echo "创建备份目录完成，开始备份"
else
echo "备份目录已存在，开始备份"
fi
`;

// 查看占用内存最多的10个进程
const backupsCmd = () => {
  return 'free -b';
};

/**
 * @description: 处理free命令返回的内存信息
 * @param {string} str
 * @return {*}
 */
const handleData = (str: string) => {
  const arr = str.match(/\S+/g);

  const mem = 'Mem:';
  const swap = 'Swap:';
  const res = [];
  const obj = {};

  res.push(arr.splice(0, 6));
  res.push(arr.splice(0, 7));
  res.push(arr.splice(0, arr.length));

  res[0].forEach((key, index) => {
    res[1][index + 1] && (obj[mem + key] = res[1][index + 1]);
    res[2][index + 1] && (obj[swap + key] = res[2][index + 1]);
  });
  return obj;
};

const conner = () => {
  const conn = new Client();

  conn
    .on('ready', () => {
      conn.exec(
        `
        ${backupsDirectoryIsExistCmd}
        ${backupsCmd()}
    `,
        (error, stream) => {
          if (error) throw error;
          stream
            .on('close', async () => {
              console.log('close');
            })
            .on('data', (data) => {
              console.log(`==========STDOUT==========`);
              console.log(data.toString());
              try {
                const dest = backupsDirectory + backupsFileName;
                const isExit = fs.existsSync(dest);

                const res = handleData(data.toString());
                const res1 = {};
                Object.keys(res).forEach((v) => {
                  const val = res[v];
                  res1[v] = formatMemorySize(Number(res[v]));
                });
                const total = res['Mem:total'];
                const used = res['Mem:used'];
                const flag = 80 / 100;
                let result = '';
                if (total * flag < used) {
                  result = `服务器总内存: ${res1['Mem:total']},当前已使用: ${
                    res1['Mem:used']
                  },服务器已使用内存大于${`${flag * 100}%`}}`;
                  otherController.sendEmail(QQ_EMAIL_USER, result, result);
                } else {
                  result = `服务器总内存: ${res1['Mem:total']},当前已使用: ${
                    res1['Mem:used']
                  },服务器已使用内存小于${`${flag * 100}%`}`;
                  console.log(result);
                }
                if (isExit) {
                  let oldRecord = fs.readFileSync(dest).toString();
                  const template = `
                  ${new Date().toLocaleString()}:\n
                  ${data.toString()}\n
                  `;
                  fs.outputFileSync(dest, (oldRecord += template));
                } else {
                  console.log('>>>', dest);
                  fs.outputFileSync(dest, result);
                  // fs.writeFileSync(dest, result);
                }
              } catch (err) {
                console.log(err);
              }
            })
            .stderr.on('data', (data) => {
              console.log(`==========STDERR==========`);
              console.log(data.toString());
            });
        }
      );
    })
    .connect({
      host: SSH_CONFIG.host,
      port: SSH_CONFIG.port,
      username: SSH_CONFIG.username,
      password: SSH_CONFIG.password,
    });
};
// https://github.com/node-schedule/node-schedule#cron-style-scheduling
// 每分钟的第30秒触发： '30 * * * * *'
// 每小时的1分30秒触发 ：'30 1 * * * *'
// 每天的凌晨1点1分30秒触发 ：'30 1 1 * * *'
// 每月的1日1点1分30秒触发 ：'30 1 1 1 * *'
// 2016年的1月1日1点1分30秒触发 ：'30 1 1 1 2016 *'
// 每周1的1点1分30秒触发 ：'30 1 1 * * 1'
// 上面的太反人类了。

// 每隔10秒执行，设置 rule.second =[0,10,20,30,40,50]即可。
// 每秒执行就是rule.second =[0,1,2,3......59]
// 每分钟0秒执行就是rule.second =0
// 每小时30分执行就是rule.minute =30;rule.second =0;
// 每天0点执行就是rule.hour =0;rule.minute =0;rule.second =0;
// 每月1号的10点就是rule.date =1;rule.hour =10;rule.minute =0;rule.second =0;
// 每周1，3，5的0点和12点就是rule.dayOfWeek =[1,3,5];rule.hour =[0,12];rule.minute =0;rule.second =0;

// const allSecond = []; // [0,1,2,3,4,5.....59]
// for (let i = 0; i < 60; i += 1) {
//   allSecond.push(i);
// }
// rule.second = allSecond;
/**
 * rule.hour = [0, 3, 6, 9, 12, 14, 16, 18, 20, 22]
 * 每三小时执行一次，切记还要添加rule.minute = 0，否则会造成如：到了00：00：00的时候，执行了任务
 * 00：01：00，又会一次执行任务，00：02：00，又会一次执行任务，以此类推，直到00：59：00，还会一次执行任务，
 * 等到了01：00：00时候才不会执行，后面的也是以此类推，因此得加上rule.minute = 0才可以，
 * 这样就代表了00：00：00，03：00：00，06：00：00，09：00：00等时间才执行一次
 */
const rule = new schedule.RecurrenceRule();
// rule.hour = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const allMinute = 60;
const minuteArr = [];
for (let i = 0; i < allMinute; i += 1) {
  minuteArr.push(i);
}
// 每十分钟监控一次
rule.minute = minuteArr.filter((v) => v % 10 === 0);
// 每十秒钟监控一次
// rule.second = minuteArr.filter((v) => v % 10 === 0);

export const monitMemoryJob = () => {
  console.log(chalkWRAN('监控内存任务开始启动！'));
  schedule.scheduleJob('monitMemoryJob', rule, () => {
    if (PROJECT_ENV !== 'prod') {
      console.log(
        chalkINFO(
          `执行monitMemoryJob定时任务，${dayjs().format('YYYY-MM-DD HH:mm:ss')}`
        )
      );
      conner();
    } else {
      console.log(
        chalkWRAN(
          `非生产环境，不执行monitMemoryJob定时任务，${dayjs().format(
            'YYYY-MM-DD HH:mm:ss'
          )}`
        )
      );
    }
  });
};
