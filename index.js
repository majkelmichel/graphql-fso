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
		bookCount: async () => (await Book.find({})).length, // works
		authorCount: async () => (await Author.find({})).length, // works
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
		allAuthors: () => Author.find({}) // works
	},
	Author: {
		bookCount: async (root) => {
			const author = await Author.findById(root._id);

			const books = await Book.find({ author });
			return books.length;
		} // works
	},
	Mutation: {
		addBook: async (root, args) => {
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
				})
			}
			return book;
		}, // works
		editAuthor: async (root, args) => {
			const author = await Author.findOne({ name: args.name });  // authors.find(a => a.name === args.name);
			if (!author) {
				return null;
			}
			author.born = args.setBornTo;
			await author.save();
			return author;
		} // works
	}
};

const server = new ApolloServer({
	typeDefs,
	resolvers
});

server.listen().then(({ url }) => {
	console.log(`Server ready at ${url}`);
});
