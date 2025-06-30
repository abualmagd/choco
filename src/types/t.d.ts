interface MyError {
  code: number;
  message: string;
  error: string;
}

interface MyResponse {
  data: any;
  error: MyError | null;
}
