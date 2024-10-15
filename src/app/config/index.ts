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
}