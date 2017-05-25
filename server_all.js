var http = require('http'),
    express = require('express'),
    app = express(),
	path = require( 'path' ), 
	bodyParser = require('body-parser');
    sqlite3 = require('sqlite3').verbose(),
    db = new sqlite3.Database('ArrkXperience.sqlite');
var shortid = require('shortid');
app.use(bodyParser.urlencoded({ extended: false })); // support encoded bodies
app.use(bodyParser.json());

app.post('/login', function(req, res) {
    console.log("Entered into post request");
    email = req.body.email_id;
    password = req.body.password;
    console.log(email);
    console.log(password);

	if(email=='super.user@arrkgroup.com'){
	
	db.get("SELECT COUNT(*) as count FROM user WHERE email like '%" + email + "%' AND password='" + password + "'", function(err, rows) {
        //var totalrows=rows[0];
        console.log(rows.count);
       
        if (rows.count == 0) {
			res.status(200).send("711-Username and password combination is incorrect");
			console.log("Admin does not exitst");
			console.log("SELECT COUNT(*) as count FROM user WHERE email like '%" + email + "%' AND password='" + password + "'");
			}
			 if(rows.count > 0){
			 res.status(200).send("710");
            console.log("Send Admin to dashboard");
			 }
	
	
	});
	
	}

else {
    //Checking email and password are valid and present in DB
    db.get("SELECT COUNT(*) as count FROM user WHERE email like '%" + email + "%' AND password='" + password + "'", function(err, rows) {
        //var totalrows=rows[0];
        console.log(rows.count);
        if (err !== null) {
            res.status(500).send("User does not exist" + err);
			
        }
        if (rows.count == 0) {
			res.status(200).send("701");
			console.log("user does not exitst");
			}
			
			if (rows.count > 0) {
			db.get("SELECT COUNT(*) as count FROM user WHERE email like '%" + email + "%' AND otpstatus = 1", function(err, rows) {
        //var totalrows=rows[0];
		
				console.log(rows.count);
       
        if (rows.count > 0) 
		{
            res.status(200).send("702");
console.log("SELECT COUNT(*) as count FROM user WHERE email like '%" + email + "%' AND password='" + password + "'");
            console.log("Send to dashboard");
			
        }
		else
		{
		
           res.status(200).send("703");
            console.log("Send to OTP");
			
        }
    });
}

});
}
});


app.post('/otp', function(req, res) {
    console.log("Entered into post request");
    email = req.body.email_id;
	otp=req.body.otp;
    console.log(email);
    console.log(otp);

    //Checking if user has validated OTP if not OTP will be updated			
    db.get("SELECT COUNT(*) as count FROM user WHERE email like '%" + email + "%' AND otp = '" + otp + "'", function(err, rows) {
        //var totalrows=rows[0];
        console.log(rows.count);
        if (err !== null) {
            console.log("post err");
            res.status(500).send("User is not activated -- " + err);
        }
		if(rows.count<=0){
		
		res.status(200).send("705");
		console.log("OTP invalid");

		}
		
         if (rows.count > 0) {
                db.get("UPDATE user SET otpstatus=1 WHERE email like '%" + email + "%'", function(err, rows) {
				console.log("Inside Update");
                    if (err !== null) {
                        console.log("post err");
                        res.status(500).send("User is not activated -- " + err);;
                        console.log("feedback save");
                    }
					else{
					console.log("Update success");
					res.status(200).send("707");
					}
                })
            };
        });
    
});
 
 function sendeMail(otp, useremailid){
var email   = require("./node_modules/emailjs/email");
var server  = email.server.connect({
   user:    "internal.testing@arrkgroup.co.uk", 
   password:"@g@mBl#$19", 
   host:    "smtp.123-reg.co.uk",
   ssl:     false
});

// send the message and get a callback with an error or details of the message that was sent
server.send({
   from:    'Khushi App <internal.testing@arrkgroup.co.uk>', 
   to:      useremailid,
   subject: 'OTP for Khushi App',
   attachment: 
   [
      {data:"<div style='font-family:Arial,helvetica,san-serif;'><h2>Greetings from KHUSHI App</h2><p>Please use the below mentioned OTP to complete your registration</p><p><b>OTP:</b> "+otp+"<br/>Regards,<br/>Team Khushi App<br/><b>ARRKGROUP<b></p></div>", alternative:true}
   ]
}, function(err, message) { console.log(err || message); });

}

app.post('/addUsers', function(req, res) {
	//console.log(req);
	console.log("Entered into post request");
    username = req.body.name;
	useremailid = req.body.emailid;
	console.log("Entering data for user >>>> "+username);
	//Checking email existance
	db.get("SELECT COUNT(*) as count FROM user WHERE email like'%" + useremailid + "%'", function(err, rows) {
	//var totalrows=rows[0];	
		console.log(rows.count);
        if(err !== null) {
			res.status(500).json("An error has occurred -- " + err);
        }
		if(rows.count > 0){
			res.status(200).json("701-Email already exist. Please contact your administrator");
		}
        else {
			console.log("Email not register");	
			userpassword = req.body.password;
			userproject = req.body.project;
			//shortid.characters('0123456789');
			otp=((shortid.generate()).substring(1, 5)).toUpperCase(); 
			otpactivestatus=0;
			sendeMail(otp, useremailid);
			console.log(userpassword);
			console.log(otp);
			console.log(userproject);
			
			db.get("select id from project where project_name= '" + userproject + "'", function(err, rows) {
				//res.json(rows);
				var text = rows;
				console.log("ROWS   "+rows);
				console.log("TEXT   "+text);
				var pid = text.id;
				console.log("Project_name" + pid);


			
				sqlRequest = "INSERT INTO 'user' (name, email, password, project_id,otp,otpstatus) VALUES('" + username + "', '" + useremailid + "', '" + userpassword + "', '" + pid + "', '" + otp + "', "+ otpactivestatus+")"
				db.run(sqlRequest, function(err) {
					if(err !== null) {
						res.status(500).json("An error has occurred -- " + err);
					}
					else {
						res.status(200).json("703");
					}
				});
				});
					}
				});
});

app.get('/questions', function(req, res) {
	console.log(req.query.email);
	console.log("Inside questions");
	var u_email = req.query.email;

	db.all('SELECT COUNT(*) as count FROM user where email="' + u_email + '" ORDER BY id', function(err, rows) {
		console.log(rows.count);
		if (err !== null) {
			console.log("Inside get err");
			res.status(500).send("An error has occurred -- " + err);
		}
		if (rows.count > 0) {
			console.log(rows.count);
			console.log("Email address exist");
		} else {
			db.get("select project_name from project where id IN(SELECT project_id FROM user WHERE email='" + u_email + "')", function(err, rows) {
				//res.json(rows);
				var text = rows;
				var pid = text.project_name;
				console.log("Project_name" + pid);
				db.all('select id,question_text,project_id from question where id NOT IN(select question_id from answer where user_id =(select id from user where email="' + u_email + '")) and project_id IN(select id from project where project_name IN ("' + pid + '","All")) and created_at > date("now","-14 day")', function(err, row) {
					if (err !== null) {
						console.log("Inside get err");
						res.status(500).send("An error has occurred -- " + err);
					} else if (row.length == 0) {
						res.status(204).send("NO Question Configure");
						
					} 
					
					
					else  {
						console.log("Get request success");
						//res.status(200).json(JSON.stringify(row));
						res.type('application/json');
						res.send(row);
						console.log(row.length);
					}
				});
			});
		}
	});
});

app.post('/ans', function(req, res) {
	console.log("Entered into post request");
	id = req.body.ques_id;
	quotient = req.body.quotient;
	comments = req.body.comments;
	email = req.body.email;
	current_date=req.body.cdate;
	quotient_status = null;
	user_id = null;
	var proid = null;
	console.log(id);
	console.log(quotient);
	console.log(comments);
	console.log(email);
	console.log(current_date);
	
	//Checking question
	db.get("SELECT project_id  FROM question WHERE id='" + id + "'", function(err, rows) {
		//var totalrows=rows[0];
		console.log(rows);
		var text = rows;
		proid = text.project_id;
		//console.log(rows.count);
		if (err !== null) {
			res.status(500).send("Quesion not exist" + err);
		} else {

			db.get("SELECT id,email,project_id FROM user WHERE email='" + email + "'", function(err, rows) {

				//res.json(rows);
				console.log(rows);

				var text = rows;
				console.log(text);
				var uid = text.id;
				
				console.log(text.id);
				sqlRequest = "INSERT INTO 'answer' (question_id, user_id, quotient, comments,project_id,created_at) VALUES('" + id + "','" + uid + "','" + quotient + "','" + comments + "','" + proid + "','"+current_date+"')"
				db.run(sqlRequest, function(err) {
					if (err !== null) {
						console.log("post err");
						res.status(500).send("An error has occurred -- " + err);
					} else {
						res.status(200).send("200-Your feedback is saved ");
						console.log("feedback save");

					}
				});
			});
		}
	});
});
 
app.get('/project', function(req, res) {
db.all('SELECT project_name FROM project ORDER BY id', function(err, row) {
        if(err !== null) {
			console.log("Inside get err");
			res.status(500).send("An error has occurred -- " + err);
        }
        else {
			console.log("Get request success");
            //res.status(200).json(JSON.stringify(row));
			
			res.type('application/json');
			
			res.send(row);
			console.log(row);
			
            }        
    });
});
 
app.get('/users', function(req, res) {
db.all('SELECT u.name as name,u.email as email,p.project_name as project from user u inner join project p ON u.project_id=p.id where u.otpstatus=1 ORDER BY u.name', function(err, row) {
        if(err !== null) {
			console.log("Inside get err");
			res.status(500).send("An error has occurred -- " + err);
        }
        else {
			console.log("Get request success");
					
            //res.status(200).json(JSON.stringify(row));
			
			res.type('application/json');
			
			res.send(row);
			console.log(row);
			
            }        
    });
}); 
 
app.get('/question', function(req, res) {
db.all('SELECT q.question_text as question,p.project_name as project from question q  inner join project p on q.project_id=p.id ORDER BY q.id', function(err, row) {
        if(err !== null) {
			console.log("Inside get err");
			res.status(500).send("An error has occurred -- " + err);
        }
        else {
			console.log("Get request success");
					
            //res.status(200).json(JSON.stringify(row));
			
			res.type('application/json');
			
			res.send(row);
			console.log(row);
			
            }        
    });
});
 
app.get('/happy', function(req, res) {
	console.log(req.query.pname);
	console.log("Inside result");
	console.log(req.query.month);
	var pname = req.query.pname;
	var month=req.query.month;;	
	var t='-'+month+' months';
	console.log(t);
	
	if (month != 0){
	  sql_query = "select count(1) as status,'feeling_happy' as type from answer where quotient='happy' and project_id IN(select id from project where project_name='"+pname+"') and created_at between  datetime('now','"+t+"') AND datetime('now') UNION ALL select count(1) as status,'feeling_sad' as type from answer where quotient='sad' and project_id IN(select id from project where project_name='"+pname+"') and created_at between  datetime('now','"+t+"') AND datetime('now') UNION ALL select count(1) as status,'meh' as type from answer where quotient='blank' and project_id IN(select id from project where project_name='"+pname+"') and created_at between  datetime('now','"+t+"') AND datetime('now')order by type"
	} else {
	  sql_query = "select count(1) as status,'feeling_happy' as type from answer where quotient='happy' and project_id IN(select id from project where project_name='"+pname+"') and created_at between  (SELECT date('now','start of month')) AND datetime('now') UNION ALL select count(1) as status,'feeling_sad' as type from answer where quotient='sad' and project_id IN(select id from project where project_name='"+pname+"') and created_at between  (SELECT date('now','start of month')) AND datetime('now') UNION ALL select count(1) as status,'meh' as type from answer where quotient='blank' and project_id IN(select id from project where project_name='"+pname+"') and created_at between  (SELECT date('now','start of month')) AND datetime('now')order by type"
	}
		
	db.all(sql_query, function(err, rows)
		//db.run(sos, function(err,rows)
	{
		//console.log(rows.count);
		if (err !== null) {
			console.log("Inside get err");
			res.status(500).send("An error has occurred -- " + err);
		}
		if (rows.count != undefined) {
			console.log(rows.count);
			console.log("Email address exist");
		} else {
		
						 
						console.log("Get request success");
						//res.status(200).json(JSON.stringify(row));
						res.type('application/json');
						res.send(rows);
						console.log(rows);
					
				
			
		}
	});
});
app.get('/allresult', function(req, res) {
	console.log("All arrk result");
	var month=req.query.month;;	
	var t='-'+month+' months';
	console.log(t);
	if (month != 0){
	  sql_query = "select count(1) as status,'feeling_happy' as type from answer where quotient='happy' and created_at between  datetime('now','"+t+"') AND datetime('now') UNION ALL select count(1) as status,'feeling_sad' as type from answer where quotient='sad' and created_at between  datetime('now','"+t+"') AND datetime('now') UNION ALL select count(1) as status,'meh' as type from answer where quotient='blank' and created_at between  datetime('now','"+t+"') AND datetime('now')order by type"
	} else {
	  sql_query = "select count(1) as status,'feeling_happy' as type from answer where quotient='happy' and created_at between  (SELECT date('now','start of month')) AND datetime('now') UNION ALL select count(1) as status,'feeling_sad' as type from answer where quotient='sad' and created_at between  (SELECT date('now','start of month')) AND datetime('now') UNION ALL select count(1) as status,'meh' as type from answer where quotient='blank' and created_at between  (SELECT date('now','start of month')) AND datetime('now')order by type"
	}
	
	db.all(sql_query, function(err, rows)
	//db.run(sos, function(err,rows)
	{
		//console.log(rows.count);
		if (err !== null) {
			console.log("Inside get err");
			res.status(500).send("An error has occurred -- " + err);
		}
		if (rows.count != undefined) {
			console.log(rows.count);
			console.log("Email address exist");
		} else {
		
						 
						console.log("Get request success");
						//res.status(200).json(JSON.stringify(row));
						res.type('application/json');
						res.send(rows);
						console.log(rows);
					
				
			
		}
	});
});
app.post('/addquestion', function(req, res) {
    console.log("Entered into post request");
    question = req.body.question;
    project = req.body.project_name;
	pid = req.body.project_id;
    
	console.log(question);
    console.log(project);
	
	
	db.get("SELECT id FROM project WHERE project_name='" + project + "'", function(err, rows) {

				//res.json(rows);
				console.log(rows);

				var text = rows;
				console.log(text);
				var uid = text.id;
				console.log(text.id);

   
		sqlRequest = "INSERT INTO 'question' (question_text, project_id) VALUES('" + question + "','" + uid + "')"
		
			
		db.run(sqlRequest, function(err) {
		if (err !== null) {
			console.log("post err");
			res.status(500).send("An error has occurred -- " + err);
				} else {
					res.status(200).send("200-Your question has been added ");
					console.log("feedback save");
}
});
});
});

 
 var port = process.env.PORT || 8080;
var host = process.env.HOST || "192.168.2.59";

// Starts the server itself
var server = http.createServer(app).listen(port, host, function() {
    console.log("Server listening to %s:%d within %s environment", host, port, app.get('env'));
});




