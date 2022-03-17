import dayjs from 'dayjs';
import schedule from 'node-schedule';
import { Client } from 'ssh2';

import { chalkINFO } from '@/app/chalkTip';
import { mysqlConfig, sshConfig } from '@/config/secret';
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
  const res = mysqlConfig.database + dayjs().format('YYYY_MM_DD_HH_mm_ss');
  return res;
};

// 备份数据库命令
const backupsCmd = (fileName) => {
  return `mysqldump -h${mysqlConfig.host} -u${mysqlConfig.username} -p${mysqlConfig.password} --databases ${mysqlConfig.database} > ${backupsDirectory}${fileName}.sql`;
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
                  console.log('备份成功');
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
      host: sshConfig.host,
      port: sshConfig.port,
      username: sshConfig.username,
      password: sshConfig.password,
    });
};
conner();

// https://github.com/node-schedule/node-schedule#cron-style-scheduling
// 每分钟的第30秒触发： '30 * * * * *'
// 每小时的1分30秒触发 ：'30 1 * * * *'
// 每天的凌晨1点1分30秒触发 ：'30 1 1 * * *'
// 每月的1日1点1分30秒触发 ：'30 1 1 1 * *'
// 2016年的1月1日1点1分30秒触发 ：'30 1 1 1 2016 *'
// 每周1的1点1分30秒触发 ：'30 1 1 * * 1'
// schedule.scheduleJob('0 0 0 * * *', () => {
schedule.scheduleJob('*/50 * * * * *', () => {
  console.log('每24小时备份一次数据库');
  // conner();
});
