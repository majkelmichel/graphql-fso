const { ApolloServer, gql, UserInputError, AuthenticationError } = require('apollo-server');
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://fullstack:UlrWHyaPB9h2Vftn@cluster0.rzenx.mongodb.net/gql-library?retryWrites=true&w=majority';
const Book = require('./models/book');
const Author = require('./models/author');
const User = require('./models/user');

const jwt = require('jsonwebtoken');
const JWT_SECRET = '1234567';

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


/*
 * Saattaisi olla järkevämpää assosioida kirja ja sen tekijä tallettamalla kirjan yhteyteen tekijän nimen sijaan tekijän id
 * Yksinkertaisuuden vuoksi tallennamme kuitenkin kirjan yhteyteen tekijän nimen
*/


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

    type User {
        username: String!
        favoriteGenre: String!
        id: ID!
    }

    type Token {
        value: String!
    }

    type Query {
        bookCount: Int!
        authorCount: Int!
        allBooks(author: String, genre: String): [Book!]!
        allAuthors: [Author!]!
        me: User
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
        createUser(
            username: String!
            favoriteGenre: String!
        ): User
        login(
            username: String!
            password: String!
        ): Token
    }
`;

const resolvers = {
	Query: {
		bookCount: async () => (
			await Book.find({})).length, // works
		authorCount: async () => (
			await Author.find({})).length, // works
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
		}, // works
		allAuthors: () => Author.find({}), // works
		me: (root, args, ctx) => ctx.currentUser
	},
	Author: {
		bookCount: async (root) => {
			const author = await Author.findById(root._id);

			const books = await Book.find({ author });
			return books.length;
		} // works
	},
	Mutation: {
		addBook: async (root, args, ctx) => {
			if (!ctx.currentUser) {
				throw new AuthenticationError('no user logged in');
			}
			let author = await Author.findOne({ name: args.author });
			console.log(author);
			if (!author) {
				const name = args.author;
				const newAuthor = new Author({ name });
				try {
					await newAuthor.save();
				} catch (error) {
					throw new UserInputError(error.message, {
						invalidArgs: args
					});
				}
				author = newAuthor;
			}
			const book = new Book({ ...args, author: author._id });
			try {
				await book.save();
			} catch (error) {
				throw new UserInputError(error.message, {
					invalidArgs: args
				});
			}
			return book;
		}, // works
		editAuthor: async (root, args, ctx) => {
			if (!ctx.currentUser) {
				throw new AuthenticationError('no user logged in');
			}
			const author = await Author.findOne({ name: args.name });  // authors.find(a => a.name === args.name);
			if (!author) {
				return null;
			}
			author.born = args.setBornTo;
			await author.save();
			return author;
		}, // works
		createUser: async (root, args) => {
			const newUser = new User({ ...args });

			return newUser.save()
				.catch(err => {
					throw new UserInputError(err.message, {
						invalidArgs: args
					});
				});
		},
		login: async (root, args) => {
			const user = await User.findOne({ username: args.username });
			if (!user || args.password !== 'passwd') {
				throw new UserInputError('wrong credentials');
			}

			const userForToken = {
				username: user.username,
				id: user._id
			};

			return { value: jwt.sign(userForToken, JWT_SECRET) };
		}
	}
};

const server = new ApolloServer({
	typeDefs,
	resolvers,
	context: async ({ req }) => {
		const auth = req ? req.headers.authorization : null;
		if (auth && auth.toLowerCase().startsWith('bearer ')) {
			const decodedToken = jwt.verify(
				auth.substring(7), JWT_SECRET
			);
			const currentUser = await User.findById(decodedToken.id);
			return { currentUser };
		}
	}
});

server.listen().then(({ url }) => {
	console.log(`Server ready at ${url}`);
});
