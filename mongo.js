const mongoose = require("mongoose");

if (process.argv.length < 3) {
	console.log(
		"Please provide the password as an argument: node mongo.js <password>"
	);
	process.exit(1);
}
const password = process.argv[2];
const url = `mongodb+srv://erikpeik:${password}@cluster0.on9zxfi.mongodb.net/?retryWrites=true&w=majority`;

const noteSchema = new mongoose.Schema({
	name: String,
	number: String,
});

const Person = mongoose.model("Person", noteSchema);

if (process.argv.length === 5) {
	const name = process.argv[3];
	const number = process.argv[4];
	mongoose
		.connect(url)
		.then((result) => {
			const newPerson = new Person({
				name,
				number,
			});
			return newPerson.save().then((result) => {
				console.log(`added ${name} number ${number} to phonebook`);
				mongoose.connection.close();
			});
		})
		.catch((err) => console.log(err));
} else if (process.argv.length === 3) {
	mongoose
		.connect(url)
		.then((result) => {
			console.log("phonebook:");
			Person.find({}).then((result) => {
				result.forEach((note) => {
					console.log(note.name, note.number);
				});
				mongoose.connection.close();
			});
		})
		.catch((err) => console.log(err));
} else {
	console.log("Wrong number of arguments");
}
