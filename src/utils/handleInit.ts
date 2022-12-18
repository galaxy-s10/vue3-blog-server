import fs from 'fs';

import { UPLOAD_DIR, SECRET_FILE, SECRETTEMP_FILE } from '@/constant';

export const handleSecretFile = () => {
  const isExist = fs.existsSync(SECRET_FILE);
  if (!isExist) {
    const secretTemp = fs.readFileSync(SECRETTEMP_FILE);
    fs.writeFileSync(SECRET_FILE, secretTemp.toString());
  }
};

export const handleUploadDir = () => {
  const isExist = fs.existsSync(UPLOAD_DIR);
  if (!isExist) {
    fs.mkdirSync(UPLOAD_DIR);
  }
};
