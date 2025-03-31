import React from 'react';
import { Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';

const Navigation: React.FC = () => {
  return (
    <Nav className="flex-column h-100 py-3 border-end" variant="pills">
      <Nav.Link as={NavLink} to="/dashboard" className="mb-2">
        Dashboard
      </Nav.Link>
      <Nav.Link as={NavLink} to="/accounts" className="mb-2">
        Instagram Accounts
      </Nav.Link>
      <Nav.Link as={NavLink} to="/logs" className="mb-2">
        Scraping Logs
      </Nav.Link>
    </Nav>
  );
};

export default Navigation; 