const mongoose = require("mongoose");
const UserSchema = mongoose.Schema;

const userModule = new UserSchema({
  userName: {
      type: "string",
      required: true,
      min:6
  },
  email: {
    type: String,
    // match: "",
    required: true,
  },
  password: {
    type: String,
    required: true,
    min:8
  },
  refreshToken: {
    type: String,
    default: null,
  },
  role: {
    type: String,
    required: true,
  },
  // isActive: {
  //   type: Boolean,
  //   default: false
  // }
  islogedin:{
    type: Boolean,
    default: false
  },
  uniqid:{
    type:String,
    default:""
  }
});

module.exports = mongoose.model("zoomusers", userModule);
