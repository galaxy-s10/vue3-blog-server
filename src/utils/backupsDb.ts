import dayjs from 'dayjs';
import schedule from 'node-schedule';
import { Client } from 'ssh2';

import { chalkINFO, chalkWRAN } from '@/app/chalkTip';
import { MYSQL_CONFIG, SSH_CONFIG } from '@/config/secret';
import qiniuController from '@/utils/qiniu';

// 备份目录
const backupsDirectory = '/node/backups/';

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

// 备份的文件名
const backupsFileName = () => {
  const res = MYSQL_CONFIG.database + dayjs().format('YYYY_MM_DD_HH_mm_ss');
  return res;
};

// 备份数据库命令
const backupsCmd = (fileName) => {
  return `mysqldump -h${MYSQL_CONFIG.host} -u${MYSQL_CONFIG.username} -p${MYSQL_CONFIG.password} --databases ${MYSQL_CONFIG.database} > ${backupsDirectory}${fileName}.sql`;
};

const conner = () => {
  const conn = new Client();

  conn
    .on('ready', () => {
      const fileName = backupsFileName();
      conn.exec(
        `
        ${backupsDirectoryIsExistCmd}
        ${backupsCmd(fileName)}
    `,
        (error, stream) => {
          if (error) throw error;
          stream
            .on('close', async () => {
              console.log('close');
              qiniuController
                .uploadBackupsDb(`${backupsDirectory + fileName}.sql`)
                .then(() => {
                  console.log('备份成功!');
                })
                .catch((err) => {
                  console.log('备份失败!', err);
                })
                .finally(() => {
                  conn.end();
                });
            })
            .on('data', (data) => {
              console.log(`STDOUT: ${data}`);
            })
            .stderr.on('data', (data) => {
              console.log(`STDERR: ${data}`);
            });
        }
      );
      // conn.shell((err, stream) => {
      //   if (err) {
      //     throw err;
      //   }
      //   stream
      //     .on('close', () => {
      //       console.log('关闭。');
      //       // qiniuController.uploadBackupsDb();
      //       conn.end();
      //     })
      //     .on('data', (data) => {
      //       console.log(chalkINFO('OUTPUT:'));
      //       console.log(chalkINFO(data));
      //     })
      //     .end(
      //       `
      //           ${backupsDirectoryIsExistCmd}
      //           ${backupsCmd(backupsFileName())}
      //       `
      //     );
      // });
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
rule.hour = [0, 12];
rule.minute = 0;
export const dbJob = schedule.scheduleJob('dbJob', rule, () => {
  if (process.env.REACT_BLOG_SERVER_ENV === 'development') {
    console.log(chalkWRAN('本地开发模式，不执行定时任务'));
  } else {
    console.log(
      chalkINFO(`执行dbJob定时任务，${dayjs().format('YYYY-MM-DD HH:mm:ss')}`)
    );
    conner();
  }
});
