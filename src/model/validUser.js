import Joi from "joi";

const validUser = Joi.object({
  name: Joi.string().required()
    .trim()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z(, \)]*$/),
  phone: Joi.string().required()
    .trim()
    .min(10)
    .max(10)
    .regex(/^[6-9]{1}[0-9]{9}$/),
  email: Joi.string().required().trim().email(),
  gender: Joi.string().required().trim(),
  password: Joi.string().required()
    .trim()
    .min(8)
    .max(15)
    .regex(/^[a-zA-Z0-9?(@$#&){1}]*$/),
  cPassword: Joi.string().required()
    .trim()
    .min(8)
    .max(15)
    .regex(/^[a-zA-Z0-9?(@$#&){1}]*$/),
  room: Joi.string()
});

export default validUser;
