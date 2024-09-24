import dotenv from 'dotenv'
import path from 'path'
dotenv.config({path:path.join(process.cwd(),'.env')})

export default {
    NODE_ENV:process.env.NODE_ENV,
    port:process.env.port,
    db:process.env.db,
    jwt_access_secret : process.env.jwt_access_secret
}