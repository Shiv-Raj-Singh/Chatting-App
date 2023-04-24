import Joi from 'joi';

const validUser = Joi.object({
    name : Joi.string().trim().min(3).max(30).regex(/^[a-zA-Z(, \)]*$/) ,
    phone: Joi.string().trim().min(10).max(10).regex(/^[6-9]{1}[0-9]{9}$/),
    email: Joi.string().trim().email(),
    password: Joi.string().trim().min(8).max(15).regex(/^[a-zA-Z0-9?(@$#&){1}]*$/),
    cPassword: Joi.string().trim().min(8).max(15).regex(/^[a-zA-Z0-9?(@$#&){1}]*$/),
    room : Joi.string()
})


export default validUser
