import {Router} from 'express';
import register , {login}  from './controller/user.js';
const router = Router()
export default router

router.get('/' , (req,res)=>{
    res.send('this our Chatting App server ')
})
router.post('/register' , register)
router.post('/login' , login)

