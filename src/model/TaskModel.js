const admin = require("firebase-admin");
const { auth } = require("../config/firebase-config");
const db = admin.firestore();
const tasksCollection = db.collection("tasks");


// const createTask = async (taskData) => {
//   try {
//     // Validation des champs obligatoires
//     if (!taskData.title) {
//       throw new Error("Please provide a title");
//     }
//     if (!taskData.user) {
//       throw new Error("User reference is required");
//     }

//     // Supprimer les espaces au début et à la fin du titre
//     const trimmedTitle = taskData.title.trim();
//     if (!trimmedTitle) {
//       throw new Error("Title cannot be empty after trimming");
//     }

//     // Vérifier si une tâche avec le même titre existe déjà
//     const querySnapshot = await db
//       .collection("tasks")
//       .where("title", "==", trimmedTitle)
//       .get();

//     if (!querySnapshot.empty) {
//       throw new Error("Impossible: A task with this title already exists");
//     }

//     // Structure de la tâche
//     const task = {
//       title: trimmedTitle, // Utiliser le titre sans espaces
//       description: taskData.description || "No description",
//       dueDate: taskData.dueDate || admin.firestore.Timestamp.now(), // Timestamp Firestore
//       status: taskData.status || "active",
//       completed: taskData.completed || false,
//       priority: taskData.priority || "low",
//       user: taskData.user, // Peut être un UID ou une référence Firestore
//       createdAt: admin.firestore.Timestamp.now(), // Timestamp côté serveur
//       updatedAt: admin.firestore.Timestamp.now(), // Timestamp côté serveur
//     };

//     // Ajout de la tâche dans la collection "tasks"
//     const docRef = await db.collection("tasks").add(task);
//     console.log("Task created with ID: ", docRef.id);
//     return { id: docRef.id, ...task };
//   } catch (error) {
//     console.error("Error creating task: ", error.message);
//     throw error;
//   }
// };
const createTask = async (taskData, files = []) => {
  try {
    if (!taskData.user) throw new Error("User reference is required");

    const trimmedTitle = taskData.title.trim();
    if (!trimmedTitle) throw new Error("Title cannot be empty after trimming");

    const querySnapshot = await db
      .collection("tasks")
      .where("title", "==", trimmedTitle)
      .get();

    if (!querySnapshot.empty) {
      throw new Error("Impossible: A task with this title already exists");
    }
    let  completed = taskData.isCompleted

    // ⬇️ Upload des fichiers
    const fileUrls = [];

    for (const file of files) {
      const storageRef = admin.storage().bucket().file(`tasks/${Date.now()}_${file.name}`);
      await storageRef.save(file.buffer, {
        metadata: { contentType: file.mimetype },
      });
      const [url] = await storageRef.getSignedUrl({
        action: 'read',
        expires: '03-01-2500',
      });
      fileUrls.push(url);
    }

    // 🔧 Structure de la tâche
    const task = {
      title: trimmedTitle,
      description: taskData.description || "No description",
      dueDate: taskData.dueDate || admin.firestore.Timestamp.now(),
      status: taskData.status || "active",
      completed: completed || false,
      priority: taskData.priority || "low",
      user: taskData.user,
      files: fileUrls, // Ajout des URLs
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    };

    await db.collection("tasks").add(task);
    console.log("Task created successfully");
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
};

// Récupérer une tâche par son ID
const getTaskById = async (taskId) => {
  try {
    if (!taskId) {
      throw new Error("Task ID is required");
    }

    const doc = await tasksCollection.doc(taskId).get();

    if (!doc.exists) {
      throw new Error("Task not found");
    }

    return { _id: doc.id, ...doc.data() };
  } catch (error) {
    console.error("Error getting task by ID: ", error.message);
    throw error;
  }
};

// Récupérer toutes les tâches
const getAllTasks = async () => {
  try {
    const querySnapshot = await tasksCollection.get();
    const tasks = [];

    querySnapshot.forEach((doc) => {
      tasks.push({ _id: doc.id, ...doc.data() });
    });

    return tasks;
  } catch (error) {
    console.error("Error getting all tasks: ", error.message);
    throw error;
  }
};

// Récupérer les tâches d'un utilisateur spécifique
const getTasksByUser = async (userId) => {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const querySnapshot = await tasksCollection
      .where("user", "==", userId.user_id)
      .get();

    const tasks = [];

    querySnapshot.forEach((doc) => {
      tasks.push({ _id: doc.id, ...doc.data() });
    });

    return tasks;
  } catch (error) {
    console.error("Error getting tasks by user: ", error.message);
    throw error;
  }
};

// ✅ Fonction pour mettre à jour une tâche
const updateTask = async (taskId, updatedData) => {
  try {
    const taskRef = tasksCollection.doc(taskId);
    const doc = await taskRef.get();

    if (!doc.exists) {
      console.log("Tâche non trouvée");
      return { success: false, message: "Tâche non trouvée" };
    }

    await taskRef.update(updatedData);

    // 🔁 Re-récupérer la tâche mise à jour
    const updatedDoc = await taskRef.get();
    const updatedTask = { _id: updatedDoc.id, ...updatedDoc.data() };

    return { success: true, data: updatedTask, message: "Tâche mise à jour avec succès" };
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la tâche :", error);
    return { success: false, message: "Erreur serveur" };
  }
};

// ✅ Supprimer une tâche par ID
const deleteTask = async (taskId) => {
  try {
    const taskRef = tasksCollection.doc(taskId);
    const doc = await taskRef.get();

    if (!doc.exists) {
      return { success: false, message: "Tâche non trouvée" };
    }

    await taskRef.delete();
    return { success: true, message: "Tâche supprimée avec succès" };
  } catch (error) {
    console.error("Erreur lors de la suppression de la tâche :", error);
    return { success: false, message: "Erreur serveur" };
  }
};
module.exports = { deleteTask, createTask,getTaskById,updateTask ,getAllTasks,getTasksByUser };