const jwt = require('jsonwebtoken');
const secret = "Jamia";
const {adminSchema, studentSchema, commentSchema, feedbackSchema} = require("./schema");
const ExpressError = require("./utilis/ExpressError");

module.exports.auth = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    req.flash("error", "Please Login!");
    return res.redirect('/api/admin/login')
  };

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (err) {
    res.redirect('/api/admin/login');
  }
};

module.exports.validatefeedBack = (req, res, next) => {
    let { error } = feedbackSchema.validate(req.body);
    console.log(error);
    if(error){
        let errorMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errorMsg);
    }else{
        next();
    }
}

module.exports.validateAdmin = (req, res, next) => {
    let { error } = adminSchema.validate(req.body);
    console.log(error);
    if(error){
        let errorMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errorMsg);
    }else{
        next();
    }
}

module.exports.validateStudent = (req, res, next) => {
    let { error } = studentSchema.validate(req.body);
    console.log(error);
    if(error){
        let errorMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errorMsg);
    }else{
        next();
    }
}

module.exports.validateComment = (req, res, next) => {
    let { error } = commentSchema.validate(req.body);
    console.log(error);
    if(error){
        let errorMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errorMsg);
    }else{
        next();
    }
}