const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth } = require('../middlewares/auth');

router.get('/profiles/me', requireAuth, userController.getMe);
router.post('/profiles', requireAuth, userController.createProfile);
router.get('/users', requireAuth, userController.getUsers);
router.patch('/users/:userId/status', requireAuth, userController.updateUserStatus);

module.exports = router;
