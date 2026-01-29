import { Request } from "express";
import { ICart } from "./cart.interface"
import { CartSchema } from "./cart.model"
import { getTenantModel } from "../../app/utils/getTenantModel";


const addToCartData = async (req: Request, payload: ICart) => {
    const CartModel = getTenantModel(req, 'Cart', CartSchema);
    const result = await CartModel.create(payload)
    return result 
}

const getCartData = async (req: Request) => {
    const CartModel = getTenantModel(req, 'Cart', CartSchema);
    const result = await CartModel.find()
    return result 
}

const getCartItemByIdData = async (req: Request, id: string) => {
    const CartModel = getTenantModel(req, 'Cart', CartSchema);
    return await CartModel.findById(id);
};

const updateCartItemDataById = async (req: Request, id: string, updateData: Partial<ICart>) => {
    const CartModel = getTenantModel(req, 'Cart', CartSchema);
    return await CartModel.findByIdAndUpdate(id, updateData, { new: true });
};

const removeCartItemDataById = async (req: Request, id: string) => {
    const CartModel = getTenantModel(req, 'Cart', CartSchema);
    return await CartModel.findByIdAndDelete(id);
};

export const CartService = {
    addToCartData,
    getCartData,
    getCartItemByIdData,
    updateCartItemDataById,
    removeCartItemDataById,
}

