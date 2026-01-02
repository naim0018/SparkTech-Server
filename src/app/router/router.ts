import { Router } from "express";
import { AuthRoute } from "../../modules/Auth/auth.route";
import { ProductRoute } from "../../modules/Product/product.route";
import { OrderRoute } from "../../modules/Orders/orders.route";
import { UserRoutes } from "../../modules/User/user.route";
import { SteadFastRoute } from "../../modules/SteadFast/steadFast.route";
import { bkashRouter } from "../../modules/bkash/bkash.router";
import { CategoryRoute } from "../../modules/Categories/categories.route";
import { DashboardRoute } from "../../modules/Dashboard/dashboard.route";
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
    },
    {
        path: '/categories',
        route: CategoryRoute
    },
    {
        path: '/steadfast',
        route: SteadFastRoute
    },
    {
        path: '/bkash',
        route: bkashRouter
    },
    {
        path: '/dashboard',
        route: DashboardRoute
    }
]

moduleRoute.forEach((route)=>router.use(route.path,route.route))

export default router