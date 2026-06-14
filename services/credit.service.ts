import backendApi from '@/lib/backendApi';

export interface CreditRequest {
  id: number;
  vehicle_id: number;
  vehicle_plate: string;
  pump_id: number;
  pump_name: string;
  requested_limit: number;
  status: 'pending' | 'approved' | 'rejected';
  remarks?: string;
  requested_at: string;
}

export interface CreateCreditRequestDto {
  vehicle_id: number;
  pump_id: number;
  requested_limit: number;
  remarks?: string;
}

export const creditService = {
  getLogisticRequests: async (): Promise<CreditRequest[]> => {
    try {
      const response = await backendApi.get('/credit/request');
      return response.data;
    } catch (error) {
      console.error('[CreditService] Failed to fetch logistic credit requests:', error);
      throw error;
    }
  },

  createRequest: async (data: CreateCreditRequestDto): Promise<CreditRequest> => {
    try {
      const response = await backendApi.post('/credit/request', data);
      return response.data;
    } catch (error) {
      console.error('[CreditService] Failed to create credit request:', error);
      throw error;
    }
  },

  getPumpOwnerPendingRequests: async (): Promise<CreditRequest[]> => {
    try {
      const response = await backendApi.get('/credit/pending');
      return response.data;
    } catch (error) {
      console.error('[CreditService] Failed to fetch pump owner pending requests:', error);
      throw error;
    }
  },

  approveRequest: async (id: number): Promise<any> => {
    try {
      const response = await backendApi.post(`/credit/approve/${id}`);
      return response.data;
    } catch (error) {
      console.error('[CreditService] Failed to approve credit request:', error);
      throw error;
    }
  }
};
