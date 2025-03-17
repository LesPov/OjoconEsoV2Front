export interface auth {
  id?: number;
  username: string;
  password: string; 
  email: string;
  rol?: string;
  status?: 'Activado' | 'Desactivado';
  passwordorrandomPassword?: string;
}
