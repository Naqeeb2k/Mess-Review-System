const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const connectDB = require('./confir/db');
const Feedback = require("./models/Feedback");
const Student = require("./models/Student");
const Admin = require("./models/Admin");
const Comment = require("./models/comment");
const ejsMate = require('ejs-mate');
const PORT = 8080;
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");
const cookieParser = require('cookie-parser');
const auth = require('./middlewares/auth');


app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, "public")))
app.set('view engine', 'ejs');
app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const saltRounds = 10;
const secret = "Jamia";

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
  res.locals.req = req;
  next();
});

// Routes will go here
app.get("/home", async(req, res)=>{
    res.render("home");
    res.clearCookie('token');
});

//admin login
app.get("/api/admin/login",(req, res)=>{
    res.render("admin/login.ejs");
})

//admin login
app.post("/api/admin/dashboard", async (req, res) => {
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
});


//feedback form
app.get("/api/feedback", (req, res)=>{
    res.render("feedback/feedform.ejs");
    res.clearCookie('token');
});

//feedback saving in db
app.post('/api/feedback', async (req, res) => {
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
});

//showing all feedbacks for students
app.get("/api/student/dashboard",async (req, res)=>{  
    let allFeedbacks = await Feedback.find().populate("owner");
    res.render("feedback/allFeedbacks.ejs",{ allFeedbacks } );
    res.clearCookie('token');
});

//showing all feedbacks for Admins
app.get("/api/admin/allFeedbacks", auth, async (req, res)=>{ 
    let allFeedbacks = await Feedback.find().populate("owner");
    res.render("feedback/allFeedbacks.ejs",{ allFeedbacks } );
});

//Admin dashboard
app.get("/api/admin/dashboard", auth, async (req, res)=>{
    res.render("admin/admin");
});

//new student form 
app.get("/api/admin/addStudent", auth, (req, res)=>{
    res.render("student/newStudent");
});

//saving new student
app.post("/api/admin/addStudent", async (req, res)=>{
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
app.get("/api/admin/addAdmin", auth, (req, res) => {
    res.render("admin/newAdmin");
});

//saving new admin in db
app.post("/api/admin/addAdmin", async (req, res)=>{
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

//showing all students
app.get("/api/admin/showAllStudents", auth, async(req, res) => {
    const students = await Student.find({});
    res.render("student/allStudents", {students});  
})

//showing all admins
app.get("/api/admin/showAllAdmins", auth, async(req, res) => {
    const admins = await Admin.find({});

    res.render("admin/allAdmins", {admins});

})

//student edit route
app.get("/api/student/:id/edit", auth, async (req, res) => {
    const {id} = req.params;
    const studentDetails = await Student.findById(id);
    res.render("student/studentEditPage", {studentDetails});
})

//student update route
app.put("/api/student/:id/edit", async (req, res) => {
    const {id} = req.params;
    const {studentName, studentId, roomNumber} = req.body;
    await Student.findByIdAndUpdate(id, {
        studentName: studentName,
        studentId: studentId,
        roomNumber: roomNumber,
    });
     req.flash("success", "Student updated successfully!");
    res.redirect("/api/admin/showAllStudents");
    
})

//admin edit route
app.get("/api/admin/:id/edit", auth, async (req, res) => {
    const {id} = req.params;
    const adminDetails = await Admin.findById(id);
    res.render("admin/adminEditPage", {adminDetails});
})

//student update route
app.put("/api/admin/:id/edit", async (req, res) => {
    const {id} = req.params;
    const {adminName, hostelName} = req.body;

    await Admin.findByIdAndUpdate(id, {
        adminName: adminName,
        hostelName: hostelName,
    });

    req.flash("success", "Student updated successfully!");
    res.redirect("/api/admin/showAllAdmins");
});

//route for deleting admin
app.delete("/api/admins/:id", async(req, res) => {
    const {id} = req.params;
    await Admin.findByIdAndDelete(id);
    res.redirect("/api/admin/showAllAdmins");
})

//route for deleting students
app.delete("/api/student/:id", async(req, res) => {
    const {id} = req.params;
    await Student.findByIdAndDelete(id);
    res.redirect("/api/admin/showAllStudents");
})

//for give comment
app.get("/api/admin/dropcomment",(req, res)=>{
    res.render("dropcomment");
});

//for take comment
app.post("/api/admin/dropcomment",async (req, res)=>{
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
    
});

// //route for showing the commnets
app.get("/api/comment", async (req, res)=>{
    const comments = await Comment.find({});
    res.render("comment", { comments });
});

//chart route 
app.get('/api/graph', async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const weeklyData = await Feedback.aggregate([
      {
        $match: {
          date: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: { $week: "$date" },
          averageRating: { $avg: "$rating" }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);

    const labels = weeklyData.map(entry => `Week ${entry._id}`);
    const data = weeklyData.map(entry => Number(entry.averageRating.toFixed(2)));

    res.render('graph', { labels, data });

  } catch (err) {
    console.error('Error generating graph data:', err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/api/admin/logOut", (req, res) => {
    res.clearCookie('token');
    req.flash("success", "Logged Out SuccessFully!");
    res.redirect("/home");
})

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));