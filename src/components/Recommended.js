import React from 'react';
import { useQuery } from '@apollo/client';
import { BOOKS_BY_GENRE } from '../queries';

const Recommended = (props) => {
	const result = useQuery(BOOKS_BY_GENRE, {
		variables: {
			genre: props.fav
		}
	});

	if (result.loading) {
		return <div>loading...</div>;
	}

	const books = result.data.allBooks;


	if (!props.show) {
		return null;
	}

	return (
		<div>
			<h2>recommended</h2>
			<p>book in you favorite genre <strong>{props.fav}</strong></p>

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
					.map(a =>
						<tr key={a.title}>
							<td>{a.title}</td>
							<td>{a.author.name}</td>
							<td>{a.published}</td>
						</tr>
					)}
				</tbody>
			</table>
		</div>
	);
};

export default Recommended;