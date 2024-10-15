import { ICart } from "./cart.interface"
import CartModel from "./cart.model"


const addToCartData = async (payload: ICart) => {
    const result = await CartModel.create(payload)
    return result 
}

const getCartData = async () => {
    const result = await CartModel.find()
    return result 
}

const getCartItemByIdData = async (id: string) => {
    return await CartModel.findById(id);
};

const updateCartItemDataById = async (id: string, updateData: Partial<ICart>) => {
    return await CartModel.findByIdAndUpdate(id, updateData, { new: true });
};

const removeCartItemDataById = async (id: string) => {
    return await CartModel.findByIdAndDelete(id);
};

export const CartService = {
    addToCartData,
    getCartData,
    getCartItemByIdData,
    updateCartItemDataById,
    removeCartItemDataById,
}
