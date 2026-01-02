"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_route_1 = require("../../modules/Auth/auth.route");
const product_route_1 = require("../../modules/Product/product.route");
const orders_route_1 = require("../../modules/Orders/orders.route");
const user_route_1 = require("../../modules/User/user.route");
const steadFast_route_1 = require("../../modules/SteadFast/steadFast.route");
const bkash_router_1 = require("../../modules/bkash/bkash.router");
const categories_route_1 = require("../../modules/Categories/categories.route");
const dashboard_route_1 = require("../../modules/Dashboard/dashboard.route");
const router = (0, express_1.Router)();
const moduleRoute = [
    {
        path: '/',
        route: auth_route_1.AuthRoute
    },
    {
        path: '/product',
        route: product_route_1.ProductRoute
    },
    {
        path: '/user',
        route: user_route_1.UserRoutes
    },
    {
        path: '/auth',
        route: auth_route_1.AuthRoute
    },
    {
        path: '/order',
        route: orders_route_1.OrderRoute
    },
    {
        path: '/categories',
        route: categories_route_1.CategoryRoute
    },
    {
        path: '/steadfast',
        route: steadFast_route_1.SteadFastRoute
    },
    {
        path: '/bkash',
        route: bkash_router_1.bkashRouter
    },
    {
        path: '/dashboard',
        route: dashboard_route_1.DashboardRoute
    }
];
moduleRoute.forEach((route) => router.use(route.path, route.route));
exports.default = router;
