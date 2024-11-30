
import axios from 'axios';
import config from '../../app/config';

interface ICreateOrderPayload {
  consignee_name: string;
  consignee_phone: string;
  consignee_address: string;
  consignee_city: string;
  consignee_zone: string;
  parcel_details: string;
  delivery_type: string;
  payment_method: string;
  amount_to_collect: number;
  merchant_order_id?: string;
  special_instruction?: string;
}

const createOrderData = async (payload: ICreateOrderPayload) => {
  try {
    const response = await axios.post(
      `${config.steadfast.baseUrl}/create_order`,
      {
        api_key: config.steadfast.apiKey,
        ...payload
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    throw new Error('Failed to create order in SteadFast');
  }
};

export const SteadFastService = {
  createOrderData
};
