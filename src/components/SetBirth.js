import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { ALL_AUTHORS, EDIT_AUTHOR } from '../queries';

const SetBirth = () => {
	const [ name, setName ] = useState('');
	const [ born, setBorn ] = useState('');

	const [ changeBorn ] = useMutation(EDIT_AUTHOR, {
		refetchQueries: [ { query: ALL_AUTHORS } ]
	});

	const submit = (event) => {
		event.preventDefault();

		changeBorn({
			variables: {
				name,
				setBornTo: Number(born)
			}
		});

		setName('');
		setBorn('');
	};

	return (
		<form onSubmit={submit}>
			<div>
				name <input
				value={name}
				onChange={(e) => setName(e.target.value)}
			/>
			</div>
			<div>
				born <input
				type='number'
				value={born}
				onChange={(e) => setBorn(e.target.value)}
			/>
			</div>
			<button type='submit'>set</button>
		</form>
	);
};

export default SetBirth;