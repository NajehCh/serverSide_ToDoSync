const express = require("express");
const { signup, signin,updateProfileNameController, getUserController,loginController,userLoginStatus,changePasswordController } = require("../controllers/userController");
const tokenMiddleware  = require("../middleware/tokenMiddleware");

const router = express.Router();


router.post("/signup", signup);
router.post("/login",loginController);
router.get("/:uid",tokenMiddleware.decodeToken,getUserController);
router.put("/change-password",tokenMiddleware.decodeToken, changePasswordController);
router.get("/login/status",tokenMiddleware.decodeToken,userLoginStatus);
router.put("/update-name",tokenMiddleware.decodeToken,updateProfileNameController)


module.exports = router;
