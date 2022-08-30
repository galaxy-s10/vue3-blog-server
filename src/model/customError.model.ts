export class CustomError extends Error {
  code: number;

  errorCode: number;

  constructor(message = '服务器错误', code = 500, errorCode = 1000) {
    super();
    this.message = message;
    this.code = code;
    this.errorCode = errorCode;
  }
}
