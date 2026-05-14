export interface AdminBasic {
  id: string;
  nombre: string;
  email: string;
}

export interface AuthResponse {
  accessToken: string;
  admin: AdminBasic;
}