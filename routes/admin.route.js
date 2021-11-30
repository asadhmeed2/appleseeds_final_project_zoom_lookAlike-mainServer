const express=require('express');
const Router = express.Router();
const adminController = require('../userController/admin.controller')
const {adminTokenAuth} =require('../auth/auth')



Router.post('/secretNumber',adminTokenAuth, function(req, res){
    adminController.addSecretNumber(req, res);
})
Router.post('/adminlogin',adminTokenAuth, function(req, res){
    adminController.adminLogIn(req, res);
})
Router.delete('/secretNumber/all',adminTokenAuth, function(req, res){
    adminController.deleteSecretNumbers(req, res);
})
Router.delete('/secretNumber',adminTokenAuth, function(req, res){
    adminController.deleteSecretNumber(req, res);
})
module.exports=Router;