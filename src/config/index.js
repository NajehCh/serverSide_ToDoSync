const express= require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const userRoutes = require('../routes/userRoutes')
const taskRoutes = require('../routes/taskRoutes')
const projectRoutes = require('../routes/projectRoutes')
const app = express();
const cors = require("cors");

app.use(cors({
  origin: "http://3.224.198.125:3000", // Autoriser les requêtes venant du client
  credentials: true, // Autoriser les cookies et les headers d'authentification
}));

// app.use(cors({
//   origin: "http://localhost:3000", // Autoriser les requêtes venant du client
//   credentials: true, // Autoriser les cookies et les headers d'authentification
// }));




require('dotenv').config();
//app.use(bodyParser.json());
app.use(express.json()); 
app.use(cookieParser());
app.use(express.urlencoded({extended:true}));
const port = process.env.PORT || 5000; 


app.use("/api/auth", userRoutes);
app.use("/api/task", taskRoutes);
app.use("/api/projects",projectRoutes)




//app.listen(port ,()=>{
//    console.log(`server is running on port ${port}`)
//})

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;


