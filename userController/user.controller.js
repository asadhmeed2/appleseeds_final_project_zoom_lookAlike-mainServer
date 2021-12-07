const userModule = require("../modules/user.module");
const registerModule = require("../modules/registerSecretNumber.module");
const { deleteSecretNumber } = require("../userController/admin.controller");
const { v4: uuidv4 } = require("uuid");
const auth = require("../auth/auth");

const register = (req, res) => {
  const { userName, email, password, registerNumber } = req.body;
  registerModule.findOne({ registerNumber: registerNumber }, (err, data) => {
    if (err) {
      return res.sendStatus(401);
    }
    userModule.findOne({ email: email }, (err, data) => {
      if (err) {
        return res.status(401).send("user already exist");
      }
      if (data) {
        return res.status(401).send("user already exist");
      }
      const user = new userModule({
        userName,
        email,
        password,
        role: "user",
      });
      deleteSecretNumber(registerNumber);
      user.save();
      return res.status(200).json({
        msg: "registered successfully",
      });
    });
  });
};
/**
 *
 * @param {*} req
 * @param {*} res
 */
const login = (req, res) => {
  const { email, password } = req.body;
  console.log("email: ", email);
  console.log("password: ", password);
  const uniqid = uuidv4(); // unique id to adentify the user when logout
  userModule.findOne({ email: email }, (err, user) => {
    if (err) {
      console.log(err);
      return res.status(401).send({ msg: "email or password incorrect" });
    }
    console.log(user);
    if (!user) {
      return res.status(404).send({ msg: "email or password incorrect" });
    }
    if (user && password === user.password) {
      if (user.role !== "admin") {
        userModule.find({ role: "admin" }, (err, admins) => {
          if (err) {
            return res.status(401).send({ msg: "error cannot connect to data base" });
          }
          if (!admins) {
            return res.status(404).send({ msg: "no admin in data base" });
          }
          if (admins) {
            let adminIsLogedin = false;
            admins.forEach((user) => {
              if (user.islogedin) {
                adminIsLogedin = true;
              }
            });
            if (!adminIsLogedin) {
              return res
                .status(401)
                .json({ msg: "the host is not loged in", adminLogedIn: false });
            } else {
              const { accessToken, refreshToken } = auth.createTokens(
                req,
                user.role,
                uniqid
              );
              console.log(uniqid);
              userModule.findByIdAndUpdate(
                user._id,
                { refreshToken: refreshToken, islogedin: true, uniqid: uniqid },{new: true},
                (err, data) => {
                  if (err) return res.status(401).send("user does not exist");
                  return res
                    .status(200)
                    .send({
                      accessToken: accessToken,
                      refreshToken: refreshToken,
                    });
                }
              );
            }
          }
        });
      } else {
        const { accessToken, refreshToken } = auth.createTokens(
          req,
          user.role,
          uniqid
        );
        userModule.findByIdAndUpdate(
          user._id,
          { refreshToken: refreshToken, islogedin: true, uniqid: uniqid },{new: true},
          (err, data) => {
            if (err) return res.status(401).send("user does not exist");
            return res
              .status(200)
              .send({ accessToken: accessToken, refreshToken: refreshToken });
          }
        );
      }
    } else {
      return res.status(404).json({ msg: "email or password incorrect" });
    }
  });
};
const logoutToAllUsers = () => {
  userModule.find({}, (err, data) => {
    data.forEach((user) => {
      userModule.findByIdAndUpdate(
        user._id,
        { refreshToken: "" },
        (err, data) => {
          if (err) return res.status(401).send("");
          return res
            .status(200)
            .send({ adminLogedOut: true, msg: "the admin hase loged out" });
        }
      );
    });
  });
};
const logout = (req, res) => {
  const { uniqid } = req.user;
  
  userModule.findOne({ uniqid: uniqid }, (err, data) => {
    if (err) {
      return res.status(401).send("user does not exist");
    }
    if (data.role === "admin") {
      // logoutToAllUsers();
      return res.status(200).json({ adminLogedOut: true });
    }
    userModule.findByIdAndUpdate(
      data._id,
      { refreshToken: "", islogedin: false },
      (err, data) => {
        if (err) return res.status(401).send("user does not exist");
        return res.status(200).json({
          adminLogedOut: false,
          userLogedOut: true,
          msg: "logout successfully",
        });
      }
    );
  });
};

module.exports = {
  register,
  login,
  logout,
};
