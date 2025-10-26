import api from './api';

export type ServiceType = 'transport' | 'food' | 'guide' | 'ticket' | 'other';

export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  type: ServiceType;
  createdAt: string;
  updatedAt: string;
}

export interface GetServicesParams {
  type?: ServiceType;
  name?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  limit?: number;
  page?: number;
}

export interface ServicesResponse {
  results: Service[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

export const getServices = async (params?: GetServicesParams): Promise<ServicesResponse> => {
  try {
    const response = await api.get('/services', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching services:', error);
    throw error;
  }
};

export const getServiceById = async (id: string): Promise<Service> => {
  try {
    const response = await api.get(`/services/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching service:', error);
    throw error;
  }
};

export const searchServices = async (params: GetServicesParams): Promise<ServicesResponse> => {
  try {
    const response = await api.get('/services/search', { params });
    return response.data;
  } catch (error) {
    console.error('Error searching services:', error);
    throw error;
  }
};

export const getServiceTypeLabel = (type: ServiceType): string => {
  const labels: Record<ServiceType, string> = {
    transport: '🚗 Vận chuyển',
    food: '🍽️ Ăn uống',
    guide: '👨‍🏫 Hướng dẫn viên',
    ticket: '🎫 Vé tham quan',
    other: '📦 Khác',
  };
  return labels[type] || labels.other;
};

export const getServiceTypeIcon = (type: ServiceType): string => {
  const icons: Record<ServiceType, string> = {
    transport: '🚗',
    food: '🍽️',
    guide: '👨‍🏫',
    ticket: '🎫',
    other: '📦',
  };
  return icons[type] || icons.other;
};
