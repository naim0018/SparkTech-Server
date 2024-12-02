import { Schema, model } from 'mongoose';
import { BillingInformation, OrderInterface, OrderItem, PaymentInfo } from './orders.interface';

const orderItemSchema = new Schema<OrderItem>({
  product: { type: Schema.Types.Mixed, required: true }, // Can be string or number
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 }
});

const paymentInfoSchema = new Schema<PaymentInfo>({
  paymentMethod: { type: String, enum: ['cash on delivery', 'bkash'], required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed'], required: true },
  transactionId: { type: String },
  paymentDate: { type: Date },
  amount: { type: Number, required: true },
  bkashNumber: { type: String }
});

const billingInformationSchema = new Schema<BillingInformation>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  streetAddress: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, required: true },
  paymentMethod: { type: String, required: true },
  cardNumber: { type: String },
  expMonth: { type: String },
  expYear: { type: String },
  cvv: { type: String },
  notes: { type: String }
});

const orderSchema = new Schema<OrderInterface>({
  items: { type: [orderItemSchema], required: true, validate: [arrayMinLength, 'Order must contain at least one item'] },
  totalAmount: { type: Number, required: true, min: 0 },
  status: { type: String, required: true },
  billingInformation: { type: billingInformationSchema, required: true },
  paymentInfo: { type: paymentInfoSchema }
},
{ timestamps: true }
);

function arrayMinLength(val: any[]) {
  return val.length > 0;
}

const OrderModel = model<OrderInterface>('Order', orderSchema);

export default OrderModel;
