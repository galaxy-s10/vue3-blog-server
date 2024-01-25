import dayjs from 'dayjs';
import schedule from 'node-schedule';
import { Client } from 'ssh2';

import { MONIT_JOB, MONIT_TYPE, PROJECT_ENV, QINIU_BACKUP } from '@/constant';
import { MYSQL_CONFIG, SSH_CONFIG } from '@/secret/secret';
import monitService from '@/service/monit.service';
import qiniuDataService from '@/service/qiniuData.service';
import QiniuBackupUtils from '@/utils/backup-qiniu';
import { chalkINFO, chalkSUCCESS, chalkWARN } from '@/utils/chalkTip';

// 备份目录
const backupDirectory = '/node/backup/mysql/';

// 备份的文件名
const backupsFileName = () => {
  const res = `${MYSQL_CONFIG.database}___${dayjs().format(
    'YYYYMMDDHHmmss'
  )}.sql`;
  return res;
};

// 备份目录是否存在
const backupsDirectoryIsExistCmd = `
if [ ! -d "${backupDirectory}" ];then
echo "备份目录不存在，先创建备份目录${backupDirectory}"
mkdir -p ${backupDirectory}
echo "创建备份目录完成，开始备份"
else
echo "备份目录已存在，开始备份"
fi
`;

// 备份数据库命令
const backupsCmd = (fileName: string) => {
  // ssh操作时，不能使用docker exec -it，否则报错：the input device is not a TTY
  return `docker exec -i ${MYSQL_CONFIG.docker.container} mysqldump -h${
    MYSQL_CONFIG.host
  } -u${MYSQL_CONFIG.username} -p${MYSQL_CONFIG.password} --databases ${
    MYSQL_CONFIG.database
  } > ${backupDirectory + fileName}`;
};

export const main = (user_id?: number) => {
  const conn = new Client();

  conn
    .on('ready', () => {
      const fileName = backupsFileName();
      let errMsg = '';
      function handleError(err) {
        const info = `备份${MYSQL_CONFIG.database}数据库失败！`;
        console.log(info, err);
        monitService.create({
          type: MONIT_TYPE.BACKUP_DB_ERR,
          info: JSON.stringify(err),
        });
      }
      conn.exec(
        `
        ${backupsDirectoryIsExistCmd}
        ${backupsCmd(fileName)}
    `,
        (error, stream) => {
          if (error) throw error;
          stream
            .on('close', (data) => {
              console.log('close', data);
              if (errMsg !== '') {
                handleError(errMsg);
                return;
              }
              console.log('开始上传到七牛云');
              const prefix = QINIU_BACKUP.prefix['mysql/'];
              const filepath = `${backupDirectory + fileName}`;
              QiniuBackupUtils.uploadForm({
                prefix,
                filepath,
                originalFilename: fileName,
              })
                .then(({ flag, respBody, respErr, respInfo, putTime }) => {
                  if (flag) {
                    const info = `备份${MYSQL_CONFIG.database}数据库成功！`;
                    console.log(info);
                    monitService.create({
                      type: MONIT_TYPE.BACKUP_DB_OK,
                      info,
                    });
                    qiniuDataService.create({
                      user_id,
                      prefix,
                      bucket: respBody.bucket,
                      qiniu_key: respBody.key,
                      qiniu_fsize: respBody.fsize,
                      qiniu_hash: respBody.hash,
                      qiniu_mimeType: respBody.mimeType,
                      qiniu_putTime: putTime,
                    });
                  } else {
                    const info = `备份${MYSQL_CONFIG.database}数据库失败！`;
                    console.log(info);
                    monitService.create({
                      type: MONIT_TYPE.BACKUP_DB_ERR,
                      info: JSON.stringify({ respBody, respErr, respInfo }),
                    });
                  }
                })
                .catch((err) => {
                  handleError(err);
                })
                .finally(() => {
                  console.log('关闭ssh连接');
                  conn.end();
                });
            })
            .on('data', (data) => {
              console.log(`==========STDOUT==========`);
              console.log(data.toString());
            })
            .stderr.on('data', (data) => {
              console.log(`==========STDERR==========`);
              const msg: string = data.toString();
              console.log(msg);
              if (
                msg.indexOf(
                  'mysqldump: [Warning] Using a password on the command line interface can be insecure.'
                ) === -1
              ) {
                errMsg = msg;
              }
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

// 每12小时执行
rule.hour = allHourArr.filter((v) => v % 12 === 0);
rule.minute = 0;

export const monitBackupDbJob = () => {
  console.log(chalkSUCCESS('监控任务: 备份数据库定时任务启动！'));
  const monitJobName = MONIT_JOB.BACKUPDB;
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
