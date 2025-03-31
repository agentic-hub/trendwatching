import React from 'react';
import { Navbar, Container, Button } from 'react-bootstrap';
import { useAuth } from '../utils/AuthContext';

const Header: React.FC = () => {
  const { logout } = useAuth();

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container fluid>
        <Navbar.Brand href="/">Instagram Scraper Admin</Navbar.Brand>
        <div>
          <Button variant="outline-light" size="sm" onClick={logout}>
            Logout
          </Button>
        </div>
      </Container>
    </Navbar>
  );
};

export default Header; 