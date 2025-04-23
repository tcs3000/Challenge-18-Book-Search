import './App.css';
import { Outlet } from 'react-router-dom';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import apolloClient from './utils/apolloClient'; 

import Navbar from './components/Navbar';

const client = new ApolloClient({
  uri: '/graphql', 
  cache: new InMemoryCache(), 
});

// Alternatively, you can use the imported apolloClient if needed
// console.log(apolloClient);

function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <Navbar />
      <Outlet />
    </ApolloProvider>
  );
}

export default App;
