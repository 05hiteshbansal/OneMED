const jwt = require("jsonwebtoken")
const User = require("../models/User")
exports.isLoggedIn = async(req,res,next)=>{
     const token = req.header("Autherization");
    console.log(token)
    if(!token){
        return res.status(401).json({
            success:false,
            message:"Please login to access resource"
        })
}
    const userId = jwt.verify(token,process.env.SECRET)
    const user = await User.findById(userId.id)
req.user=user
next()
}