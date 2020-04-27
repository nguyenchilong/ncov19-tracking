const Router = require('express').Router();
const cache = require("../utils/cache")
const BaseController = require("../controllers/BaseController")

Router.get("/", cache(10), BaseController.homeScreen);
Router.get("/faq", BaseController.faqScreen);
Router.get("/sources", BaseController.sourcesScreen);
Router.post("/sources", BaseController.subscribeForm);
Router.get("/map", BaseController.mapScreen);
Router.get("/news", BaseController.newsScreen);
Router.get("/history/:country", BaseController.historyScreen);

module.exports = Router
