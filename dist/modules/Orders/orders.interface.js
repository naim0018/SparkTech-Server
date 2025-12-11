"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
