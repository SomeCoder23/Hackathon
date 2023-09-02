import express from 'express';
import multer from 'multer';
import fs from 'fs';
import celebsRouter from './routers/celebs.js';
import textRouter from './routers/text.js';
import dataSource from "./db/dataSource.js";
const AWS = require("aws-sdk");
AWS.config.update({ region: 'us-west-2' });
const rekognition = new AWS.Rekognition();
console.log('Region: ' + AWS.config.region);

var app = express();

const PORT = 5000;
app.use('/celebs', celebsRouter);
app.use('/text', textRouter);

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'uploads/');
  },
  filename: (req, file, callback) => {
    callback(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({ storage });

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    res.status(500).send("Failed Upload File!");
    return;
  }
  const fileURL = req.file.destination + req.file.filename;
  res.send({
    message: 'File Uploaded Successfully!',
    file: fileURL
  });
});

app.get('/health', (req, res) => {
  res.status(200).send("Everything good");
})

app.get('/', (req, res) => {
  res.status(200).send("Welcome to our application.");
})

app.post('/labels', upload.single('file'), async (req, res) => {
  try {
    // Check if a file was uploaded in the request
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    // Read the uploaded image file
    const imageBytes = fs.readFileSync(req.file.path);

    // Detect labels using Rekognition
    const params = {
      Image: {
        Bytes: imageBytes
      },
      MaxLabels: 10, // Adjust this value as needed
      MinConfidence: 70 // Adjust this value as needed
    };

    const labelsResponse = await rekognition.detectLabels(params).promise();

    // Send the detected labels as a JSON response
    res.json({ labels: labelsResponse.Labels });
  } catch (error) {
    console.error('Error detecting labels:', error);
    res.status(500).json({ error: 'Error detecting labels.' });
  }
});

/*app.post('/celebs', upload.single('file'), async (req, res) => {
  try {
    // Check if a file was uploaded in the request
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const imageBytes = fs.readFileSync(req.file.path);
    const params = {
      Image: {
        Bytes: imageBytes
      },
      
    };
    rekognition.recognizeCelebrities(params, (err: any, data: { CelebrityFaces: { Name: any; MatchConfidence: any; }[]; }) => { 
      if (err) { 
        console.error('Error spotting celebrities:', err); 
      } else { 
        if (data.CelebrityFaces.length === 0) { 
          console.log('No celebrities found in the image.');
          res.send('No celebrities found in the image.');        
        } else { 
          console.log('Celebrities found:'); 
          res.send(data.CelebrityFaces);
         
        } 
      } 
      }); 

  } catch(err){
      console.log("ERROR: " + err);
      res.send(err);
  }
});

app.post('/text', upload.single('file'), async (req, res) => {
  try {
    // Check if a file was uploaded in the request
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const imageBytes = fs.readFileSync(req.file.path);
    const params = {
      Image: {
        Bytes: imageBytes
      },
      
    };
   rekognition.detectText(params, (err: any, data: { TextDetections: any[]; }) => { 
    if (err) { 
      console.error('Error extracting text:', err); 
    } else { 
      if (data.TextDetections.length === 0) { 
        console.log('No text found in the image.'); 
        res.send("No text detected");
      } else { 
        console.log('Text detected:'); 
        res.send(data.TextDetections);
      } 
    } 
  });

  } catch(err){
      console.log("ERROR: " + err);
      res.send(err);
  }  
});*/

app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
  dataSource.initialize();

});

export default app;
