import express from 'express'
import PaymentController from './bkash.controller'
import middleware from '../../app/middleware/bkashAuth'

const router = express.Router()
router.post('/payment/create',middleware.bkash_auth, PaymentController.payment_create)

router.get('/payment/callback',middleware.bkash_auth, PaymentController.call_back)

router.get('/payment/refund/:trxID',middleware.bkash_auth, PaymentController.refund)



export const bkashRouter=router
