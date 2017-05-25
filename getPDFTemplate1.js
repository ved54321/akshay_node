#!/usr/bin/env node
var http = require('http'), express = require('express'), app = express(), path = require('path'), bodyParser = require('body-parser');
sqlite3 = require('sqlite3').verbose(), db = new sqlite3.Database(__dirname + '/ArrkXperience.sqlite');
var utf8 = require('utf8');
var log4js = require('log4js');
var request = require('request');
log4js.loadAppender('file');
log4js.addAppender(log4js.appenders.file(__dirname + '/log/khushi.log'), 'khushi');
var logger = log4js.getLogger('khushi');
var shortid = require('shortid');
app.use(bodyParser.urlencoded({
	extended : false
}));
//var decode = require('urldecode');
//var encode = require('urlencode');
// support encoded bodies
app.use(bodyParser.json());
var crypto = require('crypto');
var now = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
var user_password = null;
var key = "B9Q9A686D42Nu8S";
var secret = "SMsWStmTTTs";
//var server_token = sha256(secret + key);

app.post('/generatechart', function(req, res,err) {
try{


	var pid = req.body.project_id
	var month = req.body.Month_Number;
	var t = '-' + month + ' months';
	var projectName= req.body.pname;
	var monthName= req.body.Month;
var role_id=req.body.role_id;
	var totalNumberOfRegisteredUsers= req.body.totalNumberOfRegisteredUsers;
	var totalNumberOfRespondents= req.body.totalNumberOfRespondents;
	var dynamic_token_app = req.get('dynamic_token');
	var question_data;

logger.info(pid);
logger.info(month);
logger.info(projectName);
logger.info(monthName);
logger.info(totalNumberOfRegisteredUsers);
logger.info(totalNumberOfRespondents);






	if (dynamic_token_app !== null && dynamic_token_app !== undefined) {

		db.get("SELECT COUNT(*) as count FROM user where token='" + dynamic_token_app + "'", function(err, rows) {
			if (rows.count > 0) {
				//console.log("token_not null");

				if (pid !== undefined && pid !== null) {

				if(role_id !="6"){

					if (month != 0) {
						sql_query = "select count(1) as status,'Happy' as type from answer where quotient='happy' and project_id ='"+pid+"' and role_id='"+role_id+"' and created_at between  datetime('now','" + t + "') AND datetime('now') UNION ALL select count(1) as status,'Sad' as type from answer where quotient='sad' and project_id ='"+pid+"' and role_id='"+role_id+"' and created_at between  datetime('now','" + t + "') AND datetime('now') UNION ALL select count(1) as status,'Meh' as type from answer where quotient='meh' and project_id ='"+pid+"' and role_id='"+role_id+"' and created_at between  datetime('now','" + t + "') AND datetime('now')"

						sql_query1="select a.quotient as test, q.question_text as question,a.comments as comment from answer a left outer join question q on a.question_id=q.id where a.project_id ='"+pid+"' and q.created_at between  (SELECT date('now','start of month')) AND datetime('now') order by a.quotient "
					} else {
						sql_query = "select count(1) as status,'Happy' as type from answer where quotient='happy' and project_id ='"+pid+"' and role_id='"+role_id+"' and created_at between  (SELECT date('now','start of month')) AND datetime('now') UNION ALL select count(1) as status,'Sad' as type from answer where quotient='sad' and project_id='"+pid+"' and role_id='"+role_id+"' and created_at between  (SELECT date('now','start of month')) AND datetime('now') UNION ALL select count(1) as status,'Meh' as type from answer where quotient='meh' and project_id='"+pid+"' and role_id='"+role_id+"' and created_at between  (SELECT date('now','start of month')) AND datetime('now')"
						sql_query1="UNION ALL select NULL as status, a.quotient as test, q.question_text as question,a.comments as comment from answer a left outer join question q on a.question_id=q.id where a.project_id ='"+pid+"' and q.created_at between  (SELECT date('now','start of month')) AND datetime('now') order by a.quotient "
					}

					}else{
					if (month != 0) {
						sql_query = "select count(1) as status,'Happy' as type from answer where quotient='happy' and project_id ='"+pid+"' and created_at between  datetime('now','" + t + "') AND datetime('now') UNION ALL select count(1) as status,'Sad' as type from answer where quotient='sad' and project_id ='"+pid+"' and created_at between  datetime('now','" + t + "') AND datetime('now') UNION ALL select count(1) as status,'Meh' as type from answer where quotient='meh' and project_id ='"+pid+"'  and created_at between  datetime('now','" + t + "') AND datetime('now')"

						sql_query1="select a.quotient as test, q.question_text as question,a.comments as comment from answer a left outer join question q on a.question_id=q.id where a.project_id ='"+pid+"' and q.created_at between  (SELECT date('now','start of month')) AND datetime('now') order by a.quotient "
					} else {
						sql_query = "select count(1) as status,'Happy' as type from answer where quotient='happy' and project_id ='"+pid+"' and created_at between  (SELECT date('now','start of month')) AND datetime('now') UNION ALL select count(1) as status,'Sad' as type from answer where quotient='sad' and project_id='"+pid+"' and created_at between  (SELECT date('now','start of month')) AND datetime('now') UNION ALL select count(1) as status,'Meh' as type from answer where quotient='meh' and project_id='"+pid+"' and created_at between  (SELECT date('now','start of month')) AND datetime('now')"
						sql_query1="select NULL as status, a.quotient as test, q.question_text as question,a.comments as comment from answer a left outer join question q on a.question_id=q.id where a.project_id ='"+pid+"' and q.created_at between  (SELECT date('now','start of month')) AND datetime('now') order by a.quotient"

					}


					}

					db.all(sql_query1, function(err,res_data){
						if (err !== null) {
							//console.log("Inside get err");
							res.status(200).send("An error has occurred -- " + err);
						}
						else{	//res.type('application/json');
							//res.send(res_data);
							question_data=res_data;
console.log(JSON.stringify(res_data, null, 2));
						}
					});


					db.all(sql_query, function(err, rows)
					
					{
						
						if (err !== null) {
							//console.log("Inside get err");
							res.status(200).send("An error has occurred -- " + err);
						}
						if (rows.count != undefined) {
							//console.log(rows.count);
							//console.log("error");
						} else {

							//console.log("Get request success");
							//res.status(200).json(JSON.stringify(row));
							//res.type('application/json');
							res.send(rows);
logger.info("result"+rows);
generatePDF(rows,question_data,projectName,monthName,totalNumberOfRegisteredUsers,totalNumberOfRespondents);
							//console.log(rows);

						}
					});
				} else {
					res.status(200).send("Project can't be blank");
				}

			} else {
				res.status(200).send("900 Invalid token");
			}
		});
	} else {
		res.status(200).send("900 Invalid token");
	}
}
catch(err)
{
logger.error(err.stack);
res.status(200).send("500 ERROR");
}
});
function generatePDF(response,response_question,projectName,monthName,totalNumberOfRegisteredUsers,totalNumberOfRespondents){
console.log("###########"+projectName);
console.log("###########"+response);
console.log("###########In generatePDF###########");
console.log("###########"+response_question);
var options = {
  method: 'post',
  body: {
      "template": {"shortid" : "HJc4qZ56e"},
	  "data": {
	  "project":[{
        "project": projectName,
        "month": monthName,
		"totalNumberOfRegisteredUsers": totalNumberOfRegisteredUsers,
		"totalNumberOfRespondents": totalNumberOfRespondents
    }],
   "mood": response,
   "qdata": response_question
},
      "options": {
      	"reports": { "save": true,"async": true }
      }
   }, // Javascript object
  json: true, // Use,If you are sending JSON data
  url: "http://10.0.1.146:5488/api/report",
  headers: {"content-type":"application/json"}
}
console.log("######################");
console.log(">>>>>>"+options);
request(options, function (err, res, body) {
  if (err) {
    console.log('Error :', err)
    return
  }
  console.log(' Body :', body)
  //var bodyContent=body;
  var reportURL=body.toString().split("=");
  console.log(reportURL.length);
  console.log(reportURL[1]);
  var finalSemiURL=reportURL[1].toString().split("'");
  var finalURL=finalSemiURL[1].toString().split(">");
  console.log("----"+finalURL[0]);

  options = {
  method: 'get',
  body: {}, // Javascript object
  json: true, // Use,If you are sending JSON data
  url: finalURL[0],
  headers: {"content-type":"application/json"}
}
setTimeout(function(){
request(options, function (err, res, body) {
  if (err) {
    console.log('Error :', err)
    return
  }
  //console.log(' Body :', body);
sendeMail(body);
});},5000);
});

}

function sendeMail(body){
    console.log("I am in send mail");
var email   = require("./node_modules/emailjs/email");
var server  = email.server.connect({
   user:    "internal.testing@arrkgroup.co.uk",
   password:"@g@mBl#$19",
   content: 'text/html; charset=UTF-8',
   host:    "smtp.123-reg.co.uk",
   ssl:     false
});

// send the message and get a callback with an error or details of the message that was sent
server.send({
   from:    'Kushi App <internal.testing@arrkgroup.co.uk>',
   to:      'akshay.khadse@arrkgroup.com',
   subject: 'Download PDF to check pulse rate of Arrk',
   content: 'text/html; charset=UTF-8',
   attachment : [{
			data : body,
			alternative : true
		}]
   //attachement:[ { data: 'Report.pdf' }  ]
}, function(err, message) {
    console.log("This is err "+err);
    console.log(err || message); });
}

//var port = process.env.PORT || 8080;
var port = process.env.PORT || 9250;
//var host = process.env.HOST || "127.0.0.1";
//var host = process.env.HOST || "10.0.2.58";
var host = process.env.HOST || "10.0.1.146";


// Starts the server itself
var server = http.createServer(app).listen(port, host, function() {
	console.log("Server listening to %s:%d within %s environment", host, port, app.get('env'));
});
