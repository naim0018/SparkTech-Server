"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_route_1 = require("../../modules/Auth/auth.route");
const product_route_1 = require("../../modules/Product/product.route");
const orders_route_1 = require("../../modules/Orders/orders.route");
const user_route_1 = require("../../modules/User/user.route");
const bkash_router_1 = require("../../modules/bkash/bkash.router");
const categories_route_1 = require("../../modules/Categories/categories.route");
const dashboard_route_1 = require("../../modules/Dashboard/dashboard.route");
const banner_route_1 = require("../../modules/Banner/banner.route");
const tracking_route_1 = require("../../modules/TrackingIntegrations/tracking.route");
const steadfast_route_1 = require("../../modules/Steadfast/steadfast.route");
const userDashboard_route_1 = require("../../modules/UserDashboard/userDashboard.route");
const settings_route_1 = require("../../modules/Settings/settings.route");
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
        path: '/bkash',
        route: bkash_router_1.bkashRouter
    },
    {
        path: '/dashboard',
        route: dashboard_route_1.DashboardRoute
    },
    {
        path: '/banner',
        route: banner_route_1.bannerRoutes
    },
    {
        path: '/tracking',
        route: tracking_route_1.TrackingRoutes
    },
    {
        path: '/steadfast',
        route: steadfast_route_1.SteadfastRoutes
    },
    {
        path: '/user-dashboard',
        route: userDashboard_route_1.UserDashboardRoute
    },
    {
        path: '/settings',
        route: settings_route_1.SettingsRoutes
    }
];
moduleRoute.forEach((route) => router.use(route.path, route.route));
exports.default = router;
