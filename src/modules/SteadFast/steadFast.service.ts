import axios from "axios";
import httpStatus from "http-status";
import AppError from "../../app/error/AppError";
import { Tracking } from "../TrackingIntegrations/tracking.model";
import OrderModel from "../Orders/orders.model";

const BASE_URL = "https://portal.steadfast.com.bd/api/v1";

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
           cod_amount: localOrder.paymentInfo?.paymentMethod === 'cash on delivery' ? localOrder.totalAmount : 0,
           note: localOrder.billingInformation.notes || "Handle with care",
       };
  }

  try {
    const response = await axios.post(`${BASE_URL}/create_order`, payload, { headers });
    
    // Auto-update local order if we have one
    if (localOrder && response.data?.consignment?.consignment_id) {
        localOrder.consignment_id = response.data.consignment.consignment_id;
        // Map Steadfast status to local status if needed, or just keep as is until webhook/status check
        // Usually creation implies 'Processing' or 'Shipped' depending on workflow. 
        // User asked for "steadfast order status automaticaly update on the site". 
        // Initial status from Steadfast is usually 'pending' (in their system).
        // Let's set local status to 'Start With Courier' -> maybe just 'Processing' or 'Shipped'?
        // Existing enums: ['pending', 'processing', 'shipped', 'completed', 'cancelled']
        // Let's move to 'shipped' if it was pending/processing
        if(localOrder.status === 'pending' || localOrder.status === 'processing'){
            localOrder.status = 'shipped'; 
        }
        await localOrder.save();
    }
    
    return response.data;
  } catch (error: any) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      error.response?.data?.message || "Failed to create order in Steadfast"
    );
  }
};

const bulkCreateOrder = async (orders: any[]) => {
  const headers = await getHeaders();
  try {
    const response = await axios.post(`${BASE_URL}/create_order/bulk-order`, { data: orders }, { headers });
    return response.data;
  } catch (error: any) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      error.response?.data?.message || "Failed to create bulk orders in Steadfast"
    );
  }
};

const checkDeliveryStatus = async (consignmentId: string) => {
  const headers = await getHeaders();
  try {
    const response = await axios.get(`${BASE_URL}/status_by_cid/${consignmentId}`, { headers });
    return response.data;
  } catch (error: any) {
      if(error.response?.status === 404){
           throw new AppError(httpStatus.NOT_FOUND, "Consignment ID not found");
      }
    throw new AppError(
      httpStatus.BAD_REQUEST,
      error.response?.data?.message || "Failed to fetch delivery status"
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
