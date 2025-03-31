import React from 'react';
import { Outlet } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import Navigation from './Navigation';
import Header from './Header';

const Layout: React.FC = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <Container fluid className="flex-grow-1">
        <Row className="h-100">
          <Col md={3} lg={2} className="bg-light p-0">
            <Navigation />
          </Col>
          <Col md={9} lg={10} className="py-3 px-md-4">
            <Outlet />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Layout; 