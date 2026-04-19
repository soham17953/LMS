const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const { requireTeacher } = require('../middlewares/auth');
const upload = require('../config/multer');

router.use(requireTeacher);

router.get('/dashboard', teacherController.getDashboardStats);

router.get('/lectures', teacherController.getLectures);
router.post('/lectures', teacherController.createLecture);
router.put('/lectures/:id', teacherController.updateLecture);
router.delete('/lectures/:id', teacherController.deleteLecture);

router.get('/homework', teacherController.getHomework);
router.post('/homework', upload.single('hw_pdf'), teacherController.createHomework);
router.put('/homework/:id', upload.single('hw_pdf'), teacherController.updateHomework);
router.delete('/homework/:id', teacherController.deleteHomework);

router.get('/materials', teacherController.getMaterials);
router.post('/materials', upload.single('material_pdf'), teacherController.createMaterial);
router.put('/materials/:id', upload.single('material_pdf'), teacherController.updateMaterial);
router.delete('/materials/:id', teacherController.deleteMaterial);

router.get('/notices', teacherController.getNotices);
router.post('/notices', teacherController.createNotice);
router.put('/notices/:id', teacherController.updateNotice);
router.delete('/notices/:id', teacherController.deleteNotice);

router.get('/students', teacherController.getStudentsForAttendance);
router.get('/attendance/history', teacherController.getAttendanceHistory);
router.post('/attendance', teacherController.recordAttendance);
router.put('/attendance/:recordId', teacherController.updateAttendance);

module.exports = router;
