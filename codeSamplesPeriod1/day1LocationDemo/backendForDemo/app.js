var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


const gju = require("geojson-utils");
const featureCollection = require("./allowedArea");
const polygon = featureCollection.features[0].geometry;


/* GET home page. */
app.get('/', function(req, res, next) {
  res.send("Simple Location Demo");
});

app.post('/geoapi', function(req, res) {
  const location = req.body;
  let isInside = gju.pointInPolygon(location,polygon);
  let result = {};
  result.status = isInside;
  let msg = isInside ? "Point was inside the tested polygon":
                       "Point was NOT inside tested polygon";
  result.msg = msg;
  res.json(result);
});

//Create a new polygon meant to be used on clients my airbnb's MapView which
//requres an object as the one we create below (note how we swap lon, lat values)
polygonForClient = {};
polygonForClient.coordinates = polygon.coordinates[0].map(point => {
  return {latitude: point[1],longitude: point[0]}
})
app.get("/geoapi/allowedarea",(req,res)=>{
  res.json(polygonForClient);
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.end("Not Found");
});


var port = process.env.PORT || 3000;
var ip = process.env.IP || "localhost";
app.set('port', port);

if(process.env.IP) {
  console.log("Runnig on DO");
  console.log("Binds to: "+process.env.IP);
}

app.listen(port,ip,()=>{console.log(`App listening on ${port}`)});






