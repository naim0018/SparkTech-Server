import axios from "axios";
import httpStatus from "http-status";
import AppError from "../../app/error/AppError";
import { Tracking } from "../TrackingIntegrations/tracking.model";
import OrderModel from "../Orders/orders.model";

const BASE_URL = " https://portal.packzy.com/api/v1";

const getHeaders = async () => {
  const settings = await Tracking.findOne();
  if (!settings || !settings.steadfastApiKey || !settings.steadfastSecretKey) {
    throw new AppError(httpStatus.BAD_REQUEST, "Steadfast Courier credentials not found");
  }

  return {
    "Content-Type": "application/json",
    "Api-Key": settings.steadfastApiKey,
    "Secret-Key": settings.steadfastSecretKey,
  };
};

const createOrder = async (orderData: any) => {
  const headers = await getHeaders();
  // If orderId is provided, we fetch and update the local order
  // Expecting orderData to contain either full payload OR just an { orderId } to build payload from
  let payload = orderData;
  let localOrder = null;

  if (orderData.orderId && !orderData.invoice) {
       // It's a request to process a local order by ID
       localOrder = await OrderModel.findById(orderData.orderId);
       if (!localOrder) {
           throw new AppError(httpStatus.NOT_FOUND, "Order not found");
       }
       payload = {
           invoice: localOrder._id.toString(),
           recipient_name: localOrder.billingInformation.name,
           recipient_phone: localOrder.billingInformation.phone,
           recipient_address: localOrder.billingInformation.address,
           cod_amount: localOrder.totalAmount,
           note: localOrder.billingInformation.notes || "Handle with care",
       };
  }

  try {
    const response = await axios.post(`${BASE_URL}/create_order`, payload, { headers });
    console.log("Steadfast Response:", response.data);

    if (response.data.status !== 200) {
      const errorMsg = response.data.errors 
        ? Object.entries(response.data.errors).map(([k, v]) => `${k}: ${v}`).join(', ')
        : (response.data.message || "Failed to create order in Steadfast");
      throw new AppError(httpStatus.BAD_REQUEST, errorMsg);
    }

    // Auto-update local order if we have one
    if (localOrder && response.data?.consignment?.consignment_id) {
        const updatePayload: any = {
            consignment_id: response.data.consignment.consignment_id
        };
        // User asked to update the delivery status according to the steadfast.
        // Steadfast initial status is usually 'in_review' or 'pending'.
        if (response.data?.consignment?.status) {
            updatePayload.status = response.data.consignment.status; 
        }
        
        // Use findByIdAndUpdate to avoid validation errors on unrelated fields (e.g. courierCharge)
        await OrderModel.findByIdAndUpdate(localOrder._id, updatePayload);
    }
    
    return response.data;
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      httpStatus.BAD_REQUEST,
      error.response?.data?.message || error.message || "Failed to create order in Steadfast"
    );
  }
};

const bulkCreateOrder = async (orders: any[]) => {
  const headers = await getHeaders();
  try {
    const response = await axios.post(`${BASE_URL}/create_order/bulk-order`, { data: orders }, { headers });
    
    if (response.data.status !== 200) {
        throw new AppError(httpStatus.BAD_REQUEST, response.data.message || "Failed to create bulk orders in Steadfast");
    }

    return response.data;
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      httpStatus.BAD_REQUEST,
      error.response?.data?.message || error.message || "Failed to create bulk orders in Steadfast"
    );
  }
};

const checkDeliveryStatus = async (consignmentId: string) => {
  const headers = await getHeaders();
  try {
    const response = await axios.get(`${BASE_URL}/status_by_cid/${consignmentId}`, { headers });
    
    if (response.data.status !== 200) {
        throw new AppError(httpStatus.BAD_REQUEST, response.data.message || "Failed to fetch delivery status");
    }

    const data = response.data;

    // Sync status with local order if available
    if (data?.delivery_status) {
        await OrderModel.findOneAndUpdate(
            { consignment_id: consignmentId },
            { status: data.delivery_status }
        );
    }

    return data;
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    if(error.response?.status === 404){
           throw new AppError(httpStatus.NOT_FOUND, "Consignment ID not found");
    }
    throw new AppError(
      httpStatus.BAD_REQUEST,
      error.response?.data?.message || error.message || "Failed to fetch delivery status"
    );
  }
};

const getCurrentBalance = async () => {
  const headers = await getHeaders();
  try {
    const response = await axios.get(`${BASE_URL}/current_balance`, { headers });
    return response.data;
  } catch (error: any) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      error.response?.data?.message || "Failed to fetch current balance"
    );
  }
};

const getReturnRequests = async (params: any) => {
  const headers = await getHeaders();
  try {
     // Based on documentation provided in context request: "Get Return Requests"
     // Usually straightforward GET with optional query params
    const response = await axios.get(`${BASE_URL}/return_requests`, { headers, params });
    return response.data;
  } catch (error: any) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      error.response?.data?.message || "Failed to fetch return requests"
    );
  }
};

const getPoliceStations = async () => {
    // "Get Policestations" - Assuming endpoint /police_stations or similar utility
    // If auth is not required for public utility, we might relax headers, but usually keys are needed
    const headers = await getHeaders(); 
    try {
      const response = await axios.get(`${BASE_URL}/police_stations`, { headers });
      return response.data;
    } catch (error: any) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        error.response?.data?.message || "Failed to fetch police stations"
      );
    }
  };

export const SteadfastService = {
  createOrder,
  bulkCreateOrder,
  checkDeliveryStatus,
  getCurrentBalance,
  getReturnRequests,
  getPoliceStations
};
