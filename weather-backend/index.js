const test = require("dotenv").config({ path: "config.env" });

const http = require("node:http");

const hostname = "127.0.0.1";
const port = 3000;

const server = http.createServer((req, res) => {
	res.statusCode = 200;
	res.setHeader("Content-Type", "json/application");
	res.setHeader("Access-Control-Allow-Origin", "*");

	var reqURL = new URL(req.url, "http://" + req.headers.host + req.url);

	var fetchURL = "";
	switch (reqURL.pathname) {
		case "/reverse":
			fetchURL =
				"https://api.geoapify.com/v1/geocode/reverse?" +
				"lat=" +
				reqURL.searchParams.get("lat") +
				"&lon=" +
				reqURL.searchParams.get("lon") +
				"&apiKey=" +
				process.env.GEOAPIFY_KEY;
			break;
		case "/search":
			fetchURL =
				"https://api.geoapify.com/v1/geocode/search?" +
				"text=" +
				reqURL.searchParams.get("text") +
				"&apiKey=" +
				process.env.GEOAPIFY_KEY;
			break;
		case "/autocomplete":
			fetchURL =
				"https://api.geoapify.com/v1/geocode/autocomplete?" +
				"text=" +
				reqURL.searchParams.get("text") +
				"&apiKey=" +
				process.env.GEOAPIFY_KEY;
			break;
		case "/VisualCrossingWebServices":
			fetchURL =
				"https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/" +
				reqURL.searchParams.get("pos") +
				"/" +
				"?unitGroup=metric&iconSet=icons2&lang=en&key=" +
				process.env.VISUALCROSSING_KEY;
			break;
	}

	fetch(fetchURL)
		.then((response) => response.text())
		.then((data) => {
			res.end(data);
		});
});

server.listen(process.env.PORT, process.env.HOSTNAME, () => {
	console.log(`Server running at http://${hostname}:${port}/`);
});
