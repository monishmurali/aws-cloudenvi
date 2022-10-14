const express = require('express');
const router = express.Router();
const AWS = require("aws-sdk");
const multer = require("multer");
const keys = require("../config/keys");
const Files= require('./../models/files');

 const storage = multer.memoryStorage();
 const upload = multer({storage: storage, limits: {fileSize: 10 * 1024 * 1024}}).single('myImage');


router.post('/', (req, res) => {

  upload(req, res, (err) => {
    // console.log('User is');
    // console.log(req.user);
    const moment = require('moment');    
    //File Upload started
    var startDate = new Date();
  
    //get user details 
      const email = req.user.email;
      const name = req.user.name;
  
      const file = req.file;

      if(!file){
        req.flash('error_msg','Please select a file');
        res.redirect('/dashboard');
      }
      else{



      //for s3 bucket
      const s3FileURL = 'https://monish-cloudenvi.s3.us-east-2.amazonaws.com';

      console.log('Start Bucket');
      let s3bucket = new AWS.S3({
          accessKeyId: keys.AwsAccessKeyId,
          secretAccessKey: keys.AwsSecretAccessKey,
          region: keys.region,
          s3BucketEndpoint: false,
          endpoint: 's3.amazonaws.com',
          port: 443
      });

      var myFileName = file.fieldname+('-')+Date.now();
      //for s3 bucket
      var s3params = {
          Bucket: 'monish-cloudenvi',
          Key: myFileName,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: "public-read"
      };
      s3bucket.upload(s3params, function (err, data) {
        
        if (err) {
            console.log(err);
            //res.status(500).json({error: true, Message: err});
        } else {
            //success
            req.flash('success_msg','File Uploaded!');
            res.redirect('/dashboard');

            //updating in dyanamodb

            var endDate   = new Date();

            //dynamoDb
            
            var input = {
              'email': email, 'createdDate': Date.now(), 'fileDesc': file.originalname, 'fileName': myFileName,
              'fileUrl': data.Location, 'modifiedDate': Date.now(), 'name': name , 'uploadTime' : ((endDate - startDate) / 1000)
            };
            

            const dynamoDbObj = require('./../models/connect');

            var paramsDb = {
                TableName: "files",
                Item:  input
            };

            dynamoDbObj.put(paramsDb, function (err, data) {
                
                if (err) {
                    console.log(err);
                } else {
                    console.log('File uploaded');
                }
            });

            //mongo
            const newFile = new Files({
              user : name,
              email : email,
              fileUrl:data.Location,
              fileName: myFileName,
              fileDesc: file.originalname,
              uploadTime: ((endDate - startDate) / 1000),
              modifiedDate: ((endDate - startDate) / 1000)
            });
            //check if already exisits
            Files.findOne({ fileName:file.originalname })
            .then( (fileName) => {

                newFile.save()
                .then(file => {
                  console.log('File Uploaded');
              })
              .catch(err=>console.log(err));
            });

        }
      });
      }
    
  });
});

module.exports = router;