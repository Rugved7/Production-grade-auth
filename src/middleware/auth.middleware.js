const User = require('../model/User.model')
const {verifyAccessToken} = require('../utils/tokenUtils')
const {ApiError, asyncHandler} = require('../utils/errorHandler')

const protect = asyncHandler(async (req,res, next) => {
    let token;

    if(req.headers.authorization?.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1]
    }

    if(!token){
        throw new ApiError(401, "Not authorized, no token provided")
    }

    try {
        const decoded = verifyAccessToken(token)
        const user = await User.findById(decoded.userId).select('-password')

        if(!user){
            throw new ApiError(401, "User not exists")
        }

        if(!user.isActive){
            throw new ApiError(403, "User account is Deactivated")
        }

        req.user = user
        next()
    } catch (error) {
        if(error.message === 'Access Token expired'){
            throw new ApiError(401, "Access token is expired, please refresh token")
        }
        if(error.message === 'Invalid Access token'){
            throw new ApiError(401, 'Invalid access token')
        }
        throw error
    }
})

/*
Optional authentication middleware
Attaches user if token is valid, but doesn't block request
*/

const optionalAuth = asyncHandler(async (req, res, next) => {
    let token

    if(req.headers.authorization?.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1]
    }

    if(token){
        try {
            const decoded = verifyAccessToken(token)
            const user = await User.findById(decoded.userId).select('-password')
            if(user && user.isActive){
                req.user = user
            }
        } catch (error) {
            // fail silently
        }
    }
    next()
})

module.exports = {
    protect,  
    optionalAuth
}