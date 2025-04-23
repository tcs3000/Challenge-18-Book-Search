import { useState, useEffect } from 'react';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ME } from '../graphql/queries';  
import { REMOVE_BOOK } from '../graphql/mutations';  

import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage';
import type { User } from '../models/User';
import type { Book } from '../models/Book';

const SavedBooks = () => {
  const [userData, setUserData] = useState<User>({
    username: '',
    email: '',
    password: '',
    savedBooks: [],
  });

  // Use Apollo's useQuery hook to get user data
  const { loading, data, error } = useQuery(GET_ME);

  // Apollo Mutation to remove a book
  const [removeBook] = useMutation(REMOVE_BOOK, {
    onCompleted: (data) => {
      // Update local state when book is removed successfully
      setUserData(data.removeBook);
      removeBookId(data.removeBook.bookId);  // Remove bookId from localStorage
    },
  });

  
  if (loading) {
    return <h2>LOADING...</h2>;
  }


  if (error) {
    console.error(error);
    return <h2>Something went wrong!</h2>;
  }

  
  useEffect(() => {
    if (data) {
      setUserData(data.getMe);
    }
  }, [data]);

  
  const handleDeleteBook = async (bookId: string) => {
    
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    try {
      
      await removeBook({ variables: { bookId } });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="text-light bg-dark p-5">
        <Container>
          {userData.username ? (
            <h1>Viewing {userData.username}'s saved books!</h1>
          ) : (
            <h1>Viewing saved books!</h1>
          )}
        </Container>
      </div>

      <Container>
        <h2 className="pt-5">
          {userData.savedBooks.length
            ? `Viewing ${userData.savedBooks.length} saved ${
                userData.savedBooks.length === 1 ? 'book' : 'books'
              }:`
            : 'You have no saved books!'}
        </h2>

        <Row>
          {userData.savedBooks.map((book: Book) => (
            <Col md="4" key={book.bookId}>
              <Card border="dark">
                {book.image ? (
                  <Card.Img
                    src={book.image}
                    alt={`The cover for ${book.title}`}
                    variant="top"
                  />
                ) : null}
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <p className="small">Authors: {book.authors}</p>
                  <Card.Text>{book.description}</Card.Text>
                  <Button
                    className="btn-block btn-danger"
                    onClick={() => handleDeleteBook(book.bookId)}
                  >
                    Delete this Book!
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;
