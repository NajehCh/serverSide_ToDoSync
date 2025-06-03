const admin = require("firebase-admin");
const { auth } = require("../config/firebase-config");
const db = admin.firestore();
const ProjectsCollection = db.collection("projects");
const tasksCollection = db.collection("tasks");


const createProjectModel = async (projectData) => {
  try {
    if (!projectData.user) throw new Error("User reference is required");

    const trimmedTitle = projectData.title.trim();
    if (!trimmedTitle) throw new Error("Title cannot be empty after trimming");

    const querySnapshot = await db
      .collection("projects")
      .where("title", "==", trimmedTitle)
      .get();

    if (!querySnapshot.empty) {
      throw new Error("Impossible: A project with this title already exists");
    }

    // Structure de la tâche
    const project = {
      title: trimmedTitle,
      description: projectData.description || "No description",
      dueDate: projectData.dueDate || admin.firestore.Timestamp.now(),
      user: projectData.user,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    };

    await db.collection("projects").add(project);
    console.log("Project created successfully");
  } catch (error) {
    console.error("Error creating Project:", error);
    throw error;
  }
};

// Récupérer une tâche par son ID
const getProjectByIdModel = async (projectId) => {
  try {

    if (!projectId) {
      throw new Error("Project ID is required");
    }

    const doc = await ProjectsCollection.doc(projectId).get();

    if (!doc.exists) {
      throw new Error("project not found");
    }

    return { _id: doc.id, ...doc.data() };
  } catch (error) {
    console.error("Error getting project by ID: ", error.message);
    throw error;
  }
};

// Récupérer toutes les Projets
const getAllProjectModel = async () => {
  try {
    const querySnapshot = await ProjectsCollection.get();
    const projects = [];

    querySnapshot.forEach((doc) => {
      projects.push({ _id: doc.id, ...doc.data() });
    });

    return projects;
  } catch (error) {
    console.error("Error getting all tasks: ", error.message);
    throw error;
  }
};

// Récupérer les tâches d'un utilisateur spécifique
const getProjectsByUserModel = async (userId) => {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const querySnapshot = await ProjectsCollection
      .where("user", "==", userId.user_id)
      .get();

    const proejcts = [];

    querySnapshot.forEach((doc) => {
      proejcts.push({ _id: doc.id, ...doc.data() });
    });

    return proejcts;
  } catch (error) {
    console.error("Error getting projects by user: ", error.message);
    throw error;
  }
};

// Fonction pour mettre à jour un proejt
const updateProjectodel = async (projectId, updatedData) => {
  try {
    const projectRef = ProjectsCollection.doc(projectId);
    const doc = await projectRef.get();

    if (!doc.exists) {
      console.log("Projet non trouvée");
      return { success: false, message: "Projet non trouvée" };
    }

    await projectRef.update(updatedData);

    // 🔁 Re-récupérer la projet mise à jour
    const updatedDoc = await projectRef.get();
    const updatedProject = { _id: updatedDoc.id, ...updatedDoc.data() };

    return { success: true, data: updatedProject, message: "Projet mise à jour avec succès" };
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la projet :", error);
    return { success: false, message: "Erreur serveur" };
  }
};

// Supprimer une proejct par ID
const deleteProjectModel = async (projectId) => {
  try {
    const projectRef = ProjectsCollection.doc(projectId);
    const doc = await projectRef.get();

    if (!doc.exists) {
      return { success: false, message: "Projet non trouvée" };
    }

    await projectRef.delete();
    return { success: true, message: "Projet supprimée avec succès" };
  } catch (error) {
    console.error("Erreur lors de la suppression de la Projet :", error);
    return { success: false, message: "Erreur serveur" };
  }
};

const getTasksByProjectModel = async (projectId) => {
  try {
    if (!projectId) throw new Error("Project ID is required");

    const querySnapshot = await tasksCollection
      .where("projectId", "==", projectId)
      .get();

    const tasks = [];

    querySnapshot.forEach((doc) => {
      tasks.push({ _id: doc.id, ...doc.data() });
    });

    return tasks;
  } catch (error) {
    console.error("Error getting tasks by project:", error.message);
    throw error;
  }
};

module.exports = { getTasksByProjectModel,createProjectModel,getProjectByIdModel,updateProjectodel,getAllProjectModel,deleteProjectModel,getProjectsByUserModel };