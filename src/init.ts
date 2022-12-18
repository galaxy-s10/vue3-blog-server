import aliasOk from './app/alias'; // 这个后面的代码才能用@别名
import { handleSecretFile, handleUploadDir } from './utils/handleInit';

aliasOk(); // 处理路径别名
handleSecretFile(); // 处理秘钥文件(src.config/secret.ts)
handleUploadDir(); // 处理文件上传目录(src/upload)
