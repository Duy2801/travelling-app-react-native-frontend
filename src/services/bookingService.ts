import api from './api';
import { Tour } from './tourService';

export interface Booking {
  id: string;
  userId: string;
  tourId: string | Tour; // Can be populated
  hotelId?: string;
  services?: string[];
  numberOfPeople: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  createdAt: string;
  updatedAt: string;
  tour?: any;
  hotel?: any;
}

export interface CreateBookingData {
  tourId: string;
  hotelId?: string;
  services?: string[];
  numberOfPeople: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
}

export interface GetBookingsParams {
  userId?: string;
  tourId?: string;
  status?: string;
  paymentStatus?: string;
  sortBy?: string;
  limit?: number;
  page?: number;
}

export interface BookingsResponse {
  results: Booking[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

export const createBooking = async (data: CreateBookingData): Promise<Booking> => {
  const response = await api.post('/bookings', data);
  return response.data;
};

export const getMyBookings = async (params?: GetBookingsParams): Promise<BookingsResponse> => {
  const response = await api.get('/bookings/my-bookings', { params });
  return response.data;
};

export const getBookingById = async (bookingId: string): Promise<Booking> => {
  const response = await api.get(`/bookings/${bookingId}`);
  return response.data;
};

export const cancelBooking = async (bookingId: string): Promise<Booking> => {
  const response = await api.patch(`/bookings/${bookingId}/cancel`);
  return response.data;
};

export const updateBooking = async (bookingId: string, data: Partial<CreateBookingData>): Promise<Booking> => {
  const response = await api.patch(`/bookings/${bookingId}`, data);
  return response.data;
};
