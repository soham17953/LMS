const multer = require('multer');

// Memory storage for direct upload to Supabase
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

module.exports = upload;
