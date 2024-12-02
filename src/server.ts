import mongoose from 'mongoose'
import app from './app'
import config from './app/config'
import {Server} from 'http'
let server:Server
async function main (){
try {
   await mongoose.connect(config.db as string)
    server = app.listen(config.port,()=>{
        console.log(`App running on port -${config.port}`)
     })
    
} catch (error) {
    console.log("Failed to connect to database",error)
}
}

main()

process.on('unhandledRejection',(err)=>{
    // console.log("Unhandled Rejection, shutting down the server ",err)
    if(server){
        server.close(()=>{
            process.exit(1)
        })
    }
    process.exit(1)
})

process.on('uncaughtRejection',()=>{
    // console.log("Uncaught Rejection, shutting down the server")
    process.exit(1)
    
})