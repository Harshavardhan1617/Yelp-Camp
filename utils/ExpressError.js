class ExpressError extends Error {
  constructor(messege, statusCode) {
    super();
    this.messege = messege;
    this.statusCode = statusCode;
  }
}

module.exports = ExpressError;
