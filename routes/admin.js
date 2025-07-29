const express = require("express");
const router = express.Router({mergeParams: true});
const Feedback = require("../models/Feedback");
const Student = require("../models/Student");
const auth = require('../middlewares/auth');
const Admin = require("../models/Admin");
const bcrypt = require("bcrypt");
const Comment = require("../models/comment");
const jwt = require("jsonwebtoken");
const wrapAsync = require("../utilis/WrapAsync");

const saltRounds = 10;
const secret = "Jamia";

//admin login
router.get("/login",(req, res)=>{
    res.render("admin/login.ejs");
})

//admin login
router.post("/dashboard",wrapAsync(async (req, res) => {
    const { adminName, password } = req.body;
    const admin = await Admin.findOne({ adminName });
    if(!admin) return req.flash("error", "Worng Credentials!"), res.redirect("/api/admin/login");
    const validAdmin = await bcrypt.compare(password, admin.password);

    if(validAdmin){
        const token = jwt.sign({id: 1, username: admin.adminName }, secret, { expiresIn: '1h' });
        res.cookie("token", token);
        req.flash("success", "Welcome! Login Successfully!")
        res.redirect("/api/admin/dashboard");
    }else{
         req.flash("error", "Worng Credentials!")
         res.redirect("/api/admin/login");
    }   
}));

//showing all feedbacks for Admins
router.get("/allFeedbacks", auth, wrapAsync(async (req, res)=>{ 
    let allFeedbacks = await Feedback.find().populate("owner");
    res.render("feedback/allFeedbacks.ejs",{ allFeedbacks } );
}));

//Admin dashboard
router.get("/dashboard", auth, wrapAsync(async (req, res)=>{
    res.render("admin/admin");
}));

//new student form 
router.get("/addStudent", auth, (req, res)=>{
    res.render("student/newStudent");
});

//saving new student
router.post("/addStudent", wrapAsync(async (req, res)=>{
    let { studentName, studentId, roomNumber, password } = req.body ; 

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    let newStudent = new Student({
        studentId: studentId,
        studentName: studentName,
        roomNumber: roomNumber,
        password: hashedPassword,
    });

   if(await newStudent.save()){
        req.flash("success", `You Add ${studentName} as a new Student!`)
        res.redirect("/api/admin/dashboard");
    }else{
         req.flash("error", "Something went wrong!")
         res.redirect("/api/student/new");
    }   
}));

//new admin form
router.get("/addAdmin", auth, (req, res) => {
    res.render("admin/newAdmin");
});

//saving new admin in db
router.post("/addAdmin",wrapAsync(async (req, res)=>{
    let {adminName, hostelName, password } = req.body ; 

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    let newAdmin = new Admin({
        adminName: adminName,
        hostelName: hostelName,
        password: hashedPassword,
    });
    console.log(newAdmin)
   if( await newAdmin.save()){
        req.flash("success", `You Add ${adminName} as a new admin!`)
        res.redirect("/api/admin/dashboard");
    }else{
         req.flash("error", "Something went wrong!")
         res.redirect("/api/admin/new");
    }   
}));

//showing all students
router.get("/showAllStudents", auth, wrapAsync(async(req, res) => {
    const students = await Student.find({});
    res.render("student/allStudents", {students});  
}));

//showing all admins
router.get("/showAllAdmins", auth, wrapAsync(async(req, res) => {
    const admins = await Admin.find({});

    res.render("admin/allAdmins", {admins});

}));

//admin edit route
router.get("/:id/edit", auth, wrapAsync(async (req, res) => {
    const {id} = req.params;
    const adminDetails = await Admin.findById(id);
    res.render("admin/adminEditPage", {adminDetails});
}));

//student update route
router.put("/:id/edit", wrapAsync(async (req, res) => {
    const {id} = req.params;
    const {adminName, hostelName} = req.body;

    await Admin.findByIdAndUpdate(id, {
        adminName: adminName,
        hostelName: hostelName,
    });

    req.flash("success", "Student updated successfully!");
    res.redirect("/api/admin/showAllAdmins");
}));

//route for deleting admin
router.delete("/:id", wrapAsync(async(req, res) => {
    const {id} = req.params;
    await Admin.findByIdAndDelete(id);
    res.redirect("/api/admin/showAllAdmins");
}))

//for give comment
router.get("/dropcomment",auth, (req, res)=>{
    res.render("comment/dropcomment");
});

//for take comment
router.post("/dropcomment", wrapAsync(async (req, res)=>{
    const {id} = req.params;
    const {post, hostelName, comment} = req.body;
    let newComment = new Comment({
        post: post,
        hostelName: hostelName,
        comment: comment,
    })
    if(await newComment.save()){
        req.flash("success", `Your comment Droped`)
         
        res.redirect("/api/admin/dashboard");
    }else{
         req.flash("error", "Something went wrong!")
         res.redirect("/api/admin/dropcomment");
    }   
}));

//admin logout
router.get("/logOut", (req, res) => {
    res.clearCookie('token');
    req.flash("success", "Logged Out SuccessFully!");
    res.redirect("/home");
});

module.exports = router;