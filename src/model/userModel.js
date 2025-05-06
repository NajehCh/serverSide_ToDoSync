const admin = require("firebase-admin");
const { auth } = require("../config/firebase-config");
const db = admin.firestore();
const usersCollection = db.collection("users");

const { signInWithEmailAndPassword } = require('firebase/auth');

// ✅ Fonction pour créer un utilisateur dans Firestore
const createUserInDB = async (uid, email, name,password) => {
  try {
    await usersCollection.doc(uid).set({uid, email, name ,password});
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'utilisateur :", error);
    throw new Error("Erreur lors de l'enregistrement de l'utilisateur");
  }
};

// ✅ Fonction pour récupérer un utilisateur
const getUser = async (uid) => {
  try {
    const userRef = usersCollection.doc(uid);
    const doc = await userRef.get();

    if (!doc.exists) {
      console.log('Aucun utilisateur trouvé avec cet UID');
      return null;
    }

    return doc.data();
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    throw new Error("Erreur lors de la récupération de l'utilisateur");
  }
};

// ⚠️ Authentification simplifiée - à éviter en prod
const loginUser = async (email, password) => {
  try {
    if (!email || !password) {
      throw new Error("Email et mot de passe sont requis");
    }

    const snapshot = await usersCollection.where("email", "==", email).get();

    if (snapshot.empty) {
      return { success: false, message: "Utilisateur non trouvé" };
    }

    let userData = null;
    snapshot.forEach(doc => {
      userData = doc.data();
    });

    if (userData.password !== password) {
      return { success: false, message: "Mot de passe incorrect" };
    }

    return { success: true, message: "Connexion réussie", user: userData };
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    return { success: false, message: "Erreur serveur" };
  }
};

// Authentification avec Firebase Admin
const loginUserF = async (email, password) => {
  try {
    if (!email || !password) {
      throw new Error("Email et mot de passe sont requis");
    }

    const userRecord = await auth.getUserByEmail(email);
    const idToken = await auth.createCustomToken(userRecord.uid);

    return { 
      success: true, 
      message: "Connexion réussie", 
      user: userRecord, 
      token: idToken 
    };
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    return { success: false, message: error.message };
  }
};

// Fonction pour changer le mot de passe avec vérification de l'ancien mot de passe
const changePassword = async (uid, oldPassword, newPassword) => {
  try {
    // 1. Récupère l'utilisateur depuis Firestore
    const userSnapshot = await usersCollection.doc(uid).get();

    if (!userSnapshot.exists) {
      throw new Error("Utilisateur non trouvé");
    }

    const user = userSnapshot.data();

    // 2. Vérifie si le mot de passe actuel correspond à celui stocké
    if (user.password !== oldPassword) {
      return { success: false, message: "Mot de passe actuel incorrect" };
    }

    // 3. Met à jour le mot de passe dans Firebase Auth
    await auth.updateUser(uid, { password: newPassword });

    // 4. Met à jour le mot de passe dans Firestore
    await usersCollection.doc(uid).update({ password: newPassword });

    return { success: true, message: "Mot de passe changé avec succès" };
  } catch (error) {
    console.error("Erreur lors du changement de mot de passe :", error);
    return { success: false, message: error.message };
  }
};

// Fonction pour mettre à jour le nom d'utilisateur
const updateProfileName = async (uid, newName) => {
  try {
    // Mise à jour dans Firebase Auth
    const updatedUser = await auth.updateUser(uid, { displayName: newName });

    // Mise à jour dans Firestore
    await usersCollection.doc(uid).update({ name: newName });

    // Récupérer les données mises à jour de Firestore
    const updatedDoc = await usersCollection.doc(uid).get();
    const updatedUserData = updatedDoc.data();

    return { 
      success: true, 
      message: "Nom mis à jour avec succès", 
      user: updatedUserData 
    };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du nom :", error);
    return { success: false, message: error.message };
  }
};
// ✅ Exportation
module.exports = { updateProfileName,createUserInDB,changePassword, getUser, loginUser, loginUserF };
