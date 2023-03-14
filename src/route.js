import {Router} from 'express';
import register , {forgetPassword, login, resetPassword}  from './controller/user.js';
import AppError from './middleware/AppError.js';
const router = Router()
export default router

router.get('/' , (req,res)=>{
    res.send('this our Chatting App server ')
})
router.post('/register' , register)
router.post('/login' , login)


router.post('/forgotPassword' , forgetPassword)
router.put('/resetPassword/:id' , resetPassword)

router.all('/*' , (req, res, next)=>{
    next(new AppError(`${req.url} Not Found !` , 404))
})