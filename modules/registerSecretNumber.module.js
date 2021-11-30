const mongoose = require('mongoose');
const {Schema} = mongoose;


const RegisterNumberModule = new Schema({
registerNumber:{
    type:String,
    required: true    
},
date:{
    type:Date,
    default:new Date()
}
})

module.exports=mongoose.model('registerNumbers', RegisterNumberModule );