
function beforeRender(done) {
    console.log("I am in");
   var jsreport = require('jsreport-core')();
    jsreport.use(require('jsreport-fs-store')({ dataDirectory: 'D:\\Report.pdf', syncModifications: true }));
   /*require('request').post({url: 'http://127.0.0.1:5488/api/report', json:true },function(err, response, body) {
    console.log("I am inside"+err+"    "+response);
    request.template.data = body;
    console.log("This is body "+body);
    
   });*/
   done();
}
function afterRender(done) {
    console.log("I am in after render");
     done();
}


