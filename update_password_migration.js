#!/usr/bin/env node
var http = require('http'), express = require('express'), app = express(), path = require('path'), bodyParser = require('body-parser');
sqlite3 = require('sqlite3').verbose(), db = new sqlite3.Database('ArrkXperience.sqlite');
var log4js = require('log4js');
log4js.loadAppender('file');
log4js.addAppender(log4js.appenders.file('log/khushi.log'), 'khushi');
var logger = log4js.getLogger('khushi');
var shortid = require('shortid');
app.use(bodyParser.urlencoded({
	extended : false
}));
// support encoded bodies
app.use(bodyParser.json());
var crypto = require('crypto');
var now = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
var user_password = null;
var key = "B9Q9A686D42Nu8S";
var secret = "SMsWStmTTTs";
var server_token = sha256(secret + key);

//console.log(sha1(now));
function sha256(data) {
	var generator = crypto.createHash('sha256');
	generator.update(data)
	return generator.digest('hex')
}


app.get('/encrypt',function(req,res){

db.all("select email,password from user",function(err, rows){
	console.log(rows);
	if (err !== null) 
	{
		console.log("post err");
		res.status(500).send("An error has occurred -- " + err);
	}
	
	else 
	{
	console.log(rows.length);
	for (i=0;i<rows.length;i++)
	{
		var text = rows[i];
		var email = text.email;
		var pass=text.password;
		var encrypt_pass=sha256(pass);
		console.log("email: "+email+" password: "+pass+ " encrypt: "+encrypt_pass);
		
		db.get("update user set password ='" + encrypt_pass + "' where email='" + email + "'", function(err,rows){
			console.log("password updated");
			
		});
		
		}
		res.status(200).send("Done");
	}
});
});
var port = process.env.PORT || 8080;
//var host = process.env.HOST || "127.0.0.1";
//var host = process.env.HOST || "10.0.2.58";
var host = process.env.HOST || "khushi.arrkgroup.com";


// Starts the server itself
var server = http.createServer(app).listen(port, host, function() {
	console.log("Server listening to %s:%d within %s environment", host, port, app.get('env'));
});

