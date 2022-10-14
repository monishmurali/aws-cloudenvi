const express = require('express');
const router = express.Router();
const AWS = require("aws-sdk");
const keys = require("../config/keys");
const Files= require('./../models/files');

router.post('/', (req, res) => {

    var fileUrl = req.body.fileUrl;
     
    const email = req.body.email;
    var fileName = fileUrl.split('/')[3];

    let s3bucket = new AWS.S3({
        accessKeyId: keys.AwsAccessKeyId,
        secretAccessKey: keys.AwsSecretAccessKey,
        region: keys.region,
        s3BucketEndpoint: false,
        endpoint: 's3.amazonaws.com',
        port: 443
    });
    console.log(fileName);
    var params1 = {
        Bucket: keys.bucketName,
        Delete: {
            Objects: [
              {
                Key: fileName 
              },
            ],
          }
    };

    s3bucket.deleteObjects(params1, function(err, data) {
        
        if (err) {
            res.status(500).json({error: true, Message: err});
        }
        else{
            console.log('success bucket delete');
            req.flash('success_msg','File Deleted!');
            res.redirect('/dashboard');

            //delete from dynamo
            const dynamoDbObj = require('./../models/connect');

            var params = {
                TableName: 'files',
                Key: {
                    "fileName": fileName
                }
            };
            
            dynamoDbObj.delete(params, function (err, data) {
        
                if (err) {
                    console.log(err);
                } else {
                    console.log('File deleted');
                }
            });

            //delete from mongo
            Files.deleteOne({ fileUrl: fileUrl }, function (err) {
                if (err) {
                    return err;
                }
                else{
                    console.log('File deleted');
                }
                
              });
        }      
    });


});

module.exports = router;