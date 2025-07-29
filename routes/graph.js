const express = require("express");
const router = express.Router({mergeParams: true});
const Feedback = require("../models/Feedback");
const wrapAsync = require("../utilis/WrapAsync");

//chart route 
router.get('/',wrapAsync( async (req, res) => {
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
}));

module.exports = router;