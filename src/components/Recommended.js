import React from 'react';
import { useQuery } from '@apollo/client';
import { ALL_BOOKS, FAVORITE_GENRE } from '../queries';

const Recommended = (props) => {
	const resultFavorite = useQuery(FAVORITE_GENRE);
	const result = useQuery(ALL_BOOKS);

	if (result.loading || resultFavorite.loading) {
		return <div>loading...</div>
	}

	const books = result.data.allBooks;
	const favoriteGenre = resultFavorite.data.me.favoriteGenre;

	if (!props.show) {
		return null;
	}

	return (
		<div>
			<h2>recommended</h2>
			<p>book in you favorite genre <strong>{favoriteGenre}</strong></p>

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
					.filter(b => b.genres.includes(favoriteGenre))
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
	)
}

export default Recommended;