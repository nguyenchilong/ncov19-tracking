const Router = require('express').Router();
const cache = require("../utils/cache")

const ApiController = require("../controllers/apiController");

Router.get("/geo_country/:countryName", cache(1), ApiController.getLatLongByName);
Router.get("/geo/cases", cache(100), ApiController.confirmedCasesGeo);
Router.get("/currentstatus", cache(100), ApiController.getCurrentStatus);
Router.get("/cases/:country", cache(100), ApiController.caseByCountry);
Router.get("/history/:country", cache(100), ApiController.viewHistories);
module.exports = Router;
