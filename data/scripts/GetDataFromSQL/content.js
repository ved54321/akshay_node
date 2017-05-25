var sqlite = require('sqlite3').verbose();
http = require('http');
var path = require('path');
var dbPath = path.resolve("D:\\nodejs\\node_modules\\jsreport", 'Dummy.sqlite')
var db = new sqlite.Database(dbPath);
var url="http://127.0.0.1:9250/getQueryString";
console.log("I am here");
var request = require('request');
request(url, function (error, response, body) {
    console.log("I am Inside");
   // if (!error && response.statusCode == 200) {
        console.log(body); // Print the google web page.
        console.log(res);
     //}
})
    function beforeRender(done){
         db.all('select moods, count from status where moods='+"happy"+'', function(err, rows) {
            request.data = { status: rows };
			done();
    });
}   