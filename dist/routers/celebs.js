"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const CelebImage_js_1 = require("../db/entities/CelebImage.js");
const AWS = require("aws-sdk");
AWS.config.update({ region: 'us-west-2' });
const rekognition = new AWS.Rekognition();
const router = express_1.default.Router();
const storage = multer_1.default.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'uploads/');
    },
    filename: (req, file, callback) => {
        callback(null, Date.now() + '-' + file.originalname);
    }
});
const upload = (0, multer_1.default)({ storage });
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page || '1');
        const pageSize = parseInt(req.query.pageSize || '10');
        const [items, total] = await CelebImage_js_1.CelebImage.findAndCount({
            skip: pageSize * (page - 1),
            take: pageSize
        });
        res.send({
            page: 1,
            pageSize: items.length,
            total,
            items
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Something went wrong!!!!");
    }
});
router.get('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const image = await CelebImage_js_1.CelebImage.findOne({
            where: { id }
        });
        if (image) {
            res.status(200).send(image);
        }
        else {
            res.status(404).send("Image not found");
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Something went wrong! :(");
    }
});
router.post('/add', upload.single('file'), async (req, res) => {
    try {
        // Check if a file was uploaded in the request
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }
        const path = req.file.path;
        const imageBytes = fs_1.default.readFileSync(path);
        try {
            const newImage = new CelebImage_js_1.CelebImage();
            newImage.imagepath = path;
            const params = {
                Image: {
                    Bytes: imageBytes
                }
            };
            rekognition.recognizeCelebrities(params, async (err, data) => {
                if (err) {
                    console.error('Error spotting celebrities:', err);
                    res.status(500).send("Error spotting celebrities.");
                }
                else {
                    if (data.CelebrityFaces.length === 0) {
                        console.log('No celebrities found in the image.');
                        newImage.result = 'No celebrities found in the image.';
                    }
                    else {
                        console.log('Celebrities found:');
                        newImage.result = JSON.stringify(data.CelebrityFaces);
                    }
                    try {
                        await newImage.save();
                        res.send("Celeb Image Added! :)");
                    }
                    catch (error) {
                        console.error(error);
                        res.status(500).send("Error saving the image data.");
                    }
                }
            });
        }
        catch (error) {
            console.error(error);
            res.status(500).send("Something went wrong :(");
        }
    }
    catch (err) {
        console.log("ERROR: " + err);
        res.send(err);
    }
});
exports.default = router;
