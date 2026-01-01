const express = require('express');
const router = express.Router();
const {
  getAllPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  bulkUpdateSchedule
} = require('../controllers/postController');

router.route('/')
  .get(getAllPosts)
  .post(createPost);

router.route('/bulk-schedule')
  .put(bulkUpdateSchedule);

router.route('/:id')
  .get(getPost)
  .put(updatePost)
  .delete(deletePost);

module.exports = router;