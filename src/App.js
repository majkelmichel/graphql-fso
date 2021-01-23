import React, { useEffect, useState } from 'react';
import Authors from './components/Authors';
import Books from './components/Books';
import NewBook from './components/NewBook';

import { useApolloClient, useQuery } from '@apollo/client';
import LoginForm from './components/LoginForm';
import Recommended from './components/Recommended';
import { FAVORITE_GENRE } from './queries';

const App = () => {
	const [ page, setPage ] = useState('authors');
	const [ token, setToken ] = useState(null);

	const client = useApolloClient();

	const logout = () => {
		setToken(null);
		localStorage.clear();
		client.resetStore();
		setPage('authors');
	}

	useEffect(() => {
		const token = localStorage.getItem('library-user-token');
		if (token) {
			setToken(token)
		}
	}, [token]);

	const resultFavorite = useQuery(FAVORITE_GENRE);

	if (resultFavorite.loading) {
		return <div>loading</div>
	}

	return (
		<div>
			<div>
				<button onClick={() => setPage('authors')}>authors</button>
				<button onClick={() => setPage('books')}>books</button>
				{token ?
					<>
						<button onClick={() => setPage('add')}>add book</button>
						<button onClick={() => setPage('recommended')}>recommended</button>
						<button onClick={logout}>logout</button>
					</>
					: <button onClick={() => setPage('login')}>login</button>}
			</div>

			<Authors
				show={page === 'authors'}
			/>

			<Books
				show={page === 'books'}
			/>

			<NewBook
				show={page === 'add'}
			/>

			<Recommended
				show={page === 'recommended'}
				fav={resultFavorite.data.me.favoriteGenre}
			/>

			<LoginForm
				show={page === 'login'}
				setToken={setToken}
				setPage={setPage}
			/>
		</div>
	);
};

export default App;