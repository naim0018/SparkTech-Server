import { Router } from "express";
import { AuthRoute } from "../../modules/Auth/auth.route";
import { ProductRoute } from "../../modules/Product/product.route";

const router = Router()

const moduleRoute = [
    {
        path:'/',
        route: AuthRoute
    },
    {
        path:'/product',
        route: ProductRoute
    },
]

moduleRoute.forEach((route)=>router.use(route.path,route.route))

export default router