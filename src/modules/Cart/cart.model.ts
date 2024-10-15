import { Schema, model } from 'mongoose';
import { ICart, ICartItem } from './cart.interface';

const cartItemSchema = new Schema<ICartItem>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 }
});

const cartSchema = new Schema<ICart>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [cartItemSchema],
  totalAmount: { type: Number, required: true, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

cartSchema.pre('save', async function(next) {
  this.updatedAt = new Date();
  
  // Calculate the total amount by fetching the latest product prices
  let total = 0;
  for (const item of this.items) {
    const product = await model('Product').findById(item.product);
    if (product) {
      const price = product.discountPrice && product.discountPrice < product.price
        ? product.discountPrice
        : product.price;
      total += item.quantity * price;
    }
  }
  this.totalAmount = total;

  next();
});

const CartModel = model<ICart>('Cart', cartSchema);

export default CartModel;
