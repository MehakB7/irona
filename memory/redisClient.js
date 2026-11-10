import { createClient } from "redis";

const client =  createClient({ url: process.env.REDIS_URL });

let isConnected = false;

client.on("error", (err)=>{
    console.error("Redis client error", err.message);
     isConnected = false;
})

client.on("ready", (data)=>{
    isConnected = true
})

try{
   await client.connect();
}catch(e){
    isConnected = false;
    console.log("Redis failed to connect at startup", e.message)
}


export default client;

export  const isRedisConnected = ()=>{
    return isConnected;
}