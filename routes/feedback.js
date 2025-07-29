const express = require("express");
const router = express.Router({mergeParams: true});
const Feedback = require("../models/Feedback");
const Student = require("../models/Student");
const bcrypt = require("bcrypt");
const wrapAsync = require("../utilis/WrapAsync");

//feedback form
router.get("/", (req, res)=>{
    res.render("feedback/feedform.ejs");
    res.clearCookie('token');
});

//feedback saving in db
router.post('/', wrapAsync(async (req, res) => {
   const {mealType, rating, comment, studentId, password} = req.body; 

    const student = await Student.findOne({ studentId }); 
    if(!student) return req.flash("error", "Worng Credentials!"), res.redirect("/api/feedback");
    const validStudent = await bcrypt.compare(password, student.password);

    if (validStudent) {
        let newFeedback = new Feedback({
            mealType: mealType,
            rating: rating,
            comment: comment,
            owner: student._id,
        })
            
        await newFeedback.save();
        req.flash("success", "Your Feedback added!")
        res.redirect("/api/student/dashboard");
    }else{

         req.flash("error", "Worng Password!")

         res.redirect("/api/feedback");
    }   
}));

module.exports = router;