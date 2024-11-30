import dotenv from 'dotenv'
import path from 'path'
dotenv.config({path:path.join(process.cwd(),'.env')})

export default {
    NODE_ENV:process.env.NODE_ENV,
    port:process.env.port,
    db:process.env.db,
    jwt_access_secret : process.env.jwt_access_secret,
    jwt_access_expires_in : process.env.jwt_access_expires_in,
    jwt_refresh_secret : process.env.jwt_refresh_secret,
    jwt_refresh_expires_in : process.env.jwt_refresh_expires_in,
    bcrypt_salt_rounds : process.env.bcrypt_salt_rounds,
    reset_pass_ui_link : process.env.RESET_PASS_UI_LINK,
    baseURL : process.env.baseURL,
    bkash_username : process.env.bkash_username,
    bkash_password : process.env.bkash_password,
    bkash_api_key : process.env.bkash_api_key,
    bkash_secret_key : process.env.bkash_secret_key,    
    bkash_grant_token_url : process.env.bkash_grant_token_url,
    bkash_create_payment_url : process.env.bkash_create_payment_url,
    bkash_execute_payment_url : process.env.bkash_execute_payment_url,
    bkash_refund_transaction_url : process.env.bkash_refund_transaction_url,
    callbackURL : process.env.callbackURL,
    bkash_payment_callback_url : process.env.bkash_payment_callback_url,
    bkash_refund_callback_url : process.env.bkash_refund_callback_url,
}