import { validationResult, body } from "express-validator";

export const validateSchema = [
  body("fname")
    .isLength({ min: 1 })
    .withMessage("First name is required at least 1 chars."),
  body("lname")
    .isLength({ min: 1 })
    .withMessage("Last name is required at least 1 chars."),
  body("email")
    .isLength({ min: 1 })
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Please provide a valid email address"),
  body("username")
    .isLength({ min: 3 })
    .withMessage("Username must contain at least 3 chars."),
  body("password")
    .isLength({ min: 6, max: 25 })
    .withMessage("Password must be between 6-25 characters long."),
  body("confirm")
    .isLength({ min: 1 })
    .withMessage("Confirm password is required.")
    .custom((value, { req, loc, path }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords don't match");
      } else {
        return value;
      }
    })
    .withMessage("Passwords must match."),
];

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors);
  }

  next();
};
