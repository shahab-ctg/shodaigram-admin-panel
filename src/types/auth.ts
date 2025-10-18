export type AdminLoginDTO = {
  email: string;
  password: string;
}


export type AdminLoginRes = {
  ok: boolean;
  data?: {accessToken: string};
  code?: string;
}