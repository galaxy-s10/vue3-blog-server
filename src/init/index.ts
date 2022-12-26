import fs from 'fs';

import { aliasOk } from './alias'; // 这个后面的代码才能用@别名

import { UPLOAD_DIR, SECRET_FILE, SECRETTEMP_FILE } from '@/constant';

function handleSecretFile() {
  const isExist = fs.existsSync(SECRET_FILE);
  if (!isExist) {
    const secretTemp = fs.readFileSync(SECRETTEMP_FILE);
    fs.writeFileSync(SECRET_FILE, secretTemp.toString());
  }
}

function handleUploadDir() {
  const isExist = fs.existsSync(UPLOAD_DIR);
  if (!isExist) {
    fs.mkdirSync(UPLOAD_DIR);
  }
}

aliasOk(); // 处理路径别名
handleSecretFile(); // 处理秘钥文件(src.config/secret.ts)
handleUploadDir(); // 处理文件上传目录(src/upload)
