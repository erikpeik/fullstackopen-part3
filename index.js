const express = require('express')
var morgan = require('morgan')
const app = express()
const cors = require('cors')
app.use(cors())

let notes = [
	{
	"id": 1,
	"name": "Arto Hellas",
	"number": "040-123456"
	},
	{
	"id": 2,
	"name": "Ada Lovelace",
	"number": "39-44-5323523"
	},
	{
	"id": 3,
	"name": "Dan Abramov",
	"number": "12-43-234345"
	},
	{
	"id": 4,
	"name": "Mary Poppendieck",
	"number": "39-23-6423122"
	}
]

app.use(express.json())

app.use(morgan(function (tokens, req, res) {
	return [
	  tokens.method(req, res),
	  tokens.url(req, res),
	  tokens.status(req, res),
	  tokens.res(req, res, 'content-length'), '-',
	  tokens['response-time'](req, res), 'ms',
	  JSON.stringify(req.body)
	].join(' ')
}))

app.get('/', (req, res) => {
	res.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (req, res) => {
	res.json(notes)
})

app.get('/api/persons/:id', (req, res) => {
	const id = Number(req.params.id)
	const note = notes.find(note => note.id === id)
	if (note) {
		res.json(note)
	} else {
		res.status(404).end()
	}
})

app.delete('/api/persons/:id', (req, res) => {
	const id = Number(req.params.id)
	notes = notes.filter(note => note.id !== id)

	res.status(204).end()
})

app.post('/api/persons', (req, res) => {
	const body = req.body

	if (!body.name || !body.number) {
		return res.status(400).json({
			error: 'content missing'
		})
	}

	if (notes.find(note => note.name === body.name)) {
		return res.status(400).json({
			error: 'name must be unique'
		})
	}

	const note = {
		name: body.name,
		number: body.number,
		id: Math.floor(Math.random() * 13371337),
	}

	notes = notes.concat(note)

	res.json(note)
})

app.get('/info', (req, res) => {
	res.send(`<p>Phonebook has info for ${notes.length} people</p> <p>${Date()}</p>`)
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
