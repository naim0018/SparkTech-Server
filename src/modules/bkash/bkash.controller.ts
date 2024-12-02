import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import paymentModel from "./bkash.model";
 
import config from "../../app/config";

const baseURL = config.baseURL;

class PaymentController {
  private async bkash_headers() {
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
      authorization: (globalThis as any).id_token,
      "x-app-key": config.bkash_api_key,
    };
  }

  public payment_create = async (req: Request, res: Response) => {
    const { amount, userEmail } = req.body as { amount: number; userEmail: string };
    try {
      const { data } = await axios.post(
        config.bkash_create_payment_url as string,
        {
          mode: "0011",
          payerReference: userEmail,
          callbackURL: `${config.callbackURL}`,
          amount,
          currency: "BDT",
          intent: "sale",
          merchantInvoiceNumber: "Inv" + uuidv4().substring(0, 5),
        },
        {
          headers: await this.bkash_headers(),
        }
      );
      return res.status(200).json({ bkashURL: data.bkashURL });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(401).json({ error: error.message });
      }
      return res.status(401).json({ error: 'Unknown error occurred' });
    }
  };

  public call_back = async (req: Request, res: Response) => {
    const { paymentID, status } = req.query as { paymentID: string; status: string };

    if (status === "cancel" || status === "failure") {
      return res.redirect(`${baseURL}/error?message=${encodeURIComponent(status)}`);
    }

    if (status === "success") {
      try {
        const { data } = await axios.post(
          config.bkash_execute_payment_url as string,
          { paymentID },
          {
            headers: await this.bkash_headers(),
          }
        );
        if (data && data.statusCode === "0000") {
          await paymentModel.create({
            userId: Math.random() * 10 + 1,
            paymentID,
            trxID: data.trxID,
            date: data.paymentExecuteTime,
            amount: parseInt(data.amount),
          });
   
          return res.redirect(
            `${baseURL}/checkout?message=${encodeURIComponent(data.statusMessage)}&trxID=${encodeURIComponent(data.trxID)}&amount=${encodeURIComponent(data.amount)}`
          );
        } else {
          return res.redirect(
            `${baseURL}/checkout?message=${encodeURIComponent(data.statusMessage)}`
          );
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return res.redirect(
          `${baseURL}/error?message=${encodeURIComponent(errorMessage)}`
        );
      }
    }
  };

  public refund = async (req: Request, res: Response) => {
    const { trxID } = req.params;

    try {
      const payment = await paymentModel.findOne({ trxID });

      const { data } = await axios.post(
        config.bkash_refund_transaction_url as string,
        {
          paymentID: payment?.paymentID,
          amount: payment?.amount,
          trxID,
          sku: "payment",
          reason: "cashback",
        },
        {
          headers: await this.bkash_headers(),
        }
      );
      if (data && data.statusCode === "0000") {
        return res.status(200).json({ message: "refund success" });
      } else {
        return res.status(404).json({ error: "refund failed" });
      }
    } catch (error) {
      return res.status(404).json({ error: "refund failed" });
    }
  };
}

export default new PaymentController();
