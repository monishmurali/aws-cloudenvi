const express=require('express');
const router=express.Router();
const { ensureAuthenticated }= require('./../config/auth');
const AWS = require('aws-sdk');

const User = require('./../models/user');
const Files = require('./../models/files');
 
//dynamoDb
const dynamoDbObj = require('./../models/connect');

//Welcome Page
router.get('/',(req,res)=>res.render('welcome'));

//dahsboard Page
router.get('/dashboard',ensureAuthenticated,(req,res)=>{

    const currentuser =req.user;
    const email = req.user.email;

    if(req.user.name == 'admin'){

        // let getdata = () => {
        //     var params = {
        //         TableName: 'user',
        //         Key: {
        //             'email': email
        //         },
        //         "level": {
        //             ComparisonOperator: "NE",
        //             AttributeValueList: [ {"S":"A"} ]
        //        }
        //     };

        //     dynamoDbObj.get(params, function (err, userdata) {
                
        //         if (err){ throw err}
        //         else{

        //             var params1 = {
        //                 TableName: 'files',
        //                 Key: {
        //                     'email': email
        //                 }
        //             };

        //             dynamoDbObj.get(params1, function (err, filedata) {

        //                 console.log(currentuser);
        //                 console.log(filedata);
        //                 console.log(userdata);
        //                 if (err){ throw err}
        //                 else{

        //                     res.render('dashboard',{
        //                         user: currentuser,
        //                         data: filedata,
        //                         logins: userdata
        //                     })
        //                 }
        //             })
        //         }
        //     })
        // }

        // getdata();

        
        User.find({ level: { $ne: 'A' }},(err, output) => {
            // console.log(output);
            Files.find({},(err, data) => {
                
                res.render('dashboard',{
                    user: currentuser,
                    data: data,
                    logins: output
                })
            })
        })
      
    }
    else{

        // let getdata = () => {

        //     var params= {
        //         TableName: 'files',
        //         Key: {
        //             'email': email
        //         }
        //     };

        //     dynamoDbObj.get(params, function (err, filedata) {

        //         if (err){ throw err}
        //         else{

        //             console.log(filedata);

        //             res.render('dashboard',{
        //                 user: currentuser,
        //                 data: filedata,
        //                 logins: { }
        //             })
        //         }
        //     })
        // }

        Files.find({ email : req.user.email },(err, data) => {
            console.log(data);
            res.render('dashboard',{
                
                user: currentuser,
                data: data,
                logins: {}
            })
        })
    }
});



module.exports=router;