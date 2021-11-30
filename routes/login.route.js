const express=require('express');
const Router = express.Router();
const logInController = require('../userController/user.controller')
const {authenticateToken} =require('../auth/auth')
Router.get('/', function(req, res){
return "hello world";
})
Router.post('/register', function(req, res){
    logInController.register(req, res);
})
Router.post('/login', function(req, res){
    logInController.login(req, res);
})

Router.post('/logout',authenticateToken, function(req, res){
    logInController.logout(req, res);
})


module.exports = Router;