const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Specify the upload directory
    },
    filename: (req, file, cb) => {
        const filename = `${Date.now()}${path.extname(file.originalname)}`; // Temporary filename
        req.tempFilename = filename; // Store temp filename in request object
        cb(null, filename);
    }
});

const upload = multer({ storage });

module.exports = upload;