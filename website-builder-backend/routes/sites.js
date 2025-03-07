const express = require('express');
const {
  getSites,
  getSite,
  createSite,
  updateSite,
  deleteSite,
  publishSite,
} = require('../controllers/siteController');
const router = express.Router();

router.route('/').get(getSites).post(createSite);
router.route('/:id').get(getSite).put(updateSite).delete(deleteSite);
router.route('/:id/publish').put(publishSite);

module.exports = router;