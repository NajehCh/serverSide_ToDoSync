const { auth } = require('../config/firebase-config');

class Middleware {
  async decodeToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token manquant ou invalide' });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decodedToken = await auth.verifyIdToken(token); 
      req.user = decodedToken;
      next();
    } catch (error) {
      console.error('Erreur de vérification du token :', error);
      res.status(401).json({ message: 'Token invalide ou expiré' });
    }
  }
}

module.exports = new Middleware();
