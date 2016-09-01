var express = require('express');
var router = express.Router();
var Transaction = require('../models/transaction.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  //Fetch all data and render page
  Transaction.getAll(function(data) {
    res.render('index', {
      'data': data,
      'users': ['A', 'R', 'H']
    });
  });
});

/* Save or update data */
router.post('/', function(req, res) {
  //Fetch post variables
  var data = {};
  ['id', 'to', 'from', 'item', 'amount'].forEach((val) => {
      data[val] = req.body[val];
      data[val].shift(); //discard first entry (template row)
  });

  // create an array of 'upsert' promises
  var requests = data.id.map((val, i) => {
    return Transaction.upsert({
        id: val,
        to: data.to[i],
        from: data.from[i],
        item: data.item[i],
        amount: data.amount[i]
    });
  });

  // append the delete promises
  var deletes = req.body['delete'];
  if (deletes !== undefined) {
    deletes.forEach((id) => {
      requests.push(Transaction.delete(id));
      return true;
    });
  }

  //Execute all updates/inserts, then render the page
  Promise.all(requests)
    .then(() => {
      Transaction.getAll((data) => {
        res.render('index', {
          'data': data,
          'users': ['A', 'R', 'H']
        });
      });
    })
    .catch((err) => {
      Transaction.getAll((data) => {
        res.render('index', {
          'data': data,
          'users': ['A', 'R', 'H'],
          'error': err
        });
      });
    });
});

module.exports = router;
