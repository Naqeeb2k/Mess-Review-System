const express = require("express");
const router = express.Router({mergeParams: true});
const Feedback = require("../models/Feedback");
const Student = require("../models/Student");
const Comment = require("../models/comment");
const wrapAsync = require("../utilis/WrapAsync");
const { auth } = require("../middlewares");


//showing all feedbacks for students
router.get("/dashboard", wrapAsync(async (req, res)=>{  
    let allFeedbacks = await Feedback.find().populate("owner");
    res.render("feedback/allFeedbacks.ejs",{ allFeedbacks } );
    res.clearCookie('token');
}));

//student edit route
router.get("/:id/edit", auth, wrapAsync(async (req, res) => {
    const {id} = req.params;
    const studentDetails = await Student.findById(id);
    res.render("student/studentEditPage", {studentDetails});
}))

//student update route
router.put("/:id/edit", wrapAsync(async (req, res) => {
    const {id} = req.params;
    const {studentName, studentId, roomNumber} = req.body;
    await Student.findByIdAndUpdate(id, {
        studentName: studentName,
        studentId: studentId,
        roomNumber: roomNumber,
    });
     req.flash("success", "Student updated successfully!");
    res.redirect("/api/admin/showAllStudents");
    
}))

//route for deleting students
router.delete("/:id", wrapAsync(async(req, res) => {
    const {id} = req.params;
    await Student.findByIdAndDelete(id);
    res.redirect("/api/admin/showAllStudents");
}))

//route for showing the commnets
router.get("/comment",wrapAsync( async (req, res)=>{
    const comments = await Comment.find({});
    res.render("comment/comment", { comments });
}));

module.exports = router;