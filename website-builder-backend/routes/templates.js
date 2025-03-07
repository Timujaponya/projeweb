const express = require('express');
const {
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} = require('../controllers/templateController');
const router = express.Router();

router.route('/').get(getTemplates).post(createTemplate);
router.route('/:id').get(getTemplate).put(updateTemplate).delete(deleteTemplate);

module.exports = router;