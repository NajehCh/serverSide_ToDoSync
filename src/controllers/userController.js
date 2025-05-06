const { auth } = require("../config/firebase-config");
const admin = require('../config/firebase-config')
const { getAuth } = require("firebase-admin/auth");

const { createUserInDB,getUser,loginUser,updateProfileName, loginUserF,changePassword } = require("../model/userModel");

// Inscription
const signup = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const userRecord = await auth.createUser({ email, password, name });
    await createUserInDB(userRecord.uid, email, name,password);

    res.status(201).json({
      message: "Utilisateur créé avec succès",
      user: userRecord,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/*********************************************** */
/*********************************************** */
const signin = async (req, res) => {
  console.log("Connexion demandée");

  const { email, password } = req.body;

  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password); // Authentifier avec le client SDK
    console.log("Utilisateur connecté:", userCredential.user);
    res.status(200).json({ message: "Utilisateur connecté avec succès", user: userCredential.user });
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    res.status(400).json({ message: error.message });
  }
};

/********************************************** */
/********************************************** */
const getUserController = async (req,res)=>{
  const uid=req.params.uid;
  try {
    if (!uid) {
      return res.status(400).json({ error: "L'UID est requis pour récupérer un utilisateur" });
  }
    const user = await getUser(uid);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
  }

  return res.status(200).json({ ...user, _id: uid });
} catch (error) {
  console.error('Erreur lors de la récupération de l\'utilisateur:', error);
  return res.status(500).json({ error: "Erreur serveur lors de la récupération de l'utilisateur" });
}
}


/****************************************************** */
/****************************************************** */

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email et mot de passe requis" });
    }

    const response = await loginUserF(email, password);
    console.log('response login : ',response)
    if (!response.success) {
        return res.status(401).json({ error: response.message });
    }
    res.status(200).json({ message: response.message, user: response.user,token:response.token });
} catch (error) {
    console.error("Erreur lors de la connexion:", error);
    res.status(500).json({ error: "Erreur serveur" });
}
};


/*************************************************** */
/*************************************************** */

const userLoginStatus = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token manquant ou invalide' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: "Not authorized, please login!" });
  }

  try {
    const decodedValue = await getAuth().verifyIdToken(token);

    if (decodedValue) {
      return res.status(200).json(true);
    } else {
      return res.status(401).json(false);
    }

  } catch (error) {
    console.error("Erreur de vérification du token :", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const changePasswordController = async (req, res) => {
  const {oldPassword, newPassword } = req.body;
  const uid  = req.user.uid
  // Vérifie si les champs requis sont présents
  if (!uid || !oldPassword || !newPassword) {
    return res.status(400).json({ message: "UID, ancien mot de passe et nouveau mot de passe sont requis" });
  }

  try {
    // Appelle la fonction pour changer le mot de passe
    const result = await changePassword(uid, oldPassword, newPassword);

    // Si la réponse indique un échec
    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    // Si le changement de mot de passe réussit
    return res.status(200).json({ message: result.message });
  } catch (error) {
    console.error("Erreur dans le controller de changement de mot de passe :", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};


const updateProfileNameController = async (req, res) => {
  const { newName } = req.body;
  const uid = req.user?.uid;

  if (!uid || !newName) {
    return res.status(400).json({ message: "UID et nouveau nom requis" });
  }

  try {
    const result = await updateProfileName(uid, newName);
    
    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    return res.status(200).json({ 
      message: result.message, 
      user: result.user 
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du nom :", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

module.exports = {
   signup,signin,
   getUserController,
   changePasswordController,
   loginController,
   userLoginStatus,updateProfileNameController
  };


