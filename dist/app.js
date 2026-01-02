"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_status_codes_1 = require("http-status-codes");
const router_1 = __importDefault(require("./app/router/router"));
const globalErrorHandler_1 = __importDefault(require("./app/middleware/globalErrorHandler"));
const notFound_1 = __importDefault(require("./app/middleware/notFound"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
// app.use(
//   cors({
//     origin: [
//       "https://bestbuy4ubd.com/",
//       "http://localhost:5174",
//       "http://localhost:5173",
//       "https://spark-tech-seven.vercel.app",
//       "https://www.bestbuy4ubd.com",
//       "https://bestbuy4ubd.com/",
//       "https://connect.facebook.net/en_US/sdk/xfbml.customerchat.js",
//     ],
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );
const allowedOrigins = [
    "https://bestbuy4ubd.com",
    "https://www.bestbuy4ubd.com",
    "https://spark-tech-seven.vercel.app",
    "http://localhost:5173",
    "http://localhost:5174",
    "https://connect.facebook.net/en_US/sdk/xfbml.customerchat.js",
    "https://topdealsbd.com/",
    "https://topdealsbd.com",
    "https://www.topdealsbd.com",
];
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        if (!origin)
            return callback(null, true); // allow server-to-server & tools
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use("/api/v1", router_1.default);
app.get("/", (req, res) => {
    res.status(http_status_codes_1.StatusCodes.OK).json({
        success: true,
        message: "Server connected",
        data: "Server is Running",
    });
});
app.use(globalErrorHandler_1.default);
// Not Found
app.use(notFound_1.default);
exports.default = app;
