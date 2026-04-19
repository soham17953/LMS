const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { requireStudent } = require('../middlewares/auth');
const upload = require('../config/multer');

// Health check endpoint (no auth required)
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Student routes are working' });
});

router.use(requireStudent);

router.get('/lectures', studentController.getLectures);
router.get('/attendance', studentController.getAttendance);
router.get('/homework', studentController.getHomework);
router.post('/homework/:id/submit', upload.single('hw_pdf'), studentController.submitHomework);
router.get('/materials', studentController.getMaterials);
router.get('/notices', studentController.getNotices);

module.exports = router;
