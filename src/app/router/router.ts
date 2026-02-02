import { Router } from "express";
import { AuthRoute } from "../../modules/Auth/auth.route";
import { ProductRoute } from "../../modules/Product/product.route";
import { OrderRoute } from "../../modules/Orders/orders.route";
import { UserRoutes } from "../../modules/User/user.route";
import { bkashRouter } from "../../modules/bkash/bkash.router";
import { CategoryRoute } from "../../modules/Categories/categories.route";
import { DashboardRoute } from "../../modules/Dashboard/dashboard.route";
import { bannerRoutes } from "../../modules/Banner/banner.route";
import { TrackingRoutes } from "../../modules/TrackingIntegrations/tracking.route";
import { SteadfastRoutes } from "../../modules/Steadfast/steadfast.route";
import { UserDashboardRoute } from "../../modules/UserDashboard/userDashboard.route";
import { SettingsRoutes } from "../../modules/Settings/settings.route";

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
        path: '/bkash',
        route: bkashRouter
    },
    {
        path: '/dashboard',
        route: DashboardRoute
    },
    {
        path: '/banner',
        route: bannerRoutes
    },
    {
        path: '/tracking',
        route: TrackingRoutes
    },
    {
        path: '/steadfast',
        route: SteadfastRoutes
    },
    {
        path: '/user-dashboard',
        route: UserDashboardRoute
    },
    {
        path: '/settings',
        route: SettingsRoutes
    }
]

moduleRoute.forEach((route)=>router.use(route.path,route.route))

export default router