import React, { useEffect, useState } from 'react';
import { useMutation } from '@apollo/client';
import { LOGIN } from '../queries';

const LoginForm = (props) => {
	const [ username, setUsername ] = useState('');
	const [ password, setPassword ] = useState('');

	const [ login, result ] = useMutation(LOGIN, {
		onError: (err) => console.log(err)
	});

	useEffect(() => {
		if (result.data) {
			const token = result.data.login.value;
			props.setToken(token);
			localStorage.setItem('library-user-token', token);
		}
	}, [result.data]);

	if (!props.show) {
		return null;
	}

	const submit = (e) => {
		e.preventDefault();
		login({
			variables: {
				username, password
			}
		});
		props.setPage('authors');
	};

	return (
		<>
			<h2>login</h2>
			<form onSubmit={submit}>
				<div>
					username: <input
					value={username}
					onChange={(e) => setUsername(e.target.value)}
				/>
				</div>
				<div>
					password: <input
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					type='password'
				/>
				</div>
				<button type='submit'>login</button>
			</form>
		</>
	);
};

export default LoginForm;