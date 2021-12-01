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
Router.get("/", (req, res)=>{
res.status(200).json("my server")
})

Router.get('/auth',authenticateToken, (req, res)=>{
res.status(200).json(req.user);
})

module.exports = Router;