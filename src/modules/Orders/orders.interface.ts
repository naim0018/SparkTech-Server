export interface OrderInterface {
  items: OrderItem[];
  totalAmount: number;
  status: string;
  billingInformation: BillingInformation;
}

export interface OrderItem {
  product: string | number; // Assuming product ID
  quantity: number;
  price: number;
}

export interface BillingInformation {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  paymentMethod: string;
  cardNumber?: string;
  expMonth?: string;
  expYear?: string;
  cvv?: string;
  notes?: string;
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
