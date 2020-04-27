const moment = require("moment");
const fs = require("fs");
const os = require("os");
const NewsAPI = require('newsapi');
const axios = require('axios');

exports.homeScreen = async (req, res, next) => {
	res.render('home')
}

exports.faqScreen = async (req, res, next) => {
	try {
		let rawData = await fs.readFileSync("data/faq.json")
		faqData = JSON.parse(rawData);
	} catch (error) {
		console.log(error);
	}
	res.render('faq',
		{
			name: "nCoV19 Tracker",
			faqData
		}
	)
}

exports.sourcesScreen = async (req, res, next) => {
	res.render('sources', { message: '' });
}
exports.subscribeForm = async (req, res, next) => {
	let form = req.body;
	let filePathSub = "data/subscribe.json";
	let content = fs.readFileSync(filePathSub);
	let subObjects = JSON.parse(content) || [];
	subObjects.push({
		email: (form.email || ""),
		name: (form.name || "No Name"),
		phone: (form.phone || "")
	});
	writeFile(filePathSub, JSON.stringify(subObjects), {
		flag: "w",
		encoding: "utf8"
	});
	res.render('sources', { message: "Thank You For Subscribing! | Really Good Email" });
}

exports.mapScreen = async (req, res, next) => {
	res.render('map');
}

const writeFile = async (filePath, data, options) => {
	let result = await fs.writeFileSync(filePath, data, options);
	return result;
}
exports.newsScreen = async (req, res, next) => {
	const newsApi = new NewsAPI(process.env.NEWS_API_KEY);
	const formatDay = "YYYY-MM-DD";
	let from = moment().subtract(2, "days").format(formatDay);
	let to = moment().format(formatDay);
	newsApi.v2.everything({
		q: 'covid19',
		sources: 'bbc-news,the-verge',
		domains: 'bbc.co.uk,techcrunch.com',
		from: from,
		to: to,
		language: 'en',
		sortBy: 'publishedAt'
	}).then(response => {
		writeFile("data/new_api.json", JSON.stringify(response), {
			flag: "w",
			encoding: "utf8"
		});
		res.render('news', {
			"articles": response.articles
		});
	}).catch(e => {
		let content = fs.readFileSync("data/new_api.json");
		let news = JSON.parse(content);
		let logLine = moment().toString() + " => " + JSON.stringify(e) + os.EOL;
		writeFile("data/log_news_api.log", logLine, {
			flag: "a+",
			encoding: "utf8"
		});
		res.render('news', { "articles": news.articles });
	});
}


exports.historyScreen = async (req, res, next) => {
	let country = req.params.country;
	res.render("histories", {
		country: country
	});
}

