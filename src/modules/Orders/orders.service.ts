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
             const variantGroup = product.variants?.find((v) => v.group === groupName);
             const selectionsArr = Array.isArray(selections) ? selections : [selections];
             
             for (const selection of selectionsArr) {
                const variantItem = variantGroup?.items.find((i) => i.value === selection.value);
                const qty = selection.quantity || 0; // Should exist if we are in this mode
                
                if (qty > 0) {
                   // If variant has specific price, use it. If 0/undefined, assumes it uses Base Price.
                   // NOTE: If variant.price is 0, it means it costs the Base Price (e.g. "Quantity" variant).
                   // If variant.price > 0, it replaces Base Price (e.g. "Red" @ 350).
                   const confirmPrice = (variantItem?.price && variantItem.price > 0) 
                                        ? variantItem.price 
                                        : basePrice;
                                        
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
       // STANDARD LOGIC: Unit Price = Base + Add-ons
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
               // In standard mode, variant prices are typically additive or replacement?
               // Based on previous code, they were additive (+=). 
               // Assuming standard mode implies "Add-ons".
               unitPrice += variantItem.price;
             }
           }
         }
       }
       item.price = unitPrice;
       itemTotalExcludingBulkDocs = unitPrice * item.quantity;
    }

    const itemSubtotal = itemTotalExcludingBulkDocs;
    calculatedSubtotal += itemSubtotal;

    // Apply Combo/Bulk Pricing Logic (Matching Frontend)
    // Normalize comboPricing and bulkPricing into a single tiers array
    // Note: Backend Product interface might need to be checked for comboPricing existence
    // Assuming product object has specific fields, we merge them similarly to frontend
    const comboPricing = (product.toObject() as any).comboPricing || [];
    const bulkPricing = (product.toObject() as any).bulkPricing || [];
    
    // Merge bulkPricing into comboPricing format if needed
    if (bulkPricing.length > 0) {
       bulkPricing.forEach((bp: any) => {
        // If bp.price is a total for the bundle (e.g. 3 for 900), 
        // convert it to a per-product discount
        const unitPriceInTier = bp.price >= basePrice * 1.5 ? bp.price / bp.minQuantity : bp.price;
        const perProductDiscount = basePrice - unitPriceInTier;
        
        if (perProductDiscount > 0) {
          comboPricing.push({
            minQuantity: bp.minQuantity,
            discount: perProductDiscount,
            discountType: 'per_product'
          });
        }
      });
    }

    if (comboPricing.length > 0) {
       // 1. Sort tiers by minQuantity descending
       const sortedTiers = [...comboPricing].sort((a: any, b: any) => b.minQuantity - a.minQuantity);
       // 2. Find the first applicable tier
       const applicableTier = sortedTiers.find((tier: any) => item.quantity >= tier.minQuantity);
       
       if (applicableTier) {
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

  // Apply discount (Coupon + Combo)
  // payload.discount comes from frontend (Coupon discount), we add Combo discount to it
  const couponDiscount = payload.discount || 0;
  // We update payload.discount to reflect total savings (Coupon + Combo) so it shows on Order Details
  payload.discount = couponDiscount + totalComboDiscount;

  // Final validation of totalAmount
  // Total = Subtotal + Delivery - All Discounts
  payload.totalAmount = calculatedSubtotal + deliveryCharge - payload.discount;

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

