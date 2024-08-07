import Joi from "joi";

export const userValidator = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required().lowercase().trim(),
  profile_picture: Joi.string(),
  about_me: Joi.string().required(),
  password: Joi.string().min(8).required(),
  education: Joi.array().items(
    Joi.object({
      degree: Joi.string().required(),
      end_date: Joi.date().required(),
    })
  ),
  resume: Joi.string(),
  gender: Joi.string().valid("Male", "Female", "Prefer not to say").required(),
  city: Joi.string().required(),
  skills: Joi.string(),
  role: Joi.string().required(),
  social_media: Joi.array().items(
    Joi.object({
      name: Joi.string(),
      url: Joi.string(),
    })
  ),
  date_of_birth: Joi.date().required(),
  cell_phone: Joi.number().required(),
  expectedSalary: Joi.number().required(),
  interview: Joi.date().required(),
  notice_period: Joi.number().integer(),
  experience: Joi.array().items(
    Joi.object({
      duration: Joi.number(),
      designation: Joi.string(),
      company: Joi.string(),
      salary: Joi.number().integer(),
      company_linkedin: Joi.string(),
    })
  ),
});

export const adminValidator = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required().min(8),
  role: Joi.string(),
});

export const loginValidator = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string(),
});
