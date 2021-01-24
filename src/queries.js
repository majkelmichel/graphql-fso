import { gql } from '@apollo/client';

export const ALL_AUTHORS = gql`
    query {
        allAuthors {
            name
            born
            bookCount
        }
    }
`;

export const ALL_BOOKS = gql`
    query {
        allBooks {
            title
            author {
                name
            }
            published
            id
            genres
        }
    }
`;

export const ADD_BOOK = gql`
    mutation ($title: String!, $author: String!, $published: Int!, $genres: [String!]!) {
        addBook(title: $title, author: $author, published: $published, genres: $genres) {
            title
            id
            author {
                name
            }
            published
            genres
        }
    }
`;

export const EDIT_AUTHOR = gql`
    mutation ($name: String!, $setBornTo: Int!) {
        editAuthor(name: $name, setBornTo: $setBornTo) {
            name
            born
        }
    }
`;

export const LOGIN = gql`
    mutation ($username: String!, $password: String!) {
        login(username: $username, password: $password) {
            value
        }
    }
`;

export const FAVORITE_GENRE = gql`
    query {
        me {
            favoriteGenre
        }
    }
`;

export const BOOKS_BY_GENRE = gql`
    query ($genre: String!) {
        allBooks(genre: $genre) {
            title
            author {
                name
            }
            published
            genres
            id
        }
    }
`;

export const BOOK_ADDED = gql`
	subscription {
		bookAdded {
			title
			author {
				name
			}
		}
	}
`;