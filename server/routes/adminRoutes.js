const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireTeacher } = require('../middlewares/auth'); // ADMIN role passes requireTeacher check

router.use(requireTeacher);

router.get('/dashboard', adminController.getDashboardStats);

router.get('/announcements', adminController.getAnnouncements);
router.post('/announcements', adminController.createAnnouncement);
router.put('/announcements/:id', adminController.updateAnnouncement);
router.delete('/announcements/:id', adminController.deleteAnnouncement);

router.get('/notices', adminController.getAllNotices);
router.put('/notices/:id', adminController.updateNotice);
router.delete('/notices/:id', adminController.deleteNotice);

router.get('/lectures', adminController.getAllLectures);
router.post('/lectures', adminController.createLecture);
router.put('/lectures/:id', adminController.updateLecture);
router.delete('/lectures/:id', adminController.deleteLecture);

router.get('/attendance', adminController.getAllAttendance);
router.put('/attendance/:recordId', adminController.updateAttendanceRecord);

module.exports = router;
