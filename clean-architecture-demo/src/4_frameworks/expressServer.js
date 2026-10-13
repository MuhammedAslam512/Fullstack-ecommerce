// ─────────────────────────────────────────────────────────────
// LAYER 4: FRAMEWORKS & DRIVERS (EXPRESS SERVER)
// Injects dependencies from outside -> inside!
// ─────────────────────────────────────────────────────────────
const express = require('express');
const bcrypt = require('bcryptjs');

// Import Layers
const InMemoryUserRepository = require('../3_adapters/UserRepository');
const RegisterUserUseCase = require('../2_use_cases/RegisterUserUseCase');
const UserController = require('../3_adapters/UserController');

const app = express();
app.use(express.json());

// ── DEPENDENCY INJECTION CONTAINER (WIRING THE LAYERS) ──
const userRepository = new InMemoryUserRepository(); // Database Adapter
const passwordHasher = {
  hash: (password) => bcrypt.hash(password, 10)
};

// Inject Repository & Hasher into Use Case
const registerUserUseCase = new RegisterUserUseCase({
  userRepository,
  passwordHasher
});

// Inject Use Case into Controller
const userController = new UserController(registerUserUseCase);

// ── EXPRESS ROUTES ──
app.post('/api/clean/register', (req, res) => userController.register(req, res));

app.get('/api/clean/users', async (req, res) => {
  const users = await userRepository.findAll();
  res.json({ success: true, count: users.length, data: users });
});

const PORT = 5003;
app.listen(PORT, () => {
  console.log(`🏛️ Clean Architecture Server running on http://localhost:${PORT}`);
});