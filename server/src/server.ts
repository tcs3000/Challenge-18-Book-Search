import express, {Application} from 'express';
import path from 'node:path';
import { ApolloServer } from 'apollo-server-express';
import { typeDefs } from './schemas/typeDefs.js';
import { resolvers } from './schemas/resolvers.js';
import { authenticateToken } from './services/auth.js';
import db from './config/connection.js';

const app: Application = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// Apollo Server setup
async function startApolloServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: authenticateToken,
  });

  await server.start();
  server.applyMiddleware({ app });

  // Connect to DB and start the server
  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`🌍 Now listening on http://localhost:${PORT}${server.graphqlPath}`);
    });
  });
}

startApolloServer();
