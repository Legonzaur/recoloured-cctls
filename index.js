var express = require("express");
const fs = require("fs");
const { fileURLToPath } = require("url");
var app = express();

app.get("/cctl/:id", (req, res) => {
	const id = req.params.id;
	res.header("Access-Control-Allow-Origin", "*");
	res.header(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept"
	);
	if (fs.existsSync(`cctl/${id}.json`)) {
		res.send(fs.readFileSync(`cctl/${id}.json`));
	} else {
		res.sendStatus(404);
	}
});
app.listen(8000, () => {
	console.log("Example app listening on port 8000!");
});
