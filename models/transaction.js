//
var mongoose = require('mongoose');

//use native promises for mongoose
mongoose.Promise = global.Promise;
//assert.equal(query.exec().constructor, global.Promise);

//Table schema
var transactionSchema = mongoose.Schema({
  to: {
    type: String
  },
  from: {
    type: String
  },
  item: {
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

//On save operations, set the update_at and created_at fields
transactionSchema.pre('save', function(next) {
  var currentDate = new Date();
  this.updated_at = currentDate;
  if (!this.created_at) {
    this.created_at = currentDate;
  }
  next();
});

//Create mongoose model
var Transaction = mongoose.model('Transaction', transactionSchema);

/**
 * Create or insert a row depending whether it exists
 * @param  {object} entry Document to insert or modify
 * @return {Promise}
 */
Transaction.upsert = function(entry) {
  return new Promise((resolve, reject) => {
    if (entry.id == '') {
      delete entry.id;
      let newRow = new Transaction(entry);
      newRow.save()
        .then(resolve)
        .catch((err) => reject(err));
    } else {
      let query = { '_id': entry.id };
      var result = Transaction.findOneAndUpdate(query, entry, { upsert: true })
        .then(resolve)
        .catch((err) => reject(err));
    }
  });
};

/**
 * Delete the supplied transaction id
 * @param  {string} id ID to remove
 * @return {Promise}
 */
Transaction.delete = function(id) {
  return new Promise((resolve, reject) => {
    let query = { '_id': id };
    var result = Transaction.find({ '_id': id }).remove().exec()
      .then(resolve)
      .catch((err) => reject(err));
  });
}

/**
 * Get all documents from transaction database
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
Transaction.getAll = function(callback) {
  Transaction.find({}, function(err, data) {
    if (err) throw err;
    callback(data);
  });
};

//Validation functions
function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

module.exports = Transaction;
