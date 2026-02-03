import { Request } from "express";
import { OrderInterface } from "./orders.interface";
import { OrderSchema } from "./orders.model";
import { ProductSchema } from "../Product/product.model";
import { getTenantModel } from "../../app/utils/getTenantModel";

const addOrderData = async (req: Request, payload: OrderInterface) => {
  const OrderModel = getTenantModel(req, 'Order', OrderSchema);
  const ProductModel = getTenantModel(req, 'Product', ProductSchema);
  // Validate totals and prices for security
  let calculatedSubtotal = 0;
  let maxDeliveryChargeInside = 0;
  let maxDeliveryChargeOutside = 0;
  let hasFreeShipping = false;

  for (const item of payload.items) {
    const product = await ProductModel.findById(item.product);
    if (!product) throw new Error(`Product ${item.product} not found`);

    // Determine base price
    let basePrice = product.price.discounted || product.price.regular;

    // Apply bulk pricing
    if (product.bulkPricing && product.bulkPricing.length > 0) {
      const sortedBulk = [...product.bulkPricing].sort(
        (a, b) => b.minQuantity - a.minQuantity
      );
      const tier = sortedBulk.find((t) => item.quantity >= t.minQuantity);
      if (tier) {
        // If tier.price is much larger than base, it is a bundle total (e.g. 3 for 900)
        // We calculate the unit price from the bundle total.
        basePrice = tier.price >= basePrice * 1.5 ? tier.price / tier.minQuantity : tier.price;
      }
    }

    // Add variant prices (handling multi-selection arrays)
    let unitPrice = basePrice;
    if (item.selectedVariants) {
      for (const [groupName, selections] of Object.entries(item.selectedVariants)) {
        const variantGroup = product.variants?.find((v) => v.group === groupName);
        const selectionsArr = Array.isArray(selections) ? selections : [selections];

        for (const selection of selectionsArr) {
          const variantItem = variantGroup?.items.find(
            (i) => i.value === selection.value
          );
          if (variantItem?.price) {
            unitPrice += variantItem.price;
          }
        }
      }
    }

    // Force the price in the payload to match DB reality
    item.price = unitPrice;
    calculatedSubtotal += unitPrice * item.quantity;

    // Track delivery charges
    if (product.additionalInfo?.freeShipping) hasFreeShipping = true;
    maxDeliveryChargeInside = Math.max(maxDeliveryChargeInside, product.basicInfo.deliveryChargeInsideDhaka || 0);
    maxDeliveryChargeOutside = Math.max(maxDeliveryChargeOutside, product.basicInfo.deliveryChargeOutsideDhaka || 0);
  }

  // Calculate delivery
  let deliveryCharge = 0;
  if (!hasFreeShipping) {
    deliveryCharge = payload.courierCharge === 'insideDhaka' 
      ? (maxDeliveryChargeInside || 80) 
      : (maxDeliveryChargeOutside || 150);
  }

  // Save the calculated delivery charge
  payload.deliveryCharge = deliveryCharge;

  // Apply discount if any
  const discount = payload.discount || 0;

  // Final validation of totalAmount
  payload.totalAmount = calculatedSubtotal + deliveryCharge - discount;

  const result = await OrderModel.create(payload);
  return result;
};

const getAllOrdersData = async (req: Request, query: Record<string, unknown>) => {
  const OrderModel = getTenantModel(req, 'Order', OrderSchema);
  const {
      search,
      status,
      sort,
      order,
      page = 1,
      limit = 10
  } = query;

  let filter: any = {};

  if (search) {
      filter.$or = [
          { 'billingInformation.name': { $regex: search, $options: 'i' } },
          { 'billingInformation.phone': { $regex: search, $options: 'i' } },
          { consignment_id: { $regex: search, $options: 'i' } },
      ];
      // Check if search looks like a valid MongoDB ObjectId
      if (typeof search === 'string' && /^[0-9a-fA-F]{24}$/.test(search)) {
          filter.$or.push({ _id: search });
      }
  }

  if (status && status !== 'all') {
      filter.status = { $regex: `^${status}$`, $options: 'i' };
  }

  const skip = (Number(page) - 1) * Number(limit);
  
  let sortCriteria: any = { createdAt: -1 };
  if (sort) {
      sortCriteria = { [sort as string]: order === 'asc' ? 1 : -1 };
  }

  const result = await OrderModel
      .find(filter)
      .populate("items.product", "basicInfo.title price bulkPricing basicInfo.description basicInfo.brand basicInfo.category basicInfo.subcategory variants images")
      .sort(sortCriteria)
      .skip(skip)
      .limit(Number(limit));

  const total = await OrderModel.countDocuments(filter);

  return {
    data: result,
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPage: Math.ceil(total / Number(limit))
    }
  };
};

const getOrderByIdData = async (req: Request, id: string) => {
  const OrderModel = getTenantModel(req, 'Order', OrderSchema);
  const result = await OrderModel.findById(id).populate("items.product", "basicInfo.title price bulkPricing basicInfo.description basicInfo.brand basicInfo.category basicInfo.subcategory variants images");
  return result;
};

const updateOrderDataById = async (
  req: Request,
  id: string,
  updateData: Partial<OrderInterface>
) => {
  const OrderModel = getTenantModel(req, 'Order', OrderSchema);
  return await OrderModel.findByIdAndUpdate(id, updateData, {
    new: true,
  }).populate("items.product");
};

const deleteOrderDataById = async (req: Request, id: string) => {
  const OrderModel = getTenantModel(req, 'Order', OrderSchema);
  return await OrderModel.findByIdAndDelete(id);
};

const trackOrderByPhoneData = async (req: Request, phone: string) => {
  const OrderModel = getTenantModel(req, 'Order', OrderSchema);
  const result = await OrderModel.find({ "billingInformation.phone": phone })
    .populate("items.product", "basicInfo.title price bulkPricing basicInfo.description basicInfo.brand basicInfo.category basicInfo.subcategory variants images")
    .sort({ createdAt: -1 });
  return result;
};

const trackOrderByConsignmentIdData = async (req: Request, consignmentId: string) => {
  const OrderModel = getTenantModel(req, 'Order', OrderSchema);
  const result = await OrderModel.findOne({ consignment_id: consignmentId })
    .populate("items.product", "basicInfo.title price bulkPricing basicInfo.description basicInfo.brand basicInfo.category basicInfo.subcategory variants images");
  return result;
};

export const OrderService = {
  addOrderData,
  getAllOrdersData,
  getOrderByIdData,
  trackOrderByPhoneData,
  trackOrderByConsignmentIdData,
  updateOrderDataById,
  deleteOrderDataById,
};

