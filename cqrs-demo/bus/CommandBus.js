class CommandBus {
  constructor() {
    this.handlers = new Map();
  }

  register(commandClass, handler) {
    this.handlers.set(commandClass.name, handler);
  }

  async dispatch(command) {
    const handler = this.handlers.get(command.constructor.name);
    if (!handler) {
      throw new Error(`No handler registered for command: ${command.constructor.name}`);
    }
    return await handler.handle(command);
  }
}

module.exports = new CommandBus();