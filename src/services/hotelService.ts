import api from './api';

export interface Hotel {
  id: string;
  name: string;
  address: string;
  city: string;
  description?: string;
  rating: number;
  pricePerNight: number;
  amenities: string[];
  images: string[];
  contactInfo?: {
    phone?: string;
    email?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface GetHotelsParams {
  city?: string;
  name?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy?: string;
  limit?: number;
  page?: number;
}

export interface HotelsResponse {
  results: Hotel[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

export const getHotels = async (params?: GetHotelsParams): Promise<HotelsResponse> => {
  const response = await api.get('/hotels', { params });
  return response.data;
};

export const getHotelById = async (hotelId: string): Promise<Hotel> => {
  const response = await api.get(`/hotels/${hotelId}`);
  return response.data;
};

export const searchHotels = async (params: GetHotelsParams): Promise<HotelsResponse> => {
  const response = await api.get('/hotels/search', { params });
  return response.data;
};
