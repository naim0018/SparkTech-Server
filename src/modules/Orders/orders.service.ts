import { Request } from "express";
import mongoose from "mongoose";
import { OrderInterface } from "./orders.interface";
import { OrderSchema } from "./orders.model";
import { ProductSchema } from "../Product/product.model";
import { getTenantModel } from "../../app/utils/getTenantModel";

// Helper to generate Unique Readable ID
const generateOrderId = async (OrderModel: any): Promise<string> => {
  const lastOrder = await OrderModel.findOne({}, { orderId: 1 }).sort({ createdAt: -1 });
  let newId = 1001;
  if (lastOrder && lastOrder.orderId) {
    const parts = lastOrder.orderId.split('-');
    if (parts.length === 3) newId = parseInt(parts[2]) + 1;
  }
  const year = new Date().getFullYear();
  return `ORD-${year}-${newId}`;
};

// Helper to resolve unit price for a variant selection
const resolveSelectionUnitPrice = (selection: any, product: any, basePrice: number): number => {
  if (selection.price && selection.price > 0) {
    return selection.price;
  }
  const baseVariantName = product.price?.baseVariantName;
  if (selection.value === baseVariantName) {
    return basePrice;
  }
  if (product.variants && product.variants.length > 0) {
    for (const group of product.variants) {
      const found = group.items?.find((i: any) => i.value === selection.value);
      if (found && found.price && found.price > 0) {
        return found.price;
      }
    }
  }
  return basePrice;
};

const addOrderData = async (req: Request, payload: OrderInterface) => {
  const OrderModel = getTenantModel(req, 'Order', OrderSchema);
  const ProductModel = getTenantModel(req, 'Product', ProductSchema);
  // Validate totals and prices for security
  let calculatedSubtotal = 0;
  let maxDeliveryChargeInside = 0;
  let maxDeliveryChargeOutside = 0;
  let hasFreeShipping = false;
  let hasFreeShippingInside = false;
  let hasFreeShippingOutside = false;
  let totalComboDiscount = 0;

  for (const item of payload.items) {
    const product = await ProductModel.findById(item.product);
    if (!product) throw new Error(`Product ${item.product} not found`);

    // Determine base price
    let basePrice = product.price.discounted || product.price.regular;

    // Calculate item total using Split Variant Logic or Standard Unit Price Logic
    let itemTotalExcludingBulkDocs = 0;
    let variantsHaveQuantities = false;
    
    // Check if variants have explicit quantities
    if (item.selectedVariants) {
       for (const selections of Object.values(item.selectedVariants)) {
          const arr = Array.isArray(selections) ? selections : [selections];
          for (const s of arr) {
             if (s.quantity && s.quantity > 0) {
                variantsHaveQuantities = true;
                break;
             }
          }
          if (variantsHaveQuantities) break;
       }
    }

    if (variantsHaveQuantities) {
       // SPLIT VARIANT LOGIC: Sum of (VariantPrice * VariantQty) + (RemainingQty * BasePrice)
       let totalVariantQty = 0;
       
       if (item.selectedVariants) {
          for (const [groupName, selections] of Object.entries(item.selectedVariants)) {
             const selectionsArr = Array.isArray(selections) ? selections : [selections];
             
             for (const selection of selectionsArr) {
                const qty = selection.quantity || 0;
                
                if (qty > 0) {
                   const confirmPrice = resolveSelectionUnitPrice(selection, product, basePrice);
                   itemTotalExcludingBulkDocs += confirmPrice * qty;
                   totalVariantQty += qty;
                }
             }
          }
       }
       
       // Handle remaining quantity (if any) that has no specific variant assigned
       if (item.quantity > totalVariantQty) {
          itemTotalExcludingBulkDocs += basePrice * (item.quantity - totalVariantQty);
       }
       
       // Set unit price for DB record as average
       item.price = itemTotalExcludingBulkDocs / item.quantity;
    
    } else {
        // STANDARD LOGIC: Unit Price = Base or Replacement Variant Price
        let unitPrice = basePrice;
        let selectedPrice = 0;
        if (item.selectedVariants) {
          for (const [groupName, selections] of Object.entries(item.selectedVariants)) {
            const selectionsArr = Array.isArray(selections) ? selections : [selections];
            for (const selection of selectionsArr) {
              const confirmPrice = resolveSelectionUnitPrice(selection, product, basePrice);
              if (confirmPrice !== basePrice) {
                selectedPrice = confirmPrice;
              }
            }
          }
        }
        if (selectedPrice > 0) {
          unitPrice = selectedPrice;
        }
        item.price = item.price && item.price > 0 ? item.price : unitPrice;
        itemTotalExcludingBulkDocs = item.price * item.quantity;
    }

    const itemSubtotal = itemTotalExcludingBulkDocs;
    calculatedSubtotal += itemSubtotal;

    // Apply Combo/Bulk Pricing Logic (Matching Frontend)
    // Normalize comboPricing and bulkPricing into a single tiers array
    // Note: Backend Product interface might need to be checked for comboPricing existence
    // Assuming product object has specific fields, we merge them similarly to frontend
    const comboPricing = (product.toObject() as any).comboPricing || [];
    
    // Legacy Bulk Pricing Logic REMOVED per user request
    // We now strictly use comboPricing tiers

    if (comboPricing.length > 0) {
       // Collect selected variant values for this item
       const selectedVariantValues: string[] = [];
       if (item.selectedVariants) {
          for (const selections of Object.values(item.selectedVariants)) {
             const selectionsArr = Array.isArray(selections) ? selections : [selections];
             for (const selection of selectionsArr) {
                selectedVariantValues.push(selection.value);
             }
          }
       }

       // Filter comboPricing based on selected variants if variantValue is specified
       const applicableCombo = comboPricing.filter((tier: any) => {
          if (!tier.variantValue || tier.variantValue === "") {
             return true;
          }
          return selectedVariantValues.includes(tier.variantValue);
       });

       // 1. Sort tiers by minQuantity descending
       const sortedTiers = [...applicableCombo].sort((a: any, b: any) => b.minQuantity - a.minQuantity);
       // 2. Find the first applicable tier
       const applicableTier = sortedTiers.find((tier: any) => item.quantity >= tier.minQuantity);
       
       if (applicableTier) {
         if (applicableTier.discountType === "free_delivery") {
           hasFreeShipping = true;
         } else if (applicableTier.discountType === "free_delivery_inside") {
           hasFreeShippingInside = true;
         } else if (applicableTier.discountType === "free_delivery_outside") {
           hasFreeShippingOutside = true;
         } else {
           let discountAmount = 0;
           if (applicableTier.discountType === "per_product") {
             discountAmount = applicableTier.discount * item.quantity;
           } else {
             discountAmount = applicableTier.discount; // Total discount
           }
           // Ensure discount doesn't exceed total price
           discountAmount = Math.min(discountAmount, itemSubtotal);
           totalComboDiscount += discountAmount;
         }
       }
    }

    // Process Bundles for this product
    const bundles = (product.toObject() as any).bundles || [];
    if (bundles.length > 0) {
       const selectedVariantValues: string[] = [];
       if (item.selectedVariants) {
          for (const selections of Object.values(item.selectedVariants)) {
             const selectionsArr = Array.isArray(selections) ? selections : [selections];
             for (const selection of selectionsArr) {
                selectedVariantValues.push(selection.value);
             }
          }
       }

       for (const bundle of bundles) {
         const isBundleMatched = bundle.variants.every((vVal: string) => selectedVariantValues.includes(vVal));
         if (isBundleMatched) {
           if (bundle.discountType === "free_delivery") {
             hasFreeShipping = true;
           } else if (bundle.discountType === "free_delivery_inside") {
             hasFreeShippingInside = true;
           } else if (bundle.discountType === "free_delivery_outside") {
             hasFreeShippingOutside = true;
           } else {
             let bundleDiscount = 0;
             if (bundle.discountType === "percentage") {
               let combinedPrice = 0;
               for (const vVal of bundle.variants) {
                 let itemPrice = basePrice;
                 for (const group of product.variants || []) {
                   const foundItem = group.items.find((i: any) => i.value === vVal);
                   if (foundItem?.price && foundItem.price > 0) {
                     itemPrice = foundItem.price;
                   }
                 }
                 combinedPrice += itemPrice;
               }
               bundleDiscount = (combinedPrice * bundle.discount) / 100;
             } else {
               bundleDiscount = bundle.discount;
             }
             bundleDiscount = Math.min(bundleDiscount, itemSubtotal);
             totalComboDiscount += bundleDiscount;
           }
         }
       }
    }

    // Track delivery charges
    if (product.additionalInfo?.freeShipping) hasFreeShipping = true;
    maxDeliveryChargeInside = Math.max(maxDeliveryChargeInside, product.basicInfo.deliveryChargeInsideDhaka || 0);
    maxDeliveryChargeOutside = Math.max(maxDeliveryChargeOutside, product.basicInfo.deliveryChargeOutsideDhaka || 0);
  }

  // Calculate delivery
  let deliveryCharge = 0;
  const isDeliveryFree = hasFreeShipping || 
    (payload.courierCharge === 'insideDhaka' && hasFreeShippingInside) || 
    (payload.courierCharge === 'outsideDhaka' && hasFreeShippingOutside);

  if (!isDeliveryFree) {
    deliveryCharge = payload.courierCharge === 'insideDhaka' 
      ? (maxDeliveryChargeInside || 80) 
      : (maxDeliveryChargeOutside || 150);
  }

  // Apply discount (Coupon + Combo)
  const couponDiscount = payload.discount || 0;
  const totalDiscount = couponDiscount + totalComboDiscount;

  // Generate orderId
  const orderId = await generateOrderId(OrderModel);

  // Set all required fields on payload
  payload.orderId = orderId;
  payload.subTotal = calculatedSubtotal;
  payload.totalDiscount = totalDiscount;
  payload.deliveryCharge = deliveryCharge;
  payload.totalAmount = calculatedSubtotal + deliveryCharge - totalDiscount;
  payload.status = payload.status || 'pending';
  payload.statusHistory = [{
    status: 'pending',
    date: new Date(),
    comment: 'Order placed successfully'
  }];
  payload.comboInfo = totalComboDiscount > 0 
    ? `Total combo savings: ৳${totalComboDiscount}` 
    : undefined;

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
          { orderId: { $regex: search, $options: 'i' } }, // NEW: Search by orderId
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

const trackOrderByOrderIdData = async (req: Request, orderId: string) => {
  const OrderModel = getTenantModel(req, 'Order', OrderSchema);
  const result = await OrderModel.findOne({ orderId: orderId })
    .populate("items.product", "basicInfo.title price bulkPricing basicInfo.description basicInfo.brand basicInfo.category basicInfo.subcategory variants images");
  return result;
};

export const OrderService = {
  addOrderData,
  getAllOrdersData,
  getOrderByIdData,
  trackOrderByPhoneData,
  trackOrderByConsignmentIdData,
  trackOrderByOrderIdData,
  updateOrderDataById,
  deleteOrderDataById,
};

