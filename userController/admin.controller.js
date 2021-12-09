const userModule = require("../modules/user.module");
const registerModule = require("../modules/registerSecretNumber.module");
const auth = require("../auth/auth");


const addSecretNumber = (req, res) => {
    const { secretNumber } = req.body;
    const {role ,userName} = req.user;
    userModule.findOne({userName: userName},(err, user) => {
        if (err) {
         return res.status(401).json({msg: "data base error: " + err.message});
        }
        if(!user) {
         return res.status(404).json({msg: "user does not exist"})
        }
        if(user.role !== role) {
          return res.status(404).json({msg: "not Authorized"})
        }
        if (typeof secretNumber === "string") {
          registerModule.findOne({ registerNumber: secretNumber}, (err, data)=>{
            if(err){
              return res.status(401).json({msg: "data base error"});
            }
            if(!data){
              const registerNumber = new registerModule({ registerNumber: secretNumber });
              registerNumber.save();
              return res.status(200).send(registerNumber);
            }else{
              return res.status(401).json({msg: "Invalid secret number (already exists)"});
            }
          })
        }
    })
  };
  
  const deleteSecretNumbers = (req, res) => {
    registerModule.deleteMany({}, (err, data) => {
      if (err) return res.sendStatus(401);
      return res.sendStatus(200);
    });
  };
  const deleteSecretNumber = (registerNumber) => {
    console.log("number well be deleted");
    registerModule.findOneAndDelete(
      { registerNumber: registerNumber },
      (err, data) => {
        if (err) return 
        console.log("number was deleted ",data);
      }
    );
  };


  module.exports = {
    addSecretNumber,
    deleteSecretNumbers,
    deleteSecretNumber,
  };

