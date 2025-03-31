import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useQuery, gql } from '@apollo/client';

// GraphQL queries
const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    instagram_accounts_aggregate {
      aggregate {
        count
      }
    }
    instagram_accounts(where: {is_active: {_eq: true}}) {
      id
      username
      scraping_logs(order_by: {started_at: desc}, limit: 1) {
        status
        started_at
        items_scraped
      }
    }
    scraping_logs_aggregate {
      aggregate {
        count
      }
    }
    scraping_logs(order_by: {started_at: desc}, limit: 5) {
      id
      status
      started_at
      finished_at
      items_scraped
      instagram_account {
        username
      }
    }
  }
`;

const DashboardPage: React.FC = () => {
  const { data, loading, error } = useQuery(GET_DASHBOARD_STATS);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div>Error loading dashboard: {error.message}</div>;

  const totalAccounts = data?.instagram_accounts_aggregate?.aggregate?.count || 0;
  const totalScrapingJobs = data?.scraping_logs_aggregate?.aggregate?.count || 0;
  const activeAccounts = data?.instagram_accounts || [];
  const recentLogs = data?.scraping_logs || [];

  return (
    <Container fluid>
      <h1 className="mb-4">Dashboard</h1>
      
      <Row className="mb-4">
        <Col md={6} lg={3} className="mb-3">
          <Card className="h-100 text-center">
            <Card.Body>
              <h2>{totalAccounts}</h2>
              <Card.Title>Instagram Accounts</Card.Title>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3} className="mb-3">
          <Card className="h-100 text-center">
            <Card.Body>
              <h2>{activeAccounts.filter(a => a.is_active).length}</h2>
              <Card.Title>Active Accounts</Card.Title>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3} className="mb-3">
          <Card className="h-100 text-center">
            <Card.Body>
              <h2>{totalScrapingJobs}</h2>
              <Card.Title>Total Scraping Jobs</Card.Title>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3} className="mb-3">
          <Card className="h-100 text-center">
            <Card.Body>
              <h2>
                {recentLogs.reduce((total, log) => total + (log.items_scraped || 0), 0)}
              </h2>
              <Card.Title>Recent Items Scraped</Card.Title>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="mb-4">
        <Col md={12} lg={6} className="mb-3">
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">Recent Scraping Jobs</h5>
            </Card.Header>
            <Card.Body>
              {recentLogs.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Account</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Items</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentLogs.map(log => (
                        <tr key={log.id}>
                          <td>{log.instagram_account?.username}</td>
                          <td>
                            <span className={`badge bg-${log.status === 'success' ? 'success' : log.status === 'in_progress' ? 'warning' : 'danger'}`}>
                              {log.status}
                            </span>
                          </td>
                          <td>{new Date(log.started_at).toLocaleString()}</td>
                          <td>{log.items_scraped || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center">No scraping jobs have been run yet.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={12} lg={6} className="mb-3">
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">Instagram Accounts Status</h5>
            </Card.Header>
            <Card.Body>
              {activeAccounts.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Username</th>
                        <th>Last Scrape</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeAccounts.map(account => (
                        <tr key={account.id}>
                          <td>{account.username}</td>
                          <td>
                            {account.scraping_logs[0]?.started_at
                              ? new Date(account.scraping_logs[0]?.started_at).toLocaleString()
                              : 'Never'}
                          </td>
                          <td>
                            {account.scraping_logs[0] ? (
                              <span className={`badge bg-${account.scraping_logs[0].status === 'success' ? 'success' : account.scraping_logs[0].status === 'in_progress' ? 'warning' : 'danger'}`}>
                                {account.scraping_logs[0].status}
                              </span>
                            ) : (
                              <span className="badge bg-secondary">Never scraped</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center">No Instagram accounts have been added yet.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DashboardPage; 