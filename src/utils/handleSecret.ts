import path from 'path';

import fs from 'fs-extra';

export const handleSecretFile = () => {
  const secretFilePath = path.join(__dirname, '../config/secret.ts');
  const isExist = fs.existsSync(secretFilePath);
  if (!isExist) {
    const secretTemp = fs.readFileSync(
      path.join(__dirname, '../config/secretTemp.ts')
    );
    fs.writeFileSync(secretFilePath, secretTemp.toString());
  }
};
