export interface Vow {
  id: string | number;
  name: string;
  vow_text: string;
  created_at?: string;
  date?: string;
  timestamp?: string | number;
  block_hash?: string;
  status?: string;
}

export interface ApiResponse<T = any> {
  status?: string | boolean;
  success?: boolean;
  message?: string;
  data?: T;
  id?: string | number;
  vows?: Vow[];
  [key: string]: any;
}
