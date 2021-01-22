const { ApolloServer, gql, UserInputError } = require('apollo-server');
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://fullstack:UlrWHyaPB9h2Vftn@cluster0.rzenx.mongodb.net/gql-library?retryWrites=true&w=majority';
const Book = require('./models/book');
const Author = require('./models/author');

mongoose.connect(MONGODB_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false,
	useCreateIndex: true
}).then(() => {
		console.log('connected to MongoDB');
	})
	.catch(err => {
		console.log('error connecting to MongoDB:', err.message);
	});

let authors = [
	{
		name: 'Robert Martin',
		id: 'afa51ab0-344d-11e9-a414-719c6709cf3e',
		born: 1952
	},
	{
		name: 'Martin Fowler',
		id: 'afa5b6f0-344d-11e9-a414-719c6709cf3e',
		born: 1963
	},
	{
		name: 'Fyodor Dostoevsky',
		id: 'afa5b6f1-344d-11e9-a414-719c6709cf3e',
		born: 1821
	},
	{
		name: 'Joshua Kerievsky', // birthyear not known
		id: 'afa5b6f2-344d-11e9-a414-719c6709cf3e'
	},
	{
		name: 'Sandi Metz', // birthyear not known
		id: 'afa5b6f3-344d-11e9-a414-719c6709cf3e'
	}
];

/*
 * Saattaisi olla järkevämpää assosioida kirja ja sen tekijä tallettamalla kirjan yhteyteen tekijän nimen sijaan tekijän id
 * Yksinkertaisuuden vuoksi tallennamme kuitenkin kirjan yhteyteen tekijän nimen
*/

let books = [
	{
		title: 'Clean Code',
		published: 2008,
		author: 'Robert Martin',
		id: 'afa5b6f4-344d-11e9-a414-719c6709cf3e',
		genres: [ 'refactoring' ]
	},
	{
		title: 'Agile software development',
		published: 2002,
		author: 'Robert Martin',
		id: 'afa5b6f5-344d-11e9-a414-719c6709cf3e',
		genres: [ 'agile', 'patterns', 'design' ]
	},
	{
		title: 'Refactoring, edition 2',
		published: 2018,
		author: 'Martin Fowler',
		id: 'afa5de00-344d-11e9-a414-719c6709cf3e',
		genres: [ 'refactoring' ]
	},
	{
		title: 'Refactoring to patterns',
		published: 2008,
		author: 'Joshua Kerievsky',
		id: 'afa5de01-344d-11e9-a414-719c6709cf3e',
		genres: [ 'refactoring', 'patterns' ]
	},
	{
		title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
		published: 2012,
		author: 'Sandi Metz',
		id: 'afa5de02-344d-11e9-a414-719c6709cf3e',
		genres: [ 'refactoring', 'design' ]
	},
	{
		title: 'Crime and punishment',
		published: 1866,
		author: 'Fyodor Dostoevsky',
		id: 'afa5de03-344d-11e9-a414-719c6709cf3e',
		genres: [ 'classic', 'crime' ]
	},
	{
		title: 'The Demon ',
		published: 1872,
		author: 'Fyodor Dostoevsky',
		id: 'afa5de04-344d-11e9-a414-719c6709cf3e',
		genres: [ 'classic', 'revolution' ]
	}
];

const typeDefs = gql`
    type Book {
        title: String!
        published: Int!
        author: String!
        genres: [String!]!
        id: ID!
    }

    type Author {
        name: String!
        id: ID!
        bookCount: Int!
        born: Int
    }

    type Query {
        bookCount: Int!
        authorCount: Int!
        allBooks(author: String, genre: String): [Book!]!
        allAuthors: [Author!]!
    }

    type Mutation {
        addBook(
            title: String!
            author: String!
            published: Int!
            genres: [String!]!
        ): Book
        editAuthor(
            name: String!
            setBornTo: Int!
        ): Author
    }
`;

const resolvers = {
	Query: {
		bookCount: async () => (await Book.find({})).length,
		authorCount: async () => (await Author.find({})).length,
		allBooks: (_root, _args) => {
			return Book.find({});
			// let returnedBooks = await Book.find({});
			// if (args.author) {
			// 	returnedBooks = returnedBooks.filter(book => args.author === book.author);
			// }
			// if (args.genre) {
			// 	returnedBooks = returnedBooks.filter(book => book.genres.includes(args.genre));
			// }
			// return returnedBooks;
		},
		allAuthors: () => Author.find({})
	},
	Author: {
		bookCount: (root) => books.filter(b => root.name === b.author).length
	},
	Mutation: {
		addBook: async (root, args) => {
			let author = await Author.find({ name: args.author });
			if (author.length === 0) {
				const name = args.author;
				const newAuthor = new Author({ name });
				await newAuthor.save();
				author = newAuthor;
			}
			const book = new Book({ ...args, author: author._id });
			try {
				await book.save();
			} catch (error) {
				throw new UserInputError(error.message, {
					invalidArgs: args
				})
			}
			return book;
		},
		editAuthor: (root, args) => {
			const author = authors.find(a => a.name === args.name);
			if (!author) {
				return null;
			}
			const updatedAuthor = { ...author, born: args.setBornTo };
			authors = authors.map(a => a.name === args.name ? updatedAuthor : a);
			return updatedAuthor;
		}
	}
};

const server = new ApolloServer({
	typeDefs,
	resolvers
});

server.listen().then(({ url }) => {
	console.log(`Server ready at ${url}`);
});
