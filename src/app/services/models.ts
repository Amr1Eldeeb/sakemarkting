export interface MarketingService {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
}

export interface Employee {
  id: number;
  fullName: string;
  subTitle: string;
  imageUrl: string;
}

export interface ConsultationRequest {
  name: string;
  phoneNumber: string;
  email: string;
  message: string;
  companyName: string;
  estimatedBudget: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface ApiMessageResponse {
  message?: string;
}
