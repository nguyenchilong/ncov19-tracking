const csvtojson = require("csvtojson");
const request = require("request");
const geojson = require("geojson");
const cheerio = require("cheerio");
const cloudscraper = require("cloudscraper");
const tabletojson = require('tabletojson').Tabletojson;
const dotenv = require('dotenv').config();
const fs = require("fs");
const axios = require('axios');

const worldMeterParser = require("../utils/worldMeterParser");

exports.getCurrentStatus = async (req, res, next) => {
	const url = await cloudscraper(`${process.env.WORLDOMETER_URL}`);
	const $ = cheerio.load(url);
	const html = $.html();
	const data = worldMeterParser.parseWorldMeterData($);
	const casesByCountry = tabletojson.convert(html, {
		stripHtmlFromHeadings: false,
		headings: ['name', 'totalCases', 'newCases', 'totalDeaths', 'newDeaths', 'totalRecoveries', 'activeCases', 'seriousCases', 'totCasesPer1Mil', 'totDeathsPer1Mil', 'totalTests', 'totalTestsPer1Mil', 'region']
	})[0];
	data['casesByCountry'] = casesByCountry
	res.json(data);
}
exports.caseByCountry = async (req, res, next) => {
	try {
		const rawData = await fs.readFileSync("data/detail.json");
		const countryData = JSON.parse(rawData);
		const countryFound = countryData.filter(country => {
			return country.name.toLowerCase() === req.params.country
		})[0];
		let data = [];
		const country = [];
		if (countryFound) {
			switch (countryFound.name) {
				case 'usa':
					data = await caseByCountryWorldMeterUS(countryFound);
					break;
				default:
					data = await caseByCountryWorldMeter(countryFound);
					break;
			}
		} else {
			country['name'] = req.params.country;
			country['url'] = `${process.env.WORLDOMETER_URL}/country/${req.params.country}`;
			data = await caseByCountryWorldMeter(country);
		}
		try {
			const countryInfo = await axios.get(`${process.env.COUNTRIES_API}/${(countryFound === undefined) ? country.name : countryFound.alt_name}`);
			data["CountryInfo"] = countryInfo.data[0];
		} catch (e) {
			data["CountryInfo"] = {
				name: (countryFound.name || req.params.country),
				flag: countryFound.flag
			};
		}
		res.json(data);
	} catch (e) {
		res.status(404).json({"message": e})
	}
}
const caseByCountryWorldMeter = async (country) => {
	const url = await cloudscraper(`${country.url}`);
	const $ = cheerio.load(url);
	let data = worldMeterParser.parseWorldMeterData($);
	if(country.name.toLowerCase() === 'vietnam')
		data['caseByProvinceVN'] = await caseByCountryVN();
	return data;
};
const caseByCountryWorldMeterUS = async (country) => {
	const url = await cloudscraper(`${country.url}`);
	const $ = cheerio.load(url);
	const html = $.html();
	const data = worldMeterParser.parseWorldMeterData($);
	const casesByState = tabletojson.convert(html, {
		stripHtmlFromHeadings: false,
		ignoreColumns: [6, 7, 9, 10],
		headings: ['state', 'totalCases', 'newCases', 'totalDeaths', 'newDeaths', 'activeCases', 'totalTest']
	})[0];
	casesByState.shift()
	data['caseByState'] = casesByState
	return data;
};
const caseByCountryVN = async () => {
	const url = await cloudscraper({
		url: "https://ncov.moh.gov.vn",
		method: "GET",
		strictSSL: false,
		rejectUnauthorized: false,
		agent: false
	});
	const $ = cheerio.load(url);
	const html = $.html();
	return tabletojson.convert(html, {
		stripHtmlFromHeadings: false,
		headings: ['Province', 'Cases', 'Active', 'Recoveries', 'Deaths']
	})[0];
}
exports.confirmedCasesGeo = async (req, res, next) => {
	const confirmedHistory = await csvtojson({trim: true})
		.fromStream(request.get(process.env.JHU_CONFIRMED_URL));
	const confirmedHistoryJsonArray = [];
	confirmedHistory.forEach(country => {
		GeoJsonObject = {
			name: (country["Province/State"] === "") ? country["Country/Region"] : country["Province/State"],
			category: 'case',
			lat: country.Lat,
			long: country.Long,
			confirmed: parseInt(country[Object.keys(country)[Object.keys(country).length - 1]])
		};
		confirmedHistoryJsonArray.push(GeoJsonObject);
	})
	const geoJsonArray = geojson.parse(confirmedHistoryJsonArray, {Point: ['lat', 'long']});
	res.status(200).json(geoJsonArray)
}
exports.getLatLongByName = async (req, res, next) => {
	const confirmed = await csvtojson({trim: true})
		.fromStream(request.get(process.env.JHU_CONFIRMED_URL));
	let countryName = req.params.countryName;
	let location = {"long": 0, "lat": 0};
	await confirmed.forEach(country => {
		if (country["Country/Region"] === countryName) {
			location.long = country.Long;
			location.lat = country.Lat;
		}
	});
	res.status(200).json(location);
}

exports.viewHistories = async (req, res, next) => {
	let country = req.params.country;
	try {
		let histories = await axios.get(`https://corona.lmao.ninja/v2/historical/${country}`);
		let timeline = histories.data.timeline || {};
		res.json({
			country: country,
			cases: timeline.cases,
			deaths: timeline.deaths,
			recovered: timeline.recovered
		});
	} catch (e) {
		console.log(e);
	}
}
