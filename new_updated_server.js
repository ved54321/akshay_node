#!/usr/bin/env node
var http = require('http'), express = require('express'), app = express(), path = require('path'), bodyParser = require('body-parser');
sqlite3 = require('sqlite3').verbose(), db = new sqlite3.Database(__dirname + '/ArrkXperience.sqlite');
var utf8 = require('utf8');
var cors = require('cors');
var log4js = require('log4js');
log4js.loadAppender('file');
log4js.addAppender(log4js.appenders.file(__dirname + '/log/khushi.log'), 'khushi');
var logger = log4js.getLogger('khushi');
var shortid = require('shortid');
app.use(bodyParser.urlencoded({
	extended : false
}));
var decode = require('urldecode');
var encode = require('urlencode');
// support encoded bodies
app.use(bodyParser.json());
app.use(cors());
var crypto = require('crypto');
var now = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
var user_password = null;
var key = "B9Q9A686D42Nu8S";
var secret = "SMsWStmTTTs";
var server_token = sha256(secret + key);
//logger.info(sha256(now));
//console.log(sha1(now));
function sha256(data) {
	var generator = crypto.createHash('sha256');
	generator.update(data)
	return generator.digest('hex')
}

function authenticate(email_id, sha_token) {

	db.get("Update user set token='" + sha_token + "' where email='" + email_id + "'", function(err, rows) {
		//console.log(rows.count);
	});
}

app.post('/login', function(req, res,err) {
try{


	email = req.body.email_id;
	user_password = req.body.password;
	var encrpyt_pass=sha256(user_password);
	logger.info(email);
	logger.info(user_password);
	logger.info(encrpyt_pass);

	var admin = null;
	
	var static_token_app = req.get('static_token');
	
logger.info("LOGININININI");
	if (static_token_app !== null && static_token_app !== undefined && static_token_app == server_token) {
		//Checking email and password are valid and present in DB
		db.get("SELECT COUNT(*) as count FROM user WHERE email like ? AND password=?",[email,encrpyt_pass], function(err, rows) {
			//var totalrows=rows[0];
logger.info("LOGININININI2");
			//console.log(rows.count);
			if (err !== null) {
				res.status(200).send("User does not exist" + err);
						
			}
			else {
			if (rows.count == 0) {
				res.status(200).send("701");
				logger.info("LOGININININI3");
			}

			if (rows.count > 0) {
				db.get("SELECT COUNT(*) as count FROM user WHERE email like ? AND is_admin=1",[email], function(err, rows) {
					
					if (err !== null) {
						res.status(200).send("User does not exist" + err);
					}
					if (rows.count > 0) {

						var data = email + user_password + now + key;
						var sha_user = sha256(data);
						authenticate(email, sha_user);

						res.set('token', sha_user);
						res.status(200).send("710");
						logger.info("LOGININININI4");
						logger.info("user==> " +email + " token ==> "+sha_user);
					} else {
						db.get("SELECT COUNT(*) as count FROM user WHERE email like ? AND otpstatus = 1 AND project_id is not null",[email], function(err, rows) {
							//var totalrows=rows[0];
							
							if (rows.count > 0) {
								var data = email + user_password + now + key;
								var sha_user = sha256(data);
								authenticate(email, sha_user);

								res.set('token', sha_user);
								res.status(200).send("702");
								logger.info("user==> " +email + " token ==> "+sha_user);
							} else {

							db.get("select count(*) as count from user where email like ? AND otpstatus = 0 ",[email],function(err,rows){
							
							if(rows.count > 0){
							res.status(200).send("703");
							logger.info("OTPPTPTPTPT");
							}
							else{
							db.get("select count(*) as count from user where email like ? AND project_id is null",[email],function(err,rows){
							if(rows.count > 0){
							res.status(200).send("705");
							logger.info("projetctct");
							}
							else{
							res.status(200).send("Error in project");
							}
							});
							}
						});
					}
				});
			}
			});
							
	}
}
});
}
	else {
		res.status(200).send("900 Invalid token");
	}
}
catch(err)
{
logger.error(err.stack);
res.status(200).send("500 ERROR");
}

});
app.post('/otp', function(req, res,err) {

try{
	;
	email = req.body.email_id;
	otp = req.body.otp;
	
	var static_token_app = req.get('static_token');
	

	if (static_token_app !== null && static_token_app !== undefined && static_token_app == server_token) {
		//Checking if user has validated OTP if not OTP will be updated
		db.get("SELECT COUNT(*) as count FROM user WHERE email like '%" + email + "%' AND otp = '" + otp + "'", function(err, rows) {
			//var totalrows=rows[0];
			//console.log(rows.count);
			if (err !== null) {
				//console.log("post err");
				res.status(200).send("User is not activated -- " + err);
			}
			if (rows.count <= 0) {

				res.status(200).send("705");
				//console.log("OTP invalid");

			}

			if (rows.count > 0) {
				db.get("UPDATE user SET otpstatus=1 WHERE email like '%" + email + "%'", function(err, rows) {
					console.log("Inside Update");
					if (err !== null) {
						console.log("post err");
						res.status(200).send("User is not activated -- " + err);
						
						
					} else {
						var data = email + user_password + now + key;
						var sha_user = sha256(data);
						authenticate(email, sha_user);

						res.set('token', sha_user);
					logger.info("user==> " +email + " token ==> "+sha_user);
						
						res.status(200).send("707");
					}
				})
			};
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

function sendeMail(otp, useremailid) {
	var email = require("./node_modules/emailjs/email");
	var server = email.server.connect({
		user : "internal.testing@arrkgroup.co.uk",
		password : "@g@mBl#$19",
		host : "smtp.123-reg.co.uk",
		ssl : false
	});

	// send the message and get a callback with an error or details of the message that was sent
	server.send({
		from : 'Khushi App <internal.testing@arrkgroup.co.uk>',
		to : useremailid,
		subject : 'OTP for Khushi App',
		attachment : [{
			data : "<div style='font-family:Arial,helvetica,san-serif;'><h2>Greetings from KHUSHI App</h2><p style='font-size:12px'>Please use the below mentioned OTP to complete your registration</p><p><b>OTP:</b> " + otp + "</p><p style='font-size:12px'>Regards,<br/>Team Khushi App<br/><b>ARRKGROUP<b></p></div>",
			alternative : true
		}]
	}, function(err, message) {
		//console.log(err || message);
	logger.info(err || message);
	logger.info("user mail emailid >> "+useremailid);
	});

}

app.post('/addUsers', function(req, res,err) {
try{
	//console.log(req);
	//console.log("Entered into post request");
	username = req.body.name;
	useremailid = req.body.emailid;
	userpassword = req.body.password;
	//userproject = req.body.project;
	var encrypt_password=sha256(userpassword)
	//console.log("Entering data for user >>>> " + username);
	var static_token_app = req.get('static_token');
	
	var email_format="@arrkgroup.com";

	if (static_token_app !== null && static_token_app !== undefined && static_token_app == server_token) {

		if(useremailid.includes(email_format)){

		//Checking email existance
		db.get("SELECT COUNT(*) as count FROM user WHERE email like'%" + useremailid + "%'", function(err, rows) {
			//var totalrows=rows[0];
			console.log(rows.count);
			if (err !== null) {
				res.status(200).json("An error has occurred -- " + err);
			}
			if (rows.count > 0) {
				res.status(200).json("701-Email already exist. Please contact your administrator");
			} else {
				//console.log("Email not register");
				//userpassword = req.body.password;
				//userproject = req.body.project;
				//shortid.characters('0123456789');
				otp = ((shortid.generate()).substring(1, 5)).toUpperCase();
				otpactivestatus = 0;
				sendeMail(otp, useremailid);
				
				

					sqlRequest = "INSERT INTO 'user' (name, email, password, otp,otpstatus) VALUES('" + username + "', '" + useremailid + "', '" + encrypt_password + "','" + otp + "', " + otpactivestatus + ")"
					db.run(sqlRequest, function(err) {
						if (err !== null) {
							res.status(200).json("An error has occurred -- " + err);
						} else {
							res.status(200).json("703");
						}
					});
				
			}
		});
	} 
	
else{
	res.status(200).send("Invalid email pattern");
	}

}
else {
		res.status(200).send("900 Invalid token");
	}
}
catch(err)
{
logger.error(err.stack);
res.status(200).send("500 ERROR");
}
});

app.get('/questions', function(req, res,err) {
try{
	console.log(req.query.email);
	var u_email = req.query.email;
	var dynamic_token_app = req.get('dynamic_token');
	//console.log(dynamic_token_app);
	logger.info("Questions"+"user==> " +u_email + " dynamic_token ==> "+dynamic_token_app);
	if (dynamic_token_app !== null && dynamic_token_app !== undefined) {

		db.get("SELECT COUNT(*) as count FROM user where token='" + dynamic_token_app + "'", function(err, rows) {
			if (rows.count > 0) {
				//console.log("token_not null");

				if (u_email != undefined) {

					db.get("SELECT COUNT(*) as count FROM user WHERE email like'%" + u_email + "%'", function(err, rows) {
						//console.log(rows.count);
						//console.log("inside email query");
						if (err !== null) {
							//console.log("Inside get err");
							res.status(200).send("An error has occurred -- " + err);
						}
						if (rows.count > 0) {
							//console.log(rows.count);
							//console.log("email found and inside questions")
							db.get("select project_name from project where id IN(SELECT project_id FROM user WHERE email='" + u_email + "')", function(err, rows) {
								//res.json(rows);
								var text = rows;
								var pid = text.project_name;
								//console.log("Project_name" + pid);
								db.all('select id,question_text,project_id from question where id NOT IN(select question_id from answer where user_id =(select id from user where email="' + u_email + '")) and project_id IN(select id from project where project_name IN ("' + pid + '","All")) and created_at > date("now","-14 day")', function(err, row) {
									console.log(row.length)
									if (err !== null) {
										//console.log("Inside get err");
										res.status(200).send("An error has occurred -- " + err);
									}
									if (row.length == "undefined") {
										res.status(204).send("NO Question Configure");

									} else {
										//console.log("Get request success");
										//res.status(200).json(JSON.stringify(row));
										res.type('application/json');
										res.send(row);
										//console.log(row.length);
									}
								});
							});

						} else {

							res.status(200).send("No question for the email");
						}
					});
				} else {
					//console.log("No email");
					res.status(200).send("Please enter email address");
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

app.post('/ans', function(req, res,err) {

try{
	//console.log("Entered into post request");
	id = req.body.ques_id;
	quotient = req.body.quotient;
	original_comments = req.body.comments;
	email = req.body.email;
	current_date = req.body.cdate;
	quotient_status = null;
	user_id = null;
	var proid = null;
	var text_comments=decode(original_comments);
var comments = text_comments.replace(/'/g,"''");
comments=comments.replace(/\+/g," "); 

comments=decode(comments);
	var dynamic_token_app = req.get('dynamic_token');
	//console.log(dynamic_token_app);
	if (dynamic_token_app !== null && dynamic_token_app !== undefined) {

		db.get("SELECT COUNT(*) as count FROM user where token='" + dynamic_token_app + "'", function(err, rows) {
			if (rows.count > 0) {
				//console.log("token_not null");

				if (id !== undefined && quotient !== undefined && comments !== undefined && email !== undefined && current_date !== undefined) {
					//Checking question
					db.get("SELECT project_id  FROM question WHERE id='" + id + "'", function(err, rows) {
						//var totalrows=rows[0];
						//console.log(rows);
						var text = rows;
						proid = text.project_id;
						//console.log(rows.count);
						if (err !== null) {
							res.status(200).send("Quesion not exist" + err);
						} else {

							db.get("SELECT id,email,project_id FROM user WHERE email='" + email + "'", function(err, rows) {

								//res.json(rows);
								//console.log(rows);

								var text = rows;
								//console.log(text);
								var uid = text.id;

								//console.log(text.id);
								sqlRequest = "INSERT INTO 'answer' (question_id, user_id, quotient, comments,project_id,created_at) VALUES('" + id + "','" + uid + "','" + quotient + "','" + comments + "','" + proid + "','" + current_date + "')"
								db.run(sqlRequest, function(err) {
									if (err !== null) {
										//console.log("post err");
										res.status(200).send("An error has occurred -- " + err);
									} else {
										res.status(200).send("200-Your feedback is saved ");
										//console.log("feedback save");

									}
								});
							});
						}
					});
				} else {
					res.status(200).send("Please enter mandatory details");
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

app.get('/project', function(req, res,err) {
try{
	var static_token_app = req.get('static_token');

	logger.info(static_token_app);
	logger.info(server_token);
	//console.log(static_token_app);
	//console.log(server_token);

	if (static_token_app !== null && static_token_app !== undefined && static_token_app == server_token) {

		db.all('SELECT id,project_name FROM project ORDER BY project_name', function(err, row) {
			if (err !== null) {
				//console.log("Inside get err");
				res.status(200).send("An error has occurred -- " + err);
			} else {
				console.log("Get request success");
				//res.status(200).json(JSON.stringify(row));

				res.type('application/json');

				res.send(row);
				//console.log(row);
				//logger.info(row);

			}
		});
	} else {
		res.status(200).send("Invalid token");
	}
}
catch(err)
{
logger.error(err.stack);
res.status(200).send("500 ERROR");
}
});

app.get('/users', function(req, res,err) {
try{
	var dynamic_token_app = req.get('dynamic_token');
	console.log(dynamic_token_app);
	if (dynamic_token_app !== null && dynamic_token_app !== undefined) {

		db.get("SELECT COUNT(*) as count FROM user where token='" + dynamic_token_app + "'", function(err, rows) {
			if (rows.count > 0) {
				console.log("token_not null");

				db.all('SELECT u.name as name,u.email as email,p.project_name as project from user u inner join project p ON u.project_id=p.id where u.otpstatus=1 ORDER BY u.name', function(err, row) {
					if (err !== null) {
						console.log("Inside get err");
						res.status(200).send("An error has occurred -- " + err);
					} else {
						//console.log("Get request success");

						//res.status(200).json(JSON.stringify(row));

						res.type('application/json');

						res.send(row);
						//console.log(row);

					}
				});
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

app.get('/question', function(req, res,err) {
try{
	var dynamic_token_app = req.get('dynamic_token');
	console.log(dynamic_token_app);
	if (dynamic_token_app !== null && dynamic_token_app !== undefined) {

		db.get("SELECT COUNT(*) as count FROM user where token='" + dynamic_token_app + "'", function(err, rows) {
			if (rows.count > 0) {
				console.log("token_not null");

				db.all('SELECT q.id,q.question_text as question,p.project_name as project from question q  inner join project p on q.project_id=p.id ORDER BY q.id desc', function(err, row) {
					if (err !== null) {
						console.log("Inside get err");
						res.status(200).send("An error has occurred -- " + err);
					} else {

						logger.info("updated the service")	

						//console.log("Get request success");

						//res.status(200).json(JSON.stringify(row));

						res.type('application/json');

						res.send(row);
						//console.log(row);

					}
				});
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

app.get('/happy', function(req, res,err) {
try{
	console.log(req.query.pname);
	console.log("Inside result");
	console.log(req.query.month);
	var pname = req.query.pname;
	var pid = req.query.project_id;
	var month = req.query.month;
	logger.info("PORJECT_ID ==> "+pid);
	var t = '-' + month + ' months';
	console.log(t);
	var dynamic_token_app = req.get('dynamic_token');
	//console.log(dynamic_token_app);
	if (dynamic_token_app !== null && dynamic_token_app !== undefined) {

		db.get("SELECT COUNT(*) as count FROM user where token='" + dynamic_token_app + "'", function(err, rows) {
			if (rows.count > 0) {
				//console.log("token_not null");

				if (pid !== undefined && pid !== null) {

					if (month != 0) {
						sql_query = "select count(1) as status,'feeling_happy' as type from answer where quotient='happy' and project_id ='"+pid+"' and created_at between  datetime('now','" + t + "') AND datetime('now') UNION ALL select count(1) as status,'feeling_sad' as type from answer where quotient='sad' and project_id ='"+pid+"' and created_at between  datetime('now','" + t + "') AND datetime('now') UNION ALL select count(1) as status,'meh' as type from answer where quotient='meh' and project_id ='"+pid+"' and created_at between  datetime('now','" + t + "') AND datetime('now')order by type"
					} else {
						sql_query = "select count(1) as status,'feeling_happy' as type from answer where quotient='happy' and project_id ='"+pid+"' and created_at between  (SELECT date('now','start of month')) AND datetime('now') UNION ALL select count(1) as status,'feeling_sad' as type from answer where quotient='sad' and project_id='"+pid+"'and created_at between  (SELECT date('now','start of month')) AND datetime('now') UNION ALL select count(1) as status,'meh' as type from answer where quotient='meh' and project_id='"+pid+"'and created_at between  (SELECT date('now','start of month')) AND datetime('now')order by type"
					}

					db.all(sql_query, function(err, rows)
					//db.run(sos, function(err,rows)
					{
						//console.log(rows.count);
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
							res.type('application/json');
							res.send(rows);
logger.info("result"+rows);
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
app.get('/allresult', function(req, res,err) {
try{
	//console.log("All arrk result");
	var month = req.query.month;
	
	var t = '-' + month + ' months';
	
	var dynamic_token_app = req.get('dynamic_token');
	//console.log(dynamic_token_app);
	if (dynamic_token_app !== null && dynamic_token_app !== undefined) {

		db.get("SELECT COUNT(*) as count FROM user where token='" + dynamic_token_app + "'", function(err, rows) {
			if (rows.count > 0) {
				//console.log("token_not null");

				if (month != 0) {
					sql_query = "select count(1) as status,'feeling_happy' as type from answer where quotient='happy' and created_at between  datetime('now','" + t + "') AND datetime('now') UNION ALL select count(1) as status,'feeling_sad' as type from answer where quotient='sad' and created_at between  datetime('now','" + t + "') AND datetime('now') UNION ALL select count(1) as status,'meh' as type from answer where quotient='meh' and created_at between  datetime('now','" + t + "') AND datetime('now')order by type"
				} else {
					sql_query = "select count(1) as status,'feeling_happy' as type from answer where quotient='happy' and created_at between  (SELECT date('now','start of month')) AND datetime('now') UNION ALL select count(1) as status,'feeling_sad' as type from answer where quotient='sad' and created_at between  (SELECT date('now','start of month')) AND datetime('now') UNION ALL select count(1) as status,'meh' as type from answer where quotient='meh' and created_at between  (SELECT date('now','start of month')) AND datetime('now')order by type"
				}

				db.all(sql_query, function(err, rows)
				//db.run(sos, function(err,rows)
				{
					//console.log(rows.count);
					if (err !== null) {
						//console.log("Inside get err");
						res.status(200).send("An error has occurred -- " + err);
					}
					if (rows.count != undefined) {
						//console.log(rows.count);
						//console.log("Email address exist");
					} else {

						//console.log("Get request success");
						//res.status(200).json(JSON.stringify(row));
						res.type('application/json');
						res.send(rows);
					//	console.log(rows);

					}
				});
			} else {
				res.status(200).send("900 Invalid token")
			}
		});
	} else {
		res.status(200).send("900 Invalid token")
	}
}
catch(err)
{
logger.error(err.stack);
res.status(200).send("500 ERROR");
}

});
app.post('/addquestion', function(req, res,err) {
try{
	console.log("Entered into post request");
	original_question = req.body.question;
	project = req.body.project_name;
	
	var dynamic_token_app = req.get('dynamic_token');
	//console.log(dynamic_token_app);

	logger.info("original_question "+original_question);
	var text_question=decode(original_question);
	logger.info("decoded question "+text_question);

	var question= text_question.replace(/'/g,"''"); 

	logger.info("After replace quotes "+question);	

	question=question.replace(/\+/g," ");

	question=decode(question);

	logger.info("After replace + "+question);	

	if (dynamic_token_app !== null && dynamic_token_app !== undefined) {

		db.get("SELECT COUNT(*) as count FROM user where token='" + dynamic_token_app + "'", function(err, rows) {
			if (rows.count > 0) {
				logger.info("token_not null");
				if (project !== undefined && project !== null) {

					db.get("SELECT id FROM project WHERE project_name='" + project + "'", function(err, rows) {
						logger.info("select Project");
						//res.json(rows);
						console.log(rows);

						var text = rows;
						logger.info(text);
						var uid = text.id;
						console.log(text.id);

						sqlRequest = "INSERT INTO 'question' (question_text, project_id) VALUES('" + question + "','" + uid + "')"

						db.run(sqlRequest, function(err) {
							if (err !== null) {
								logger.info("Adding questions"+err);	
	
								console.log("post err");
								res.status(200).send("An error has occurred -- " + err);
							} else {
								res.status(200).send("200-Your question has been added ");
								console.log("feedback save");

								logger.info("Question added");	


							}
						});
					});
				} else {
					res.status(200).send("Project can't be blank ");
				}
			} else {
				res.status(200).send("900 Invalid token")
			}
		});
	} else {
		res.status(200).send("900 Invalid token")
	}
}catch(err)
{
res.status(200).send("500 ERROR");
logger.error(err.stack);

}
});


app.post('/changepassword', function(req, res,err) {
try{
	useremailid = req.body.emailid;
	userpassword = req.body.password;
	var encrypt_password=sha256(userpassword)
	var static_token_app = req.get('static_token');
	console.log(static_token_app);
	console.log(server_token);

	if (static_token_app !== null && static_token_app !== undefined && static_token_app == server_token) {

		//Checking email existance
		db.get("SELECT COUNT(*) as count FROM user WHERE email like'%" + useremailid + "%'", function(err, rows) {
			
			console.log(rows.count);
			if (err !== null) {
				res.status(200).json("An error has occurred -- " + err);
			}
			if (rows.count > 0) {
				
				db.get("Update user set password='" + encrypt_password + "' where email='"+useremailid+"'",function(err,rows){
			if (err !== null) {
				res.status(200).json("An error has occurred -- " + err);
			}
			else{
				res.status(200).json("Password change successfully");
				}			
				});
			}
			else{
			res.status(200).json("Invalid Email");
			}			

});
}
else{
			res.status(200).json("Invalid TOken");
			}
}
catch(err)
{
logger.error(err.stack);
res.status(200).send("500 ERROR");
}
});


app.get('/registeration_project', function(req, res) {

	var static_token_app = req.get('static_token');

	logger.info(static_token_app);
	logger.info(server_token);
	//console.log(static_token_app);
	//console.log(server_token);

	if (static_token_app !== null && static_token_app !== undefined && static_token_app == server_token) {

		db.all('select project_name from project where status=1 order by project_name', function(err, row) {
			if (err !== null) {
				console.log("Inside get err");
				res.status(500).send("An error has occurred -- " + err);
			} else {
				console.log("Get request success");
				//res.status(200).json(JSON.stringify(row));

				res.type('application/json');

				res.send(row);
				console.log(row);
				logger.info(row);

			}
		});
	} else {
		res.status(200).send("900 Invalid token");
	}
});

app.post('/registeration_update_project', function(req, res) {
	userproject = req.body.project;
	userrole=req.body.role;
	email = req.body.email_id;
var pid;
var roleid;
	var static_token_app = req.get('static_token');
	db.get("select id from project where project_name= '" + userproject + "'", function(err, rows) {

					var text = rows;
					 pid = text.id;
					 
	db.get("select id from role where name= '" + userrole + "'",function(err,rows){

					var data = rows;
					 roleid = data.id;
	
					 
					sqlRequest="UPDATE user set project_id='" + pid + "',role_id='"+roleid+"' where email like '%" + email + "%'";
					db.run(sqlRequest, function(err) {
						if (err !== null) {
							res.status(200).json("An error has occurred -- " + err);
						} else {
							res.status(200).json("703");
						}
					});
					});
				});
	 
});


app.get('/uniqueusercount', function(req, res,err) {
try{
	var pid = req.query.project_id;
	var month = req.query.month;
	logger.info("PORJECT_ID ==> "+pid);
	var t = '-' + month + ' months';
	console.log(t);
	var dynamic_token_app = req.get('dynamic_token');
	console.log(dynamic_token_app);
	if (dynamic_token_app !== null && dynamic_token_app !== undefined) {

		db.get("SELECT COUNT(*) as count FROM user where token='" + dynamic_token_app + "'", function(err, rows) {
			if (rows.count > 0) {
				console.log("token_not null");

				if (pid !== undefined && pid !== null) {

					if (month != 0) {
						sql_query = "select count(distinct user_id) as respondent  from answer where project_id='"+pid+"' and created_at between  datetime('now','" + t + "') AND datetime('now')"
					} else {
						sql_query = "select count(distinct user_id) as respondent  from answer where project_id='"+pid+"' and created_at between  (SELECT date('now','start of month')) AND datetime('now')"
					}

					db.all(sql_query, function(err, rows)
					//db.run(sos, function(err,rows)
					{
						//console.log(rows.count);
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
							res.type('application/json');
							res.send(rows);

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


app.get('/uniqueregisterusercount', function(req, res,err) {
try{
	var pid = req.query.project_id;
		
	var dynamic_token_app = req.get('dynamic_token');
	console.log(dynamic_token_app);
	if (dynamic_token_app !== null && dynamic_token_app !== undefined) {

		db.get("SELECT COUNT(*) as count FROM user where token='" + dynamic_token_app + "'", function(err, rows) {
			if (rows.count > 0) {
				console.log("token_not null");

				if (pid !== undefined && pid !== null) {

					if (pid != 1) {
						sql_query = "select count(distinct id) as register_user from user where project_id='"+pid+"' and otpstatus=1"
					} else {
						sql_query = "select count(distinct id) as register_user from user where is_admin=0 and otpstatus=1"
					}

					db.all(sql_query, function(err, rows)
					//db.run(sos, function(err,rows)
					{
						//console.log(rows.count);
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
							res.type('application/json');
							res.send(rows);

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


app.get('/roles', function(req, res,err) {
try{
	var static_token_app = req.get('static_token');

	logger.info(static_token_app);
	logger.info(server_token);
	//console.log(static_token_app);
	//console.log(server_token);

	if (static_token_app !== null && static_token_app !== undefined && static_token_app == server_token) {

		db.all('SELECT id,name FROM role ORDER BY name', function(err, row) {
			if (err !== null) {
				//console.log("Inside get err");
				res.status(200).send("An error has occurred -- " + err);
			} else {
				console.log("Get request success");
				//res.status(200).json(JSON.stringify(row));

				res.type('application/json');

				res.send(row);
				//console.log(row);
				//logger.info(row);

			}
		});
	} else {
		res.status(200).send("Invalid token");
	}
}
catch(err)
{
logger.error(err.stack);
res.status(200).send("500 ERROR");
}
});













var port = process.env.PORT || 8080;
//var host = process.env.HOST || "127.0.0.1";
//var host = process.env.HOST || "10.0.2.58";
var host = process.env.HOST || "10.0.1.146";


// Starts the server itself
var server = http.createServer(app).listen(port, host, function() {
	console.log("Server listening to %s:%d within %s environment", host, port, app.get('env'));
});

