export class ResError implements MyError {
  code: number;
  message: string;
  error: string;

  constructor(code: number, message: string, error: string) {
    (this.code = code), (this.message = message), (this.error = error);
  }
}

export class CustomResponse implements MyResponse {
  data: any;
  error: MyError | null;

  constructor(data: any, error: MyError | null) {
    (this.data = data), (this.error = error);
  }
}
