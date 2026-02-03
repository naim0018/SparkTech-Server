import { Schema, model } from 'mongoose';
import { BillingInformation, OrderInterface, OrderItem, PaymentInfo } from './orders.interface';

const orderItemSchema = new Schema<OrderItem>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true }, // Reference to Product model
  image: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  itemKey: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  selectedVariants: { 
    type: Map, 
    of: [{
      value: { type: String }, // The selected value of the variant
      price: { type: Number }, // The price of the selected variant
      quantity: { type: Number } // Quantity of this specific variant
    }], 
    default: {} 
  }
}, { _id: false });

const paymentInfoSchema = new Schema<PaymentInfo>({
  paymentMethod: { type: String, enum: ['cash on delivery', 'bkash'], required: true, default: 'cash on delivery' },
  status: { type: String, enum: ['pending', 'processing', 'shipped', 'completed', 'cancelled'], required: true, default: 'pending' },
  transactionId: { type: String },
  paymentDate: { type: String },
  amount: { type: Number, required: true },
  bkashNumber: { type: String }
});

const billingInformationSchema = new Schema<BillingInformation>({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  country: { type: String, required: true },
  notes: { type: String }
});

const orderSchema = new Schema<OrderInterface>({
  items: { type: [orderItemSchema], required: true, validate: [arrayMinLength, 'Order must contain at least one item'] },
  totalAmount: { type: Number, required: true, min: 0 },
  status: { type: String, required: true },
  billingInformation: { type: billingInformationSchema, required: true },
  paymentInfo: { type: paymentInfoSchema },
  courierCharge: { type: String, enum: ['insideDhaka', 'outsideDhaka'], required: true },
  deliveryCharge: { type: Number, required: true },
  cuponCode: { type: String },
  consignment_id: { type: String }
},
{ timestamps: true }
);

function arrayMinLength(val: any[]) {
  return val.length > 0;
}




export { orderSchema as OrderSchema };
const OrderModel = model<OrderInterface>('Order', orderSchema);

export default OrderModel;
