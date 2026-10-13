class QueryBus {
  constructor() {
    this.handlers = new Map();
  }

  register(queryClass, handler) {
    this.handlers.set(queryClass.name, handler);
  }

  async execute(query) {
    const handler = this.handlers.get(query.constructor.name);
    if (!handler) {
      throw new Error(`No handler registered for query: ${query.constructor.name}`);
    }
    return await handler.handle(query);
  }
}

module.exports = new QueryBus();