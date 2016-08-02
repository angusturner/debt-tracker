//
var mongoose = require('mongoose');

//Table schema
var transactionSchema = mongoose.Schema({
  to: {
    type: String
  },
  from: {
    type: String
  },
  amount: {
    type: Number
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

//On save update the update_at field, and created_at field if it isn't set
transactionSchema.pre('save', function(next) {
  var currentDate = new Date();
  this.updated_at = currentDate;
  if (!this.created_at) {
    this.created_at = currentDate;
  }
  next();
});

//Create model with the schema
var Transaction = mongoose.model('Transaction', transactionSchema);

//Add a createTransaction method
Transaction.createTransaction = function(newTransaction, callback) {
  //
};

//Add a fetch transaction method
Transaction.getAll = function(callback) {
  console.log('test');
};

module.exports = Transaction;
