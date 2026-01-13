"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const orderItemSchema = new mongoose_1.Schema({
    product: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Product', required: true }, // Reference to Product model
    image: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    itemKey: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    selectedVariants: {
        type: Map,
        of: new mongoose_1.Schema({
            value: { type: String }, // The selected value of the variant
            price: { type: Number } // The price of the selected variant
        }),
        default: {}
    }
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
    items: { type: [orderItemSchema], required: true, validate: [arrayMinLength, 'Order must contain at least one item'] },
    totalAmount: { type: Number, required: true, min: 0 },
    status: { type: String, required: true },
    billingInformation: { type: billingInformationSchema, required: true },
    paymentInfo: { type: paymentInfoSchema },
    courierCharge: { type: String, enum: ['insideDhaka', 'outsideDhaka'], required: true },
    cuponCode: { type: String },
    consignment_id: { type: String }
}, { timestamps: true });
function arrayMinLength(val) {
    return val.length > 0;
}
const OrderModel = (0, mongoose_1.model)('Order', orderSchema);
exports.default = OrderModel;
