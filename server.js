var express = require("express");
const app = express();
var url = process.env.mongodb_url;//"mongodb://"+process.env.IP+":27017/myDB";
var mongoClient = require('mongodb').MongoClient;
var myobj = {};
var fullUrl ="";

app.get("/new/*",function (req,res){
  fullUrl = req.url;
  fullUrl = fullUrl.substring(5,fullUrl.length);
  if (!validateUrl(fullUrl)){
    res.write('{"error":"Something is wrong! Please, check your URL."}');
     res.end();
  } else {
    //open DB connection
    mongoClient.connect(url,function (err, db){
      if (err) throw err;
      db.createCollection("urls", function(err, col) {
        if (err) throw err;
      });
      var collection = db.collection("urls");
    //create random short key and check that is not existing
    var inter = setInterval(function() {
      var randomKey = Math.floor(Math.random()*50000);
       collection.find({ShortUrl: randomKey}).toArray(function(err, result) {
        if (err) throw err;
        if (result.length == 0) {
          clearInterval(inter);
          myobj = {
                    FullUrl: fullUrl,
                    ShortUrl: "https://short-url-olbfoto.herokuapp.com/"+randomKey
          };
          collection.insertOne(myobj, function(err, r) {
             if (err) throw err;
            db.close(); 
            res.write(JSON.stringify(myobj));
             res.end();
  });
        };
  });
      
    },500);
    
    // create an object
    });//end of connect
  }

 
});
app.get(/[0-9]/,function (req, res){
  var str = req.url.toString();
  str = str.substring(1,str.length);
  console.log(str);
   //open DB connection
    mongoClient.connect(url,function (err, db){
      if (err) throw err;
      var collection = db.collection("urls");
      collection.find({ShortUrl: str}).toArray(function(err, result) {
        if (err) throw err;
        str = result[0].FullUrl;
        db.close();
        res.redirect(str);
        res.end();
    // create an object
    });
    });
    
  
})

app.listen(process.env.PORT);


function validateUrl (str){
  str = str.toLowerCase();
  
  if (((str.indexOf("http")==0 && str.indexOf("://")==4 && str.indexOf(".")>7)|| (str.indexOf("https")==0 && str.indexOf("://")==5 && str.indexOf(".")>8)) && (str.lastIndexOf(".")<str.length-1) ){
    
    return true;
  } else {
    return false;
  }
  
}