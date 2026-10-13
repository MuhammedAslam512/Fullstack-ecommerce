class CreateOrderCommand {
  constructor({ customerName, items, totalAmount }) {
    this.customerName = customerName;
    this.items = items;
    this.totalAmount = totalAmount;
  }
}

module.exports = CreateOrderCommand;