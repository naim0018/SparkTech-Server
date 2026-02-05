"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderSchema = void 0;
const mongoose_1 = require("mongoose");
const orderItemSchema = new mongoose_1.Schema({
    product: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Product', required: true },
    image: { type: String, required: true }, // Main product image or specific variant image
    quantity: { type: Number, required: true, min: 1 },
    itemKey: { type: String, required: true }, // Unique key for frontend mapped lists
    // Pricing & Financials per Item
    price: { type: Number, required: true, min: 0 }, // The Unit Price at moment of purchase
    regularPrice: { type: Number }, // The original price before any discount (for display)
    discountAmount: { type: Number, default: 0 }, // Total discount applied to this line item
    selectedVariants: {
        type: Map,
        of: [{
                value: { type: String },
                price: { type: Number }, // Variant specific price
                quantity: { type: Number },
                image: { type: String } // Variant specific image
            }],
        default: {}
    }
}, { _id: false });
const statusHistorySchema = new mongoose_1.Schema({
    status: { type: String, required: true },
    date: { type: Date, default: Date.now },
    updatedBy: { type: String }, // User ID or 'System'
    comment: { type: String }
}, { _id: false });
const paymentInfoSchema = new mongoose_1.Schema({
    paymentMethod: { type: String, enum: ['cash on delivery', 'bkash'], required: true, default: 'cash on delivery' },
    status: { type: String, enum: ['pending', 'processing', 'shipped', 'completed', 'cancelled'], required: true, default: 'pending' },
    transactionId: { type: String },
    paymentDate: { type: String },
    amount: { type: Number, required: true },
    bkashNumber: { type: String }
});
const billingInformationSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    country: { type: String, required: true },
    notes: { type: String }
});
const orderSchema = new mongoose_1.Schema({
    orderId: { type: String, required: true, unique: true }, // Readable ID: ORD-2024-001
    items: { type: [orderItemSchema], required: true, validate: [arrayMinLength, 'Order must contain at least one item'] },
    // Financials
    subTotal: { type: Number, required: true, min: 0 }, // Total before discounts
    totalDiscount: { type: Number, default: 0 }, // Combo + Coupon savings
    deliveryCharge: { type: Number, required: true },
    totalAmount: { type: Number, required: true, min: 0 }, // Final Payable (Sub - Disc + Del)
    // Meta
    status: { type: String, required: true, default: 'pending' },
    statusHistory: { type: [statusHistorySchema], default: [] },
    // Info
    comboInfo: { type: String }, // Description of combo applied
    billingInformation: { type: billingInformationSchema, required: true },
    paymentInfo: { type: paymentInfoSchema },
    courierCharge: { type: String, enum: ['insideDhaka', 'outsideDhaka'], required: true },
    cuponCode: { type: String },
    consignment_id: { type: String }
}, { timestamps: true });
exports.OrderSchema = orderSchema;
function arrayMinLength(val) {
    return val.length > 0;
}
const OrderModel = (0, mongoose_1.model)('Order', orderSchema);
exports.default = OrderModel;
