import React, { useState } from 'react';
import { Container, Card, Table, Badge, Button, Form, Row, Col } from 'react-bootstrap';
import { useQuery, gql } from '@apollo/client';
import { Account, ScrapingLog } from '../types';

// GraphQL queries
const GET_SCRAPING_LOGS = gql`
  query GetScrapingLogs($limit: Int!, $offset: Int!, $where: scraping_logs_bool_exp) {
    scraping_logs(
      order_by: {started_at: desc}, 
      limit: $limit, 
      offset: $offset,
      where: $where
    ) {
      id
      status
      started_at
      finished_at
      items_scraped
      error_message
      instagram_account {
        id
        username
      }
    }
    scraping_logs_aggregate(where: $where) {
      aggregate {
        count
      }
    }
    instagram_accounts {
      id
      username
    }
  }
`;

const ScrapingLogsPage: React.FC = () => {
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterAccount, setFilterAccount] = useState<string>('');

  // Build filter object based on user selection
  const buildWhereClause = () => {
    const where: any = {};
    
    if (filterStatus) {
      where.status = { _eq: filterStatus };
    }
    
    if (filterAccount) {
      where.instagram_account_id = { _eq: filterAccount };
    }
    
    return where;
  };

  const { data, loading, error, refetch } = useQuery(GET_SCRAPING_LOGS, {
    variables: {
      limit: pageSize,
      offset: currentPage * pageSize,
      where: buildWhereClause()
    },
    fetchPolicy: 'network-only'
  });

  if (loading) return <div>Loading logs...</div>;
  if (error) return <div>Error loading logs: {error.message}</div>;

  const logs = data?.scraping_logs || [];
  const totalCount = data?.scraping_logs_aggregate?.aggregate?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  const accounts = data?.instagram_accounts || [];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = () => {
    // Reset to first page when filters change
    setCurrentPage(0);
    refetch();
  };

  const getStatusBadge = (status: string) => {
    let variant = 'secondary';
    
    switch (status) {
      case 'success':
        variant = 'success';
        break;
      case 'in_progress':
      case 'queued':
        variant = 'warning';
        break;
      case 'failed':
        variant = 'danger';
        break;
    }
    
    return <Badge bg={variant}>{status}</Badge>;
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === currentPage ? 'primary' : 'outline-secondary'}
          size="sm"
          onClick={() => handlePageChange(i)}
          className="mx-1"
        >
          {i + 1}
        </Button>
      );
    }
    
    return (
      <div className="d-flex justify-content-center mt-4">
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => handlePageChange(0)}
          disabled={currentPage === 0}
          className="mx-1"
        >
          First
        </Button>
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="mx-1"
        >
          Previous
        </Button>
        {pages}
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages - 1}
          className="mx-1"
        >
          Next
        </Button>
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => handlePageChange(totalPages - 1)}
          disabled={currentPage === totalPages - 1}
          className="mx-1"
        >
          Last
        </Button>
      </div>
    );
  };

  return (
    <Container fluid>
      <h1 className="mb-4">Scraping Logs</h1>
      
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Filter by Status</Form.Label>
                <Form.Select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    handleFilterChange();
                  }}
                >
                  <option value="">All Statuses</option>
                  <option value="success">Success</option>
                  <option value="in_progress">In Progress</option>
                  <option value="queued">Queued</option>
                  <option value="failed">Failed</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Filter by Account</Form.Label>
                <Form.Select
                  value={filterAccount}
                  onChange={(e) => {
                    setFilterAccount(e.target.value);
                    handleFilterChange();
                  }}
                >
                  <option value="">All Accounts</option>
                  {accounts.map((account: Account) => (
                    <option key={account.id} value={account.id}>
                      {account.username}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Results per page</Form.Label>
                <Form.Select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(parseInt(e.target.value));
                    setCurrentPage(0);
                  }}
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      <Card>
        <Card.Body>
          {logs.length > 0 ? (
            <div className="table-responsive">
              <Table striped hover>
                <thead>
                  <tr>
                    <th>Account</th>
                    <th>Status</th>
                    <th>Started</th>
                    <th>Completed</th>
                    <th>Duration</th>
                    <th>Items Scraped</th>
                    <th>Error</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log: ScrapingLog) => {
                    const startDate = new Date(log.started_at);
                    const finishDate = log.finished_at ? new Date(log.finished_at) : null;
                    const duration = finishDate 
                      ? Math.round((finishDate.getTime() - startDate.getTime()) / 1000)
                      : null;
                      
                    return (
                      <tr key={log.id}>
                        <td>{log.instagram_account?.username}</td>
                        <td>{getStatusBadge(log.status)}</td>
                        <td>{startDate.toLocaleString()}</td>
                        <td>{finishDate ? finishDate.toLocaleString() : '-'}</td>
                        <td>
                          {duration !== null ? `${duration} seconds` : '-'}
                        </td>
                        <td>{log.items_scraped || 0}</td>
                        <td>
                          {log.error_message ? (
                            <span className="text-danger">{log.error_message}</span>
                          ) : ''}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          ) : (
            <p className="text-center py-4">No scraping logs found.</p>
          )}
          
          {renderPagination()}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ScrapingLogsPage; 