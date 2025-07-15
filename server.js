const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const connectDB = require('./confir/db');
const Feedback = require("./models/Feedback");
const Student = require("./models/Student");
const Admin = require("./models/Admin");
const ejsMate = require('ejs-mate');
const PORT = 8080;
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');

app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, "public")))
app.set('view engine', 'ejs');
app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));

connectDB();

// Session middleware (MUST come before flash and any route that uses req.flash)
app.use(session({
  secret: 'your_secret_key', // change this to something secure in production
  resave: false,
  saveUninitialized: false
}));
app.use(flash());

// Pass flash messages to all templates (optional but common)
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.currentRoute = req.path;
  next();
});

// app.get("/data", async(req, res) => {
//     let newAdmin = new Admin({
//         adminName: "istiyaaq",
//         hostelName: "AMKH",
//         password: "hello"
//     })
//     await newAdmin.save();
//     res.send(newAdmin);    
// })

// Routes will go here
app.get("/home", async(req, res)=>{
    res.render("home");
});

//admin login
app.get("/api/admin/login",(req, res)=>{
    res.render("login.ejs");
})

app.post("/api/admin/dashboard", async (req, res) => {
    let { adminName, password } = req.body;
    let admin = await Admin.find({
        adminName: adminName,
        password: password,
    });
    if(admin.length){
        req.flash("success", "Welcome! Login Successfully!")
        res.redirect("/api/admin/dashboard");
    }else{
         req.flash("error", "Something went worng!")
         res.redirect("/api/admin/login");
    }   
});


app.get("/api/feedback", (req, res)=>{
    res.render("feedform.ejs")
});


app.post('/api/feedback', async (req, res) => {
   const {mealType, rating, comment, studentId, password} = req.body; 

    let student = await Student.find({
        studentId: studentId,
        password: password
    })
    if (student.length) {
        let newFeedback = new Feedback({
            mealType: mealType,
            rating: rating,
            comment: comment,
            owner: student[0]._id,
        })
            
        await newFeedback.save();
        req.flash("success", "Your Feedback added!")
        res.redirect("/api/student/dashboard");
    }else{
         req.flash("error", "Are You Hosteller? Then Fill Correct Info.")
         res.redirect("/api/feedback");
    }   
});


app.get("/api/admin/dashboard",async (req, res)=>{
     
    let allFeedbacks = await Feedback.find().populate("owner");
    res.render("allFeedbacks.ejs",{ allFeedbacks } );
});

app.get("/api/student/dashboard",async (req, res)=>{
     
    let allFeedbacks = await Feedback.find().populate("owner");
    res.render("allFeedbacks.ejs",{ allFeedbacks } );

});

app.get("/api/student/new",(req, res)=>{
    res.render("newStudent")
});

app.post("/api/student/new", async (req, res)=>{
    let { studentName, studentId, roomNumber, password } = req.body ; 
    let newStudent = new Student({
        studentId: studentId,
        studentName: studentName,
        roomNumber: roomNumber,
        password: password,
    });

   if( await newStudent.save()){
        req.flash("success", `You Add ${studentName} as a new Student!`)
        res.redirect("/api/admin/dashboard");
    }else{
         req.flash("error", "Something went wrong!")
         res.redirect("/api/student/new");
    }   
})

app.get("/api/admin/new", (req, res) => {
    res.render("newAdmin");
});

app.post("/api/admin/new", async (req, res)=>{
    let {adminName, hostelName, password } = req.body ; 
    let newAdmin = new Admin({
        adminName: adminName,
        hostelName: hostelName,
        password: password,
    });
    console.log(newAdmin)
   if( await newAdmin.save()){
        req.flash("success", `You Add ${adminName} as a new admin!`)
        res.redirect("/api/admin/dashboard");
    }else{
         req.flash("error", "Something went wrong!")
         res.redirect("/api/admin/new");
    }   
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));