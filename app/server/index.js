var http = require('http');
var path = require('path');

var app = require(path.join(__dirname, 'server'));


var port = process.env.PORT || '3000';
app.set('port', port);

var server = http.createServer(app);


server.listen(port);
console.log('Server now listening on port ' + port);
