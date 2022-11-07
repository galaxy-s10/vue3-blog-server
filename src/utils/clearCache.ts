import { Client } from 'ssh2';

import { handleData } from './index';

import { SSH_CONFIG } from '@/config/secret';
import { chalkERROR, chalkINFO } from '@/utils/chalkTip';

// 重启pm2进程命令
const restartPm2Cmd = () => {
  return `pm2 restart all`;
};

// 清除buff/cache命令
const clearCacheCmd = () => {
  return `sync;echo 3 > /proc/sys/vm/drop_caches;`;
};

// 查看内存命令
const freeCmd = () => {
  return `free -b`;
};

export const restartPm2 = () => {
  const conn = new Client();

  conn
    .on('ready', () => {
      conn.exec(
        `
        ${restartPm2Cmd()}
        `,
        (error, stream) => {
          if (error) throw error;
          stream
            .on('close', () => {
              console.log('close');
            })
            .on('data', (data: string) => {
              console.log(`STDOUT: ${data}`);
            })
            .stderr.on('data', (data: string) => {
              console.log(`STDERR: ${data}`);
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

export const clearCache = () => {
  const conn = new Client();

  conn
    .on('ready', () => {
      conn.exec(
        `
        ${clearCacheCmd()}
        `,
        (error, stream) => {
          if (error) throw error;
          stream
            .on('close', () => {
              console.log('close');
            })
            .on('data', (data: string) => {
              console.log(`STDOUT: ${data}`);
            })
            .stderr.on('data', (data: string) => {
              console.log(`STDERR: ${data}`);
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

export const showMemory = async () => {
  const conn = new Client();
  const result = await new Promise((resolve, reject) => {
    conn
      .on('ready', () => {
        conn.exec(
          `
            ${freeCmd()}
            `,
          (error, stream) => {
            if (error) throw error;
            stream
              .on('close', () => {
                console.log('close');
              })
              .on('data', (data) => {
                console.log(chalkINFO(`==========STDOUT==========`));
                const res = handleData(data.toString());
                resolve(res);
              })
              .stderr.on('data', (data) => {
                console.log(chalkERROR(`==========STDERR==========`));
                console.log(data.toString());
                reject(new Error(data.toString()));
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
  });
  return result;
};
