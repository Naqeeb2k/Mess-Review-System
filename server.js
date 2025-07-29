const express = require('express');
const app = express();
const path = require('path');
const connectDB = require('./confir/db');
const ejsMate = require('ejs-mate');
const PORT = 8080;
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const ExpressError = require("./utilis/ExpressError");

const student = require("./routes/student");
const admin = require("./routes/admin");
const feedback = require("./routes/feedback");
const graph = require("./routes/graph");
const home = require("./routes/home");


app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, "public")))
app.set('view engine', 'ejs');
app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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

app.use("/api/student", student);
app.use("/api/admin", admin);
app.use("/api/feedback", feedback);
app.use("/api/graph", graph);
app.use("/home", home);

//this is for invalid route
app.use((req, res, next) => {
    next(new ExpressError(404, "Page not found"));
})

//this is for all backend errors
app.use((err, req, res, next) => {
    const { status = 500, message = "something went wrong" } = err;
    res.status(status).render("error.ejs", {message});
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));