// Load mongoose and configure native ES6 promises
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

// Debt schema
var debtSchema = mongoose.Schema({
  to: String,
  from: String,
  item: String,
  amount: Number,
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// User schema
var userSchema = mongoose.Schema({
  user: String
});

//On save operations, set the update_at and created_at fields
debtSchema.pre('save', (next) => {
  var currentDate = new Date();
  this.updated_at = currentDate;
  if (!this.created_at) this.created_at = currentDate;
  next();
});

//Create transaction and user models
var Debt = mongoose.model('Transaction', debtSchema);
var User = mongoose.model('User', userSchema);

/**
 * Create or insert a row depending whether it exists
 * @param  {object} entry Document to insert or modify
 * @return {Promise}
 */
Debt.upsert = function(entry) {
  return new Promise((resolve, reject) => {
    if (entry.id == '') {
      delete entry.id;
      let newRow = new Debt(entry);
      newRow.save()
        .then(resolve)
        .catch((err) => reject(err));
    } else {
      let query = { '_id': entry.id };
      var result = this.findOneAndUpdate(query, entry, { upsert: true })
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
Debt.delete = function(id) {
  return new Promise((resolve, reject) => {
    let query = { '_id': id };
    var result = this.find({ '_id': id }).remove().exec()
      .then(resolve)
      .catch((err) => reject(err));
  });
}

/**
 * Return a log of all debts, as well as a list of the transfers
 * required to resolve them.
 * @return {object}
 */
Debt.getAll = function() {
  return new Promise((resolve, reject) => {
    this.find({})
      .then((data) => {
        console.log(data);
        resolve({
          'users': ['A', 'R', 'H'],
          'debts': data,
          'solution': this.simplify(data)
        });
      })
      .catch((err) => reject(err))
  });
}

/**
 * Algorithm to resolve all debts in N-1 transactions
 * @return {object}
 */
Debt.simplify = function(data) {
  // define user array
  let users = {
    'H': 0,
    'R': 0,
    'A': 0
  }

  // determine everyones total balance
  let arr = data.reduce((acc, val) => {
    let to = val.to;
    let from = val.from;
    acc[to] += val.amount;
    acc[from] -= val.amount;
    return acc;
  }, users);

  // convert to an array
  // [['A', -12.5], ['B', 7.5], ['C', '9']]
  var debts = [];
  for (var i in arr) {
    debts.push([i, arr[i]]);
  }

  // sort in ascending order
  debts.sort(compare);

  // create a list of transations to resolve
  var transactions = [];
  while (debts.length > 0) {
    // resolve the largest debt by transferring value to largest creditor
    let end = debts.length-1;
    debts[end][1] += debts[0][1];
    debts[end][1] = twoDp(debts[end][1]); // round to 2 D.P

    // record transaction (if > 0)
    if (Math.abs(debts[0][1]) > 0) {
      transactions.push([
        debts[0][0], // from
        debts[end][0], // to
        (debts[0][1]*-1.0).toFixed(2) // amount
      ]);
    }

    // remove creditor if balance is zero
    if (debts[end][1] == 0) debts.splice(end, 1);

    // remove debtor and re-sort
    debts.splice(0, 1);
    debts.sort(compare);
  }

  return transactions;
}


/* HELPER FUNCTIONS */

// function to sort nested array in ascending order
function compare(a, b) {
  return a[1]-b[1];
}

// function to round to 2 decimal places
function twoDp(num) {
  return Math.round((num + 0.00001) * 100) / 100;
}

// validation functions
function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

module.exports = Debt;
