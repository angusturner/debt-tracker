var express = require('express');
var router = express.Router();
var Transaction = require('../models/transaction.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  //Fetch all the transactions
  Transaction.find({}, function(err, data) {
    if (err) throw err;
    res.render('index', { 'data': data });
  });
});

/* Save or update data */
router.post('/', function(req, res) {
  console.log(req.body);

  //Fetch post variables
  var id = req.body.id;
  var creditor = req.body.to;
  var debtor = req.body.from;
  var amount = req.body.amount;

  //Iterate through the post data
  id.map(function(val, i){
    //Create entry
    var entry = {
      to: creditor[i],
      from: debtor[i],
      amount: amount[i]
    };

    //Update or insert this data
    var query = { '_id': val };
    Transaction.findOneAndUpdate(query, entry, {upsert: true}, function(err, doc) {
      if (err) return res.send(500, { error: err });
    })
  });

  Transaction.find({}, function(err, data) {
    if (err) throw err;
    res.render('index', { 'data': data });
  });
});

module.exports = router;
