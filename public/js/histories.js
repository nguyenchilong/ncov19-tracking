
google.charts.load('current', {'packages': ['corechart']});
google.charts.setOnLoadCallback(drawChart);

function drawChart(options) {
	if(options && options.container) {
		var datatable = new google.visualization.DataTable(),
			title = options.title,
			container = options.container,
			data = options.data;
		datatable.addColumn('date', title.col1);
		datatable.addColumn('number', title.col2);
		for (let key in data) {
			let item = [];
			let time = key.split('/');
			let year = time[2] + (new Date().getFullYear().toString().substr(2)).toString();
			let date = new Date(year, time[0], time[1]);
			item.push(date, options.data[key]);
			datatable.addRow(item);
		}
		var chart = new google.visualization.LineChart(document.getElementById(container));
		chart.draw(datatable, {
			title: `History ${title.country}`,
			curveType: 'function',
			legend: {position: 'bottom'},
			height: 500
		});
	}
}

window.onload = () => {
	let lblCountry = document.getElementById('countryName');
	let countryName = (lblCountry.innerText || lblCountry.textContent);
	fetch(`${window.location.origin}/api/history/${countryName}`)
		.then(res => {
			return res.json();
		}).then(data => {
			drawChart( {
				title: {
					country: `Cases of ${data.country}`,
					col1: "Date",
					col2: "Total Cases"
				},
				data: data.cases,
				container: 'historyChartCases'
			});
			drawChart({
				title: {
					country: `Deaths of ${data.country}`,
					col1: "Date",
					col2: "Total Deaths"
				},
				data: data.deaths,
				container: 'historyChartDeaths'
			});
			drawChart({
				title: {
					country: `Recovered of ${data.country}`,
					col1: "Date",
					col2: "Total Recovered"
				},
				data: data.recovered,
				container: 'historyChartRecovered'
			});
		}).catch(function(e) {
			console.error(e)
		});
}
