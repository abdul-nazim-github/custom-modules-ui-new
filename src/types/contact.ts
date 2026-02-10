export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactItem extends ContactFormData {
  _id: string;
  status: number;
  created_at: string;
}

export interface ContactListResponse {
  data: ContactItem[];
  meta?: {
    totalCount: number;
    from: number;
    to: number;
  };
  message?: string;
  success?: boolean;
}

export interface ContactDetailResponse {
  data: ContactItem;
  message?: string;
  success?: boolean;
}
