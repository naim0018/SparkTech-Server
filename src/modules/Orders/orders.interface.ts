export interface OrderInterface {
  items: OrderItem[];
  totalAmount: number;
  status: string;
  billingInformation: BillingInformation;
  paymentInfo?: PaymentInfo;
}

export interface OrderItem {
  product: string | number; // Product ID
  quantity: number;
  price: number;
  variant?: {
    name: string;
    value: string;
  };
}

export interface BillingInformation {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  streetAddress: string;
  city: string;

  zipCode: string;
  country: string;
  paymentMethod: string;
  cardNumber?: string;
  expMonth?: string;
  expYear?: string;
  cvv?: string;
  notes?: string;
}

export interface PaymentInfo {
  paymentMethod: 'cash on delivery' | 'bkash';
  status: 'pending' | 'completed' | 'failed';
  transactionId?: string; // Required for bKash
  paymentDate?: Date;
  amount: number;
  bkashNumber?: string; // Required for bKash
}

// Differences:
// 1. Renamed IOrder to OrderInterface
// 2. Renamed IOrderItem to OrderItem
// 3. Renamed IBillingInformation to BillingInformation
// 4. Added product field to OrderItem
// 5. Changed status type from union of specific strings to string
// 6. Changed paymentMethod type from union of 'card' | 'paypal' to string
// 7. Removed createdAt and updatedAt fields from OrderInterface
// 8. Removed import of Types from mongoose
// 9. Added PaymentInfo interface with bKash and cash on delivery options
