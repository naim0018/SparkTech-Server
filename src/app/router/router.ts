import { Router } from "express";
import { AuthRoute } from "../../modules/Auth/auth.route";
import { ProductRoute } from "../../modules/Product/product.route";
import { OrderRoute } from "../../modules/Orders/orders.route";
import { UserRoutes } from "../../modules/User/user.route";

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
    {
        path: '/user',
        route: UserRoutes
    },
    {
        path: '/auth',
        route: AuthRoute
    },
    {
        path: '/order',
        route: OrderRoute
    }
]

moduleRoute.forEach((route)=>router.use(route.path,route.route))

export default router