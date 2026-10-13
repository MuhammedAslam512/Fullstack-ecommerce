// ─────────────────────────────────────────────────────────────
// LAYER 3: CONTROLLER ADAPTER (HTTP ADAPTER)
// Converts Express (req, res) to Use Case input
// ─────────────────────────────────────────────────────────────

class UserController {
  constructor(registerUserUseCase) {
    this.registerUserUseCase = registerUserUseCase;
  }

  async register(req, res) {
    try {
      const { name, email, password, role } = req.body;

      // Execute clean Use Case
      const result = await this.registerUserUseCase.execute({ name, email, password, role });

      res.status(201).json({
        success: true,
        message: '✅ User registered via Clean Architecture!',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = UserController;