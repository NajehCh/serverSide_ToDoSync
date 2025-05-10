const { auth } = require("../config/firebase-config");
const admin = require('../config/firebase-config')

const { createTask,deleteTask,getTaskById, getAllTasks, getTasksByUser,updateTask} = require("../model/TaskModel");

// Inscription
const createTaskController = async (req, res) => {
  const {title, description,priority,dueDate,status,files,completed}=req.body

  let isCompleted = completed === "true";
  const uid=req.user.uid

  try {
     // Vérification du titre
     if (!title) {
      return res.status(400).json({
        success: false,
        error: "Please provide a title",
      });
    }

    // Récupérer les données de la requête (envoyées dans le body)
    const taskData ={ 
      title,
      description,
      priority,
      dueDate,
      user:uid,
      status,files,isCompleted
    };
    // Appeler la fonction createTask du modèle
    const newTask = await createTask(taskData);    

    // Répondre avec un statut 201 (Created) et la tâche créée
    res.status(201).json({
        success: true,
        data: newTask,
        message: "Task created successfully",
      });
  } catch (error) {
    // Gérer les erreurs et renvoyer une réponse appropriée
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Récupérer une tâche par son ID
const getTaskByIdController = async (req, res) => {
  try {
    // Récupérer l'ID de la tâche depuis les paramètres de l'URL
    const { uid } = req.params;

    
    // Appeler la fonction getTaskById du modèle
    const task = await getTaskById(uid);

    // Vérifier que l'utilisateur a le droit d'accéder à cette tâche
    if (req.user && req.user.uid && task.user !== req.user.uid) {
      throw new Error("Unauthorized access to this task");
    }

    // Répondre avec un statut 200 (OK) et la tâche
    res.status(200).json({
      success: true,
      data: task,
      message: "Task retrieved successfully",
    });
  } catch (error) {
    const statusCode = error.message === "Task not found" ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

// Récupérer toutes les tâches
const getAllTasksController = async (req, res) => {
  try {
    // Appeler la fonction getAllTasks du modèle
    const tasks = await getAllTasks();

    // Répondre avec un statut 200 (OK) et la liste des tâches
    res.status(200).json({
      success: true,
      data: tasks,
      message: "Tasks retrieved successfully",
    });
  } catch (error) {
    // Gérer les erreurs
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Récupérer les tâches d'un utilisateur spécifique
const getTasksByUserController = async (req, res) => {
  try {
    // Récupérer l'ID utilisateur depuis l'utilisateur authentifié
    const userId = req.user;
    if (!userId) {
      throw new Error("User authentication required");
    }

    // Appeler la fonction getTasksByUser du modèle
    const tasks = await getTasksByUser(userId);

    // Répondre avec un statut 200 (OK) et la liste des tâches
    res.status(200).json({
      success: true,
      data: tasks,
      message: "User tasks retrieved successfully",
    });
  } catch (error) {
    // Gérer les erreurs
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};
// ✅ Contrôleur de mise à jour de tâche
const updateTaskController = async (req, res) => {
  try {
    const taskId = req.params.id;
    const updatedData = req.body;
    const result = await updateTask(taskId, updatedData);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.status(200).json({
      success: true,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Erreur serveur",
    });
  }
};

// ✅ Contrôleur de suppression
const deleteTaskController = async (req, res) => {
  try {
    const taskId = req.params.id;

    const result = await deleteTask(taskId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Erreur serveur",
    });
  }
};


module.exports = { deleteTaskController,updateTaskController,createTaskController,getTaskByIdController,getAllTasksController,
  getTasksByUserController
};


