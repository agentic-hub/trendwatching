import React, { useState } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Modal, Form } from 'react-bootstrap';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Link } from 'react-router-dom';
import { Account } from '../types';

// GraphQL queries and mutations
const GET_INSTAGRAM_ACCOUNTS = gql`
  query GetInstagramAccounts {
    instagram_accounts(order_by: {created_at: desc}) {
      id
      username
      profile_id
      scrape_frequency
      is_active
      notes
      created_at
      updated_at
      scraping_logs_aggregate {
        aggregate {
          count
        }
      }
      scraping_logs(order_by: {started_at: desc}, limit: 1) {
        status
        started_at
        items_scraped
      }
    }
  }
`;

const UPDATE_ACCOUNT_STATUS = gql`
  mutation UpdateAccountStatus($id: uuid!, $is_active: Boolean!) {
    update_instagram_accounts_by_pk(
      pk_columns: {id: $id}, 
      _set: {is_active: $is_active}
    ) {
      id
      is_active
    }
  }
`;

const DELETE_ACCOUNT = gql`
  mutation DeleteAccount($id: uuid!) {
    delete_instagram_accounts_by_pk(id: $id) {
      id
      username
    }
  }
`;

const TRIGGER_SCRAPE = gql`
  mutation TriggerScrape($account_id: uuid!) {
    insert_scraping_logs_one(object: {
      instagram_account_id: $account_id,
      status: "queued"
    }) {
      id
    }
  }
`;

const AccountsPage: React.FC = () => {
  const { data, loading, error, refetch } = useQuery(GET_INSTAGRAM_ACCOUNTS);
  const [updateStatus] = useMutation(UPDATE_ACCOUNT_STATUS);
  const [deleteAccount] = useMutation(DELETE_ACCOUNT);
  const [triggerScrape] = useMutation(TRIGGER_SCRAPE);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<{id: string, username: string} | null>(null);

  if (loading) return <div>Loading accounts...</div>;
  if (error) return <div>Error loading accounts: {error.message}</div>;

  const accounts = data?.instagram_accounts || [];

  const handleStatusToggle = async (id: string, currentStatus: boolean) => {
    try {
      await updateStatus({
        variables: {
          id,
          is_active: !currentStatus
        }
      });
      refetch();
    } catch (err) {
      console.error('Error updating account status:', err);
    }
  };

  const handleDeleteClick = (account: {id: string, username: string}) => {
    setAccountToDelete(account);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (accountToDelete) {
      try {
        await deleteAccount({
          variables: {
            id: accountToDelete.id
          }
        });
        setShowDeleteModal(false);
        refetch();
      } catch (err) {
        console.error('Error deleting account:', err);
      }
    }
  };

  const handleTriggerScrape = async (id: string) => {
    try {
      await triggerScrape({
        variables: {
          account_id: id
        }
      });
      alert('Scrape job has been queued!');
      refetch();
    } catch (err) {
      console.error('Error triggering scrape:', err);
    }
  };

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Instagram Accounts</h1>
        <Link to="/accounts/add">
          <Button variant="primary">
            <i className="bi bi-plus"></i> Add Account
          </Button>
        </Link>
      </div>

      <Card>
        <Card.Body>
          {accounts.length > 0 ? (
            <div className="table-responsive">
              <Table striped hover>
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Frequency</th>
                    <th>Status</th>
                    <th>Last Scrape</th>
                    <th>Total Jobs</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((account: Account) => (
                    <tr key={account.id}>
                      <td>{account.username}</td>
                      <td>{account.scrape_frequency}</td>
                      <td>
                        <Badge bg={account.is_active ? 'success' : 'secondary'}>
                          {account.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td>
                        {account.scraping_logs[0]?.started_at
                          ? new Date(account.scraping_logs[0]?.started_at).toLocaleString()
                          : 'Never'}
                      </td>
                      <td>{account.scraping_logs_aggregate.aggregate.count}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => handleTriggerScrape(account.id)}
                          >
                            Scrape Now
                          </Button>
                          <Link to={`/accounts/edit/${account.id}`}>
                            <Button variant="outline-secondary" size="sm">Edit</Button>
                          </Link>
                          <Button
                            variant={account.is_active ? "outline-warning" : "outline-success"}
                            size="sm"
                            onClick={() => handleStatusToggle(account.id, account.is_active)}
                          >
                            {account.is_active ? 'Disable' : 'Enable'}
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteClick({id: account.id, username: account.username})}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-5">
              <p className="mb-3">No Instagram accounts have been added yet.</p>
              <Link to="/accounts/add">
                <Button variant="primary">Add Your First Account</Button>
              </Link>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the Instagram account <strong>{accountToDelete?.username}</strong>?
          This action cannot be undone and all associated scraping data will be lost.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Delete Account
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AccountsPage; 