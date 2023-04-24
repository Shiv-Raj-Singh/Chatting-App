
import bcrypt from 'bcrypt'
import redis from "../middleware/redis.js";
import userModel from "../model/register.js";
import validUser from "../model/validUser.js";
import catchAsync from "./catchAsync.js";
import AppError from '../middleware/AppError.js'

// Nodemailer Provide the system to send the email from Nodejs
import nodemailer  from'nodemailer'

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

    // fetch the data from cache memory 
    const cacheData = await redis.get(`${userData.phone}`)
    if(cacheData){
        const validPass = await bcrypt.compare( userData.password,JSON.parse(cacheData).password )

        // const validPass = JSON.parse(cacheData).password==userData.password
        if(!validPass) return (next(new AppError('Incorrect Password ' , 400)))
        else return  res.status(201).json({ status : true ,message : 'login Successfully', data : JSON.parse(cacheData)})
    }

    const user = await userModel.findOne({phone: userData.phone})

    if(!user) return (next(new AppError('User Not Exist' , 404)))
    const validPass = await bcrypt.compare(userData.password , user.password  )

    if(!validPass) return (next(new AppError('Incorrect Password !' , 400)))
    redis.set(`${user.phone}`, JSON.stringify(user))

    res.status(201).json({ status : true , message : 'login Successfully Database' , data : user})
})

//    Email send sing NodeMailer**********************************************************************************


const forgetPassword = catchAsync( async (req,res,next)=>{

    console.log(process.env.email,process.env.ePassword);
    const userData = await validUser.validateAsync(req.body)
    const user = await userModel.findOne({email : userData.email})
    if(!user) return (next(new AppError('User Not Exist' , 404)))

    // res.status(200).json({
    //     status : true , data : user , message : 'Password Updated Successfully' 
    // })

// Generate test SMTP service account from ethereal.email
// Only needed if you don't have a real mail account for testing

const testAccount = await nodemailer.createTestAccount();
// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
service : 'gmail' ,
auth: {
    user: `${process.env.email}`,
    pass: `${process.env.pass}`
},
});
  

var mailOptions = {
    from: `${process.env.email}`,
    to: `${userData.email}`,
    // to: `mt932747@gmail.com`,
    // to: `shiv9627347143@gmail.com`,
    // to: `albertsaurabhkumar@gmail.com`,
    subject: 'Reset Your Password',
    html : '<a href="`https://chat-app-frontend-sigma.vercel.app/reset-password/${user._id}`">Click Here For Reset Your Password ! </a>'

  };
  
  await transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error.message);
    } else {
      console.log('Email sent: ' + info);
     
    res.status(200).json({ status : true , message : 'Email Sent Successfully See Your Email Account !' , data : info})
    }
  });
    // console.log(userData);

})



const resetPassword = catchAsync(async (req,res,next)=>{
    const id = req.params.id
    const userData = await validUser.validateAsync(req.body)
    // console.log(id , userData);
    if(userData.password !== userData.cPassword){
        return next(new AppError('Both Password are Not Match !')) 
    }
    const user = await userModel.findById({_id:id})
    if(!user) return (next(new AppError('User Not Exist' , 404)))

    user.password = userData.password
    user.cPassword = userData.cPassword
    await user.save()
    res.status(200).json({
        status : true , data : user , message : 'Password Updated Successfully' 
    })
})

export default register 
export {login , forgetPassword , resetPassword}