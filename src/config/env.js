require('dotenv').config()

const requiredEnvVariables = [
    'MONGODB_URI', 
    'JWT_ACCESS_TOKEN', 
    'JWT_REFRESH_TOKEN',    
]

requiredEnvVariables.forof((envVar) => {
    if(!process.env[envVar]){
        throw new Error(`Missing required env variables, ${envVar}`)
    }
})

module.exports = {
    NODE_ENV: process.env.NODE_ENV || 'development', 
    PORT: process.env.PORT || 5000, 

    MONGODB_URI: process.env.MONGODB_URI, 

    JWT : {
        ACCESS_TOKEN: process.env.ACCESS_TOKEN, 
        REFRESH_TOKEN: process.env.REFRESH_TOKEN, 
        ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY || '15m', 
        REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY || '7d'
    }, 

    COOKIE: {
        SECURE: process.env.COOKIE_SECURE === 'true', 
        SAME_SITE: process.env.COOKIE_SAME_SITE || 'strict', 
        HTTP_ONLY: true, 
        MAX_AGE: 7 * 24 * 60 * 60* 1000
    }
}