const jwt = require('jsonwebtoken');
const secret = "Jamia";

module.exports = (req, res, next) => {
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
