import bcrypt from 'bcrypt'
import redis from "../middleware/redis.js";
import userModel from "../model/register.js";
import validUser from "../model/validUser.js";
import catchAsync from "./catchAsync.js";
import AppError from '../middleware/AppError.js'

const register = catchAsync(async (req,res ,next)=>{
    console.log(req.body);
    const userData = await validUser.validateAsync(req.body)
    if(userData.password !== userData.cPassword){
        return next(new AppError('Both Password are Not Match !')) 
    }
    const user = await userModel.create(userData)
    await redis.set(`${user.phone}`, JSON.stringify(user))
    console.log(user);
    res.status(201).json({
        status : true , data : user
    })
})


const login = catchAsync(async (req,res, next)=>{
    console.log(req.body);
    const userData = await validUser.validateAsync(req.body)
    const cacheData = await redis.get(`${userData.phone}`)
    if(cacheData){
        // const validPass = await bcrypt.compare(JSON.parse(cacheData).password , userData.password)
        const validPass = JSON.parse(cacheData).password==userData.password
        if(!validPass) return (next(new AppError('Incorrect Password ' , 400)))
        else return  res.status(201).json({ status : true ,message : 'login Successfully', data : JSON.parse(cacheData)})
    }

    // console.log(cacheData , 'data from Chache');
    const user = await userModel.findOne({phone: userData.phone})

    if(!user) return (next(new AppError('User Not Exist' , 404)))
    // const validPass = await bcrypt.compare(user.password , userData.password)
    const validPass = user.password==userData.password
    // console.log(user.password==userData.password , user.phone == userData.phone );

    if(!validPass) return (next(new AppError('Incorrect Password !' , 400)))
    redis.set(`${user.phone}`, JSON.stringify(user))

    res.status(201).json({ status : true , message : 'login Successfully Database' , data : user})
})


export default register 
export {login}