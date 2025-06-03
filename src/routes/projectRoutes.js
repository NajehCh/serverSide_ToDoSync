const express = require("express");
const { createProjectController,getProjectByIdController,getTasksByProjectController,getAllProjectsController,getProjectsByUserController,updateProjectController,deleteProjectController} = require("../controllers/projectController");
const tokenMiddleware  = require("../middleware/tokenMiddleware");

const router = express.Router();

router.get("/",tokenMiddleware.decodeToken,getAllProjectsController);
router.post("/create_project",tokenMiddleware.decodeToken,createProjectController);
router.get("/:uid",tokenMiddleware.decodeToken,getProjectByIdController);
router.get("/user/all",tokenMiddleware.decodeToken,getProjectsByUserController);
router.put("/edit_project/:id",tokenMiddleware.decodeToken,updateProjectController)
router.delete("/delete_project/:id",tokenMiddleware.decodeToken,deleteProjectController)
router.get("/project/:projectId", tokenMiddleware.decodeToken, getTasksByProjectController);

module.exports = router;
