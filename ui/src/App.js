import { useState, useEffect } from 'react'
import personService from './services/persons'


const Filter = ({value, onchange}) => {
	return (
		<div>
			filter show with:
			<input value={value} onChange={(e) => onchange(e.target.value)} />
		</div>
	)
}

const PersonForm = ({addUser, newName, newNumber, setNewName, setNewNumber}) => (
	<form onSubmit={addUser}>
		<div>name: <input value={newName} onChange={e => setNewName(e.target.value)} /></div>
		<div>number: <input value={newNumber} onChange={e => setNewNumber(e.target.value)}/></div>
		<div><button type="submit">add</button></div>
	</form>
)

const Persons = ({persons, filter, setPersons, setColor, setMessage}) => {
	const personsFilter = persons.filter(person =>
		person.name.toLowerCase().includes(filter.toLowerCase())
	)

	const deleteUser = (person, setPersons, setColor, setMessage) => {
		if (window.confirm(`Delete ${person.name}?`)) {
			personService
				.remove(person.id)
				.then(response => {
					setPersons(persons.filter(p => p.id !== person.id))
					setMessage(`Deleted ${person.name}`)
					setTimeout(() => { setMessage(null) }, 5000)
				})
				.catch(error => {
					setPersons(persons.filter(p => p.id !== person.id))
					setColor('red')
					setMessage(`Information of ${persons.name} has already been removed from server`)
					setTimeout(() => {
						setMessage(null)
						setColor('green')
					}, 5000)
				})
		}
	}

	return personsFilter.map((person, i) =>
		<div key={i}>
			{person.name} {person.number} <button
			onClick={() =>
			deleteUser(person, setPersons, setColor, setMessage)}>delete</button>
		</div>
	)
}

const Notification = ({message, color}) => {
	const greenStyle = {
		color: color,
		background: 'lightgrey',
		fontSize: 20,
		borderStyle: 'solid',
		borderRadius: 5,
		padding: 10,
		marginBottom: 10
	}

	if (message === null) {
		return null
	}

	return (
		<div style={greenStyle}>
			{message}
		</div>
	)
}

const App = () => {
	const [persons, setPersons] = useState([])
	const [newName, setNewName] = useState('')
	const [newNumber, setNewNumber] = useState('')
	const [filter, setFilter] = useState('')
	const [message, setMessage] = useState(null)
	const [color, setColor] = useState('green')

	useEffect(() => {
		personService
			.getAll()
			.then(response => setPersons(response.data))
	}, [])

	const addUser = (event) => {
		event.preventDefault()
		const personObject = {
			name: newName,
			number: newNumber
		}
		const names = persons.map(person => person.name)
		if (names.includes(newName)) {
			const text = `${newName} is already added to phonebook, replace the old number with a new one?`
			if (window.confirm(text)) {
				const person = persons.find(p => p.name === newName)
				const changedPerson = { ...person, number: newNumber }
				personService
					.update(person.id, changedPerson)
					.then(response => {
						setPersons(persons.map(p => p.id !== person.id ? p : response.data))
						setMessage(`Updated ${newName}`)
						setTimeout(() => { setMessage(null) }, 5000)
					})
					.catch(error => {
						setPersons(persons.filter(p => p.id !== person.id))
						setColor('red')
						setMessage(`Information of ${newName} has already been removed from server`)
						setTimeout(() => {
							setMessage(null)
							setColor('green')
						}, 5000)
					})
			}
		} else {
			personService
				.create(personObject)
				.then(response => {
					setPersons(persons.concat(response.data))
					setMessage(`Added ${newName}`)
					setTimeout(() => { setMessage(null) }, 5000)
				})
		}
		setNewName('')
		setNewNumber('')
	}

	return (
		<div>
			<h2>Phonebook</h2>

			<Notification message={message} color={color}
			setMessage={setMessage} />

			<Filter value={filter} onchange={setFilter} />

			<h3>Add a new</h3>

			<PersonForm
				addUser={addUser} newName={newName}
				newNumber={newNumber} setNewName={setNewName}
				setNewNumber={setNewNumber}
			/>

			<h3>Numbers</h3>

			<Persons
				persons={persons} filter={filter}
				setPersons={setPersons} setMessage={setMessage}
				setColor={setColor}
				/>
		</div>
	)
}

export default App
