const express = require("express");
const { createTaskController,deleteTaskController,updateTaskController,getTaskByIdController, getAllTasksController, getTasksByUserController } = require("../controllers/taskController");
const tokenMiddleware  = require("../middleware/tokenMiddleware");

const router = express.Router();

//router.get("/",getAllTasksController);
router.post("/create_task",tokenMiddleware.decodeToken,createTaskController);
router.get("/:uid",tokenMiddleware.decodeToken,getTaskByIdController);
router.get("/user/tasks",tokenMiddleware.decodeToken,getTasksByUserController);
router.put("/edit/:id",tokenMiddleware.decodeToken,updateTaskController)
router.delete("/delete/:id",tokenMiddleware.decodeToken,deleteTaskController)
module.exports = router;
