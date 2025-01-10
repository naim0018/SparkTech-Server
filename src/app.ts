import express, { Request, Response } from 'express'
import cors from 'cors'

import { StatusCodes } from 'http-status-codes'
import router from './app/router/router'
import globalErrorHandler from './app/middleware/globalErrorHandler'
import notFound from './app/middleware/notFound'
const app = express()

app.use(express.json())
app.use(cors({
  origin: ['http://localhost:5174', 'http://localhost:5173/', 'https://spark-tech-seven.vercel.app','https://dropitbd.com','https://bestbuy4ubd.com','https://connect.facebook.net/en_US/sdk/xfbml.customerchat.js'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  

}));



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