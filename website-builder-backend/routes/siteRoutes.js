const express = require('express');
const { 
  getSites, 
  getSite, 
  createSite, 
  updateSite, 
  deleteSite,
  publishSite
} = require('../controllers/siteController');

const router = express.Router();

const { protect } = require('../middleware/auth');

router
  .route('/')
  .get(protect, getSites)
  .post(protect, createSite);

router
  .route('/:id')
  .get(protect, getSite)
  .put(protect, updateSite)
  .delete(protect, deleteSite);

router
  .route('/:id/publish')
  .put(protect, publishSite);

module.exports = router;