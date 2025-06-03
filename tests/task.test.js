// === Mock du fichier serviceAccountKey.json ===
jest.mock('../src/config/serviceAccountKey.json', () => ({
  type: "service_account",
  project_id: "your-project-id",
  private_key_id: "some-key-id",
  private_key: "-----BEGIN PRIVATE KEY-----\nSomePrivateKey\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk@your-project-id.iam.gserviceaccount.com",
  client_id: "client-id",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "your-cert-url"
}));

jest.mock('firebase-admin', () => {
  const originalModule = jest.requireActual('firebase-admin');
  return {
    ...originalModule,
    auth: jest.fn(() => ({
      verifyIdToken: jest.fn().mockResolvedValue({ uid: 'test-uid' }),
    })),
    credential: {
      cert: jest.fn(),
    },
    initializeApp: jest.fn(),
  };
});

// === Imports ===
const request = require("supertest");
const express = require("express");
const app = express();
const {
  createTaskController,
  getTaskByIdController
} = require("../src/controllers/taskController");

// === Mock du modèle TaskModel ===
jest.mock("../src/model/TaskModel", () => ({
  createTask: jest.fn().mockResolvedValue({
    id: "123456",
    title: "Test Task",
    description: "Ceci est une tâche de test",
    priority: "high",
    dueDate: "2025-06-10T00:00:00Z",
    status: "active",
    completed: false,
    user: "user123",
    projectId:"54dsdqsdqdqsd6"
  }),
  getTaskById: jest.fn((id) => {
    if (id === "invalidID") {
      return Promise.reject(new Error("Task not found"));
    }
    return Promise.resolve({
      id,
      title: "Mocked Task",
      description: "Description mockée",
      user: "user123"
    });
  }),
}));

// === Configuration express ===
app.use(express.json());

// Simuler l’authentification
app.use((req, res, next) => {
  req.user = { uid: "user123" }; // simule un utilisateur connecté
  next();
});

// Routes testées
app.post("/api/task/create_task", createTaskController);
app.get("/api/task/:uid", getTaskByIdController);

// === Tests ===
describe("POST /tasks", () => {
  it("doit créer une tâche avec succès", async () => {
    const response = await request(app)
      .post("/api/task/create_task")
      .send({
        title: "Test Task",
        description: "Ceci est une tâche de test",
        priority: "high",
        dueDate: "2025-06-10",
        status: "active",
        completed: "false",
        files: [],
        projectId:"ssqs444qsqs"

      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("success", true);
    expect(response.body.data).toHaveProperty("title", "Test Task");
    expect(response.body.message).toBe("Task created successfully");
  });

  it("doit renvoyer une erreur si le titre est manquant", async () => {
    const response = await request(app)
      .post("/api/task/create_task")
      .send({
        description: "Sans titre",
        completed: "false",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("success", false);
    expect(response.body).toHaveProperty("error");
  });
});

describe("GET /api/task/:uid", () => {
  it("doit récupérer une tâche par son ID", async () => {
    const response = await request(app).get("/api/task/puRR3zJBXnfTa7SOdafR");  // ID simulé
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty("title");
  });

  it("doit renvoyer une erreur si la tâche n'existe pas", async () => {
    const response = await request(app).get("/api/task/invalidID");  // ID invalide
    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Task not found");
  });
});
