import axios from 'axios'
import { NextFunction, Request, Response } from 'express'

class middleware {
    bkash_auth = async (req:Request, res:Response, next:NextFunction) => {
        
        if((globalThis as any).userEmails){
            (globalThis as any).userEmails = ""
        }
        
        try {
            const { data } = await axios.post(process.env.bkash_grant_token_url as string, {
                app_key: process.env.bkash_api_key,
                app_secret: process.env.bkash_secret_key,
            }, {
                headers: {
                    "Content-Type": "application/json", 
                    "Accept": "application/json",
                    username: process.env.bkash_username,
                    password: process.env.bkash_password,
                }
            });
            (globalThis as any).id_token = data.id_token;
            next();
        } catch (error) {
            if (error instanceof Error) {
                return res.status(401).json({ error: error.message });
            }
            return res.status(401).json({ error: 'Unknown error occurred' });
        }
    }
}

export default new middleware()
