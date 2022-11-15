require("dotenv").config();
const express = require("express");
const app = express();
const Person = require("./models/person");
const mongoose = require("mongoose");
var morgan = require("morgan");
const cors = require("cors");
app.use(cors());
app.use(express.static("build"));
app.use(express.json());

app.use(
	morgan(function (tokens, req, res) {
		return [
			tokens.method(req, res),
			tokens.url(req, res),
			tokens.status(req, res),
			tokens.res(req, res, "content-length"),
			"-",
			tokens["response-time"](req, res),
			"ms",
			JSON.stringify(req.body),
		].join(" ");
	})
);

app.get("/", (req, res) => {
	res.send("<h1>Hello World!</h1>");
});

app.get("/api/persons", (req, res) => {
	Person.find({}).then((notes) => {
		res.json(notes);
	});
});

app.get("/api/persons/:id", (req, res, next) => {
	Person.findById(req.params.id)
		.then((note) => {
			if (note) {
				res.json(note);
			} else {
				res.status(404).end();
			}
		})
		.catch((error) => next(error));
});

app.delete("/api/persons/:id", (req, res, next) => {
	Person.findByIdAndRemove(req.params.id)
		.then((result) => {
			res.status(204).end();
		})
		.catch((error) => next(error));
});

app.post("/api/persons", (req, res) => {
	const { name, number } = req.body;

	if (!name || !number)
		return res.status(400).json({ error: "content missing" });

	Person.findOne({ name }).then((person) => {
		if (person) {
			return res.status(400).json({ error: "name must be unique" });
		}
	});

	const person = new Person({
		name,
		number,
	});

	person.save().then((savedPerson) => {
		res.json(savedPerson);
	});
});

app.put("/api/persons/:id", (req, res, next) => {
	const { name, number } = req.body;
	const id = req.params.id;

	if (!name || !number || !id)
		return res.status(400).json({ error: "content missing" });
	const person = {
		name,
		number,
	};

	Person.findByIdAndUpdate(id, person, { new: true })
		.then((updatedPerson) => {
			res.json(updatedPerson);
		})
		.catch((error) => next(error));
});

app.get("/info", (req, res) => {
	Person.find({}).then((notes) => {
		res.send(
			`<p>Phonebook has info for ${
				notes.length
			} people</p> <p>${Date()}</p>`
		);
	});
});

const unknownEndpoint = (request, response) => {
	response.status(404).send({ error: "unknown endpoint" });
};

// handler of requests with unknown endpoint
app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
	console.error(error.message);

	if (error.name === "CastError") {
		return response.status(400).send({ error: "malformatted id" });
	}

	next(error);
};

// this has to be the last loaded middleware.
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
