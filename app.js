const express = require("express");
var compression = require('compression')
const bodyParser = require('body-parser');

const baseRoutes = require("./routes/baseRoutes");
const apiRoutes = require("./routes/apiRoutes");

const app = express();
app.use(compression())

app.set('view engine', 'ejs');
app.set("views", "views");
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));

const port = process.env.PORT || 3000;

app.use("/", baseRoutes);
app.use("/api", apiRoutes);


app.listen(port);
