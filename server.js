var port    = process.env.PORT || 8080;
var express = require('express');
var app     = express();

app.use(express.compress());
app.use(express.static(__dirname + '/public', { maxAge: 0 }));

app.listen(port);
console.log("Server ready to accept requests on port %d with express", port);
