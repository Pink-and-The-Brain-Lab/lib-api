import multer from 'multer';
import path from 'path';

const uploadConfig = {
    storage: multer.diskStorage({
        destination: path.join(__dirname, '..', 'uploads', 'images'),
        filename: (request, file, cb) => {
            const fileName = `${Date.now()}-${file.originalname}`;
            cb(null, fileName);
        }
    })
};

export { uploadConfig };
