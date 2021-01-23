import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { ALL_BOOKS } from '../queries';

const Books = (props) => {
	const result = useQuery(ALL_BOOKS);

	const [ filter, setFilter ] = useState('all');

	if (result.loading) {
		return <div>loading...</div>;
	}

	if (!props.show) {
		return null;
	}

	const books = result.data.allBooks;
	const genres = books.reduce((acc, book) => {
		let arr = [];
		for (let g of book.genres) {
			if (!acc.includes(g)) {
				arr.push(g)
			}
		}
		return acc.concat(arr);
	}, []);

	return (
		<div>
			<h2>books</h2>

			<h3>current filter: {filter}</h3>
			<table>
				<tbody>
				<tr>
					<th></th>
					<th>
						author
					</th>
					<th>
						published
					</th>
				</tr>
				{books
					.filter(b => b.genres.includes(filter) || filter === 'all')
					.map(a =>
					<tr key={a.title}>
						<td>{a.title}</td>
						<td>{a.author.name}</td>
						<td>{a.published}</td>
					</tr>
				)}
				</tbody>
			</table>
			{genres.map(g => <button key={g} onClick={() => setFilter(g)}>{g}</button>)}
			<button
				onClick={() => {
					setFilter('all');
					result.refetch();
				}}
			>
				all
			</button>
		</div>
	);
};

export default Books;