export interface IRegister {
  name: string;
  email: string;
  password: string;
}

export interface ILogin {
  email: string;
  password: string;
}

export interface ITokenPayload {
  id: string;
  email: string;
  role: string;
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface IVerifyEmail {
  email: string;
  otp: string;
}

export interface IResendOtp {
  email: string;
}
