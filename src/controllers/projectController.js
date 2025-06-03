const { auth } = require("../config/firebase-config");
const admin = require('../config/firebase-config')

const { createProjectModel, getTasksByProjectModel,updateProjectodel,getProjectByIdModel,getProjectsByUserModel,deleteProjectModel,getAllProjectModel} = require("../model/projectModel");

// Inscription
const createProjectController = async (req, res) => {
  const {title, description,dueDate}=req.body

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
    const projectData ={ 
      title,
      description,
      dueDate,
      user:uid,
    };
    // Appeler la fonction createTask du modèle
    const newProject = await createProjectModel(projectData);    

    // Répondre avec un statut 201 (Created) et la tâche créée
    res.status(201).json({
        success: true,
        data: newProject,
        message: "Project created successfully",
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
const getProjectByIdController = async (req, res) => {
  try {
    // Récupérer l'ID de la tâche depuis les paramètres de l'URL
    const { uid } = req.params;

    
    // Appeler la fonction getTaskById du modèle
    const project = await getProjectByIdModel(uid);

    // Vérifier que l'utilisateur a le droit d'accéder à cette tâche
    if (req.user && req.user.uid && project.user !== req.user.uid) {
      throw new Error("Unauthorized access to this task");
    }

    // Répondre avec un statut 200 (OK) et la tâche
    res.status(200).json({
      success: true,
      data: project,
      message: "project retrieved successfully",
    });
  } catch (error) {
    const statusCode = error.message === "Project not found" ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

// Récupérer toutes les tâches
const getAllProjectsController = async (req, res) => {
  try {
    const proejcts = await getAllProjectModel();
    res.status(200).json({
      success: true,
      data: proejcts,
      message: "Projects retrieved successfully",
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
const getProjectsByUserController = async (req, res) => {
  try {
    // Récupérer l'ID utilisateur depuis l'utilisateur authentifié
    const userId = req.user;
    if (!userId) {
      throw new Error("User authentication required");
    }

    // Appeler la fonction getTasksByUser du modèle
    const projects = await getProjectsByUserModel(userId);

    // Répondre avec un statut 200 (OK) et la liste des tâches
    res.status(200).json({
      success: true,
      data: projects,
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
const updateProjectController = async (req, res) => {
  try {
    const projectId = req.params.id;
    const updatedData = req.body;
    const result = await updateProjectodel(projectId, updatedData);

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

// Contrôleur de suppression
const deleteProjectController = async (req, res) => {
  try {
    const projectId = req.params.id;
    console.log(projectId)
    const result = await deleteProjectModel(projectId);

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

const getTasksByProjectController = async (req, res) => {
  try {
    const projectId = req.params.projectId;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: "Project ID is required",
      });
    }

    const tasks = await getTasksByProjectModel(projectId);

    res.status(200).json({
      success: true,
      data: tasks,
      message: "Tasks retrieved successfully for this project",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = { getTasksByProjectController,getProjectsByUserController,getProjectByIdController,createProjectController,getAllProjectsController,updateProjectController,deleteProjectController};


