import express, { Request, Response } from "express";
import cors from "cors";

import { StatusCodes } from "http-status-codes";
import router from "./app/router/router";
import globalErrorHandler from "./app/middleware/globalErrorHandler";
import notFound from "./app/middleware/notFound";
import { tenantResolver } from "./app/middleware/tenantResolver";
const app = express();

app.use(express.json());
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

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow server-to-server & tools
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Tenant resolver - must come after CORS and before routes
app.use(tenantResolver);

app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Server connected",
    data: "Server is Running",
  });
});

app.use(globalErrorHandler);

// Not Found
app.use(notFound);

export default app;
