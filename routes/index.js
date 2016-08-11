var express = require('express');
var router = express.Router();
var Transaction = require('../models/transaction.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  //Fetch all data and render page
  Transaction.getAll(function(data) {
    res.render('index', { 'data': data, 'users': ['angus', 'rhys', 'henry'] });
  });

  //Add a random account
  /*var spoof = {
    to: 'henry',
    from: 'angus',
    amount: 100
  };

  var newRow = new Transaction(spoof);
  newRow.save();*/
});

/* Save or update data */
router.post('/', function(req, res) {
  //Fetch post variables
  var id = req.body.id;
  var creditor = req.body.to;
  var debtor = req.body.from;
  var amount = req.body.amount;

  //Retrieve an array of 'upsert' promises
  var requests = id.map((val, i) => {
    return Transaction.upsert({
        id: val,
        to: creditor[i],
        from: debtor[i],
        amount: amount[i]
    });
  });

  //Execute all updates/inserts, then render the page
  Promise.all(requests)
    .then(() => {
      Transaction.getAll((data) => {
        res.render('index', {
          'data': data,
          'users': ['angus', 'rhys', 'henry']
        });
      });
    })
    .catch((err) => {
      Transaction.getAll((data) => {
        res.render('index', {
          'data': data,
          'users': ['angus', 'rhys', 'henry'],
          'error': err
        });
      });
    });
});

module.exports = router;
