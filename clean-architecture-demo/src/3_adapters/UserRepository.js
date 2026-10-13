// ─────────────────────────────────────────────────────────────
// LAYER 3: REPOSITORY ADAPTER (DATABASE ADAPTER)
// Can be swapped from In-Memory -> MongoDB -> PostgreSQL without touching Use Cases!
// ─────────────────────────────────────────────────────────────

class InMemoryUserRepository {
  constructor() {
    this.users = []; // In-memory database store
  }

  async findByEmail(email) {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async save(userEntity) {
    const userRecord = {
      id: String(this.users.length + 1),
      name: userEntity.name,
      email: userEntity.email,
      password: userEntity.password,
      role: userEntity.role,
      createdAt: new Date().toISOString()
    };
    this.users.push(userRecord);
    return userRecord;
  }

  async findAll() {
    return this.users;
  }
}

module.exports = InMemoryUserRepository;