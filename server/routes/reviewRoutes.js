const express = require('express');
const router = express.Router();
router.use((req, _res, next) => {
  console.log('[reviews router]', req.method, req.originalUrl);
  next();
});


const {
  getAllReviews,
  getReviewById,
  getReviewsByUser,
  createReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');

router.get('/', getAllReviews);
router.get('/user/:userId', getReviewsByUser);
router.get('/:id', getReviewById);
router.post('/', createReview);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);

module.exports = router;
