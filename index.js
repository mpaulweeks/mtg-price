var express = require('express');
var app = express();
var jade = require('jade');

var fn = jade.compileFile('index.jade');

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

var htmlout = fn({});

app.get('/', function(request, response) {
  response.send(htmlout)
})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
