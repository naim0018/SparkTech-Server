import express, { Request, Response } from 'express'
import cors from 'cors'

import { StatusCodes } from 'http-status-codes'
import router from './app/router/router'
import globalErrorHandler from './app/middleware/globalErrorHandler'
import notFound from './app/middleware/notFound'
const app = express()

app.use(express.json())
app.use(cors({
  origin: ['http://localhost:5173', 'https://spark-tech-seven.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin === 'http://localhost:5173' || origin === 'https://spark-tech-seven.vercel.app') {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.use('/api/v1', router)

app.get('/', (req: Request, res: Response) => {
    res.status(StatusCodes.OK).json({
        success: true,
        message: "Server connected",
        data: "Server is Running"
    })
})

app.use(globalErrorHandler);

// Not Found
app.use(notFound);

export default app