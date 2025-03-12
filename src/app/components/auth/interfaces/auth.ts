export interface auth {
  id?: number;
  username: string;
  password: string;
  email: string; // Si lo necesitas obligatorio, si no, puedes hacer email?: string;
  rol?: string;
  passwordorrandomPassword?: string; // Para permitir el uso de contraseña o contraseña aleatoria
}
