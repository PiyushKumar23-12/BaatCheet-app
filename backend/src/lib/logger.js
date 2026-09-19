import env from "../config/env.js";

const logger={
    info:(...args)=>{
        console.log("[INFO]",...args);
    },
    warn:(...args)=>{
        console.log("[WARN]",...args);
    },
    error:(...args)=>{
        console.log("[ERROR]",...args);
    },
    debug:(...args)=>{
        if (env.NODE_ENV !== "production") {
            console.log("[DEBUG]", ...args);
        }
    }   
}

export default logger;