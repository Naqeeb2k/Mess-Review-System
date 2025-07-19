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
const bcrypt = require("bcrypt");
const { send } = require('process');

app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, "public")))
app.set('view engine', 'ejs');
app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
const saltRounds = 10;

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

app.get("/add", async(req, res) => {

    let adminName = "Shakir";
    let hostelName = "AMKH";

    const hashedPassword = await bcrypt.hash("shakir123", saltRounds);
    
    let newAdmin = new Admin({
        adminName: adminName,
        hostelName: hostelName,
        password: hashedPassword,
    });
    console.log(newAdmin);
    res.send(newAdmin);
    await newAdmin.save();
})

// Routes will go here
app.get("/home", async(req, res)=>{
    res.render("home");
});

//admin login
app.get("/api/admin/login",(req, res)=>{
    res.render("login.ejs");
})


//admin login
app.post("/api/admin/dashboard", async (req, res) => {
    const { adminName, password } = req.body;
    const admin = await Admin.findOne({ adminName });
    if(!admin) return req.flash("error", "Worng Credentials!"), res.redirect("/api/admin/login");
    const validAdmin = await bcrypt.compare(password, admin.password);

    if(validAdmin){
        req.flash("success", "Welcome! Login Successfully!")
        res.redirect("/api/admin/dashboard");
    }else{
         req.flash("error", "Worng Credentials!")
         res.redirect("/api/admin/login");
    }   
});


//feedback form
app.get("/api/feedback", (req, res)=>{
    res.render("feedform.ejs")
});


//feedback saving in db
app.post('/api/feedback', async (req, res) => {
   const {mealType, rating, comment, studentId, password} = req.body; 

    const student = await Student.findOne({ studentId }); 
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
         req.flash("error", "Are You Hosteller? Then Fill Correct Info.")
         res.redirect("/api/feedback");
    }   
});

//showing all feedback
app.get("/api/admin/dashboard",async (req, res)=>{
     
    let allFeedbacks = await Feedback.find().populate("owner");
    res.render("allFeedbacks.ejs",{ allFeedbacks } );
});

//showing all feedback
app.get("/api/student/dashboard",async (req, res)=>{
     
    let allFeedbacks = await Feedback.find().populate("owner");
    res.render("allFeedbacks.ejs",{ allFeedbacks } );

});

//new student form 
app.get("/api/student/new",(req, res)=>{
    res.render("newStudent")
});

//saving new student
app.post("/api/student/new", async (req, res)=>{
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
})

//new admin form
app.get("/api/admin/new", (req, res) => {
    res.render("newAdmin");
});

//saving new admin in db
app.post("/api/admin/new", async (req, res)=>{
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
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));