var express = require('express');
var router = express.Router();
var Debt = require('../models/debt.js');

/* GET home page. */
router.get('/', (req, res) => {
  //Fetch all data and render page
  Debt.getAll()
    .then((data) => {
      res.render('index', data);
    })
    .catch((err) => {
      res.send(err);
    });
});

/* Save or update data */
router.post('/', (req, res) => {
  //Fetch post variables
  var data = {};
  ['id', 'to', 'from', 'item', 'amount'].forEach((val) => {
      data[val] = req.body[val];
      data[val].shift(); //discard first entry (template row)
  });

  // create an array of 'upsert' queries (promises)
  var requests = data.id.map((val, i) => {
    return Debt.upsert({
        id: val,
        to: data.to[i],
        from: data.from[i],
        item: data.item[i],
        amount: data.amount[i]
    });
  });

  // append any delete queries
  var deletes = req.body['delete'];
  if (deletes !== undefined) {
    deletes.forEach((id) => {
      requests.push(Debt.delete(id));
      return true;
    });
  }

  //Execute all require updates, inserts, deletes and then render the page
  Promise.all(requests)
    .then(() => {
      Debt.getAll()
      .then((data) => {
        res.render('index', data);
      })
      .catch((err) => {
        res.send(err);
      });
    });
});


module.exports = router;
