import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { useMutation, gql } from '@apollo/client';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';

// GraphQL mutation
const ADD_INSTAGRAM_ACCOUNT = gql`
  mutation AddInstagramAccount(
    $username: String!,
    $profile_id: String,
    $scrape_frequency: String!,
    $notes: String,
    $is_active: Boolean!
  ) {
    insert_instagram_accounts_one(object: {
      username: $username,
      profile_id: $profile_id,
      scrape_frequency: $scrape_frequency,
      notes: $notes,
      is_active: $is_active
    }) {
      id
      username
    }
  }
`;

// Form validation schema
const AccountSchema = Yup.object().shape({
  username: Yup.string()
    .required('Username is required')
    .matches(/^[a-zA-Z0-9._]{1,30}$/, 'Invalid Instagram username format'),
  profile_id: Yup.string(),
  scrape_frequency: Yup.string()
    .required('Scrape frequency is required'),
  notes: Yup.string(),
  is_active: Yup.boolean()
});

interface AccountFormValues {
  username: string;
  profile_id: string;
  scrape_frequency: string;
  notes: string;
  is_active: boolean;
}

const AddAccountPage: React.FC = () => {
  const navigate = useNavigate();
  const [addAccount, { loading }] = useMutation(ADD_INSTAGRAM_ACCOUNT);

  const initialValues: AccountFormValues = {
    username: '',
    profile_id: '',
    scrape_frequency: 'daily',
    notes: '',
    is_active: true
  };

  const handleSubmit = async (values: AccountFormValues) => {
    try {
      await addAccount({
        variables: values
      });
      navigate('/accounts');
    } catch (error) {
      console.error('Error adding account:', error);
      alert('Failed to add Instagram account. Please try again.');
    }
  };

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Add Instagram Account</h1>
        <Link to="/accounts">
          <Button variant="secondary">Back to Accounts</Button>
        </Link>
      </div>

      <Card>
        <Card.Body>
          <Formik
            initialValues={initialValues}
            validationSchema={AccountSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">Instagram Username *</label>
                  <Field 
                    name="username" 
                    type="text" 
                    className={`form-control ${errors.username && touched.username ? 'is-invalid' : ''}`}
                    placeholder="username (without @)"
                  />
                  <ErrorMessage name="username" component="div" className="invalid-feedback" />
                </div>

                <div className="mb-3">
                  <label htmlFor="profile_id" className="form-label">Profile ID (Optional)</label>
                  <Field 
                    name="profile_id" 
                    type="text" 
                    className={`form-control ${errors.profile_id && touched.profile_id ? 'is-invalid' : ''}`}
                    placeholder="Instagram profile identifier (if known)"
                  />
                  <ErrorMessage name="profile_id" component="div" className="invalid-feedback" />
                </div>

                <div className="mb-3">
                  <label htmlFor="scrape_frequency" className="form-label">Scrape Frequency *</label>
                  <Field 
                    as="select" 
                    name="scrape_frequency" 
                    className={`form-select ${errors.scrape_frequency && touched.scrape_frequency ? 'is-invalid' : ''}`}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </Field>
                  <ErrorMessage name="scrape_frequency" component="div" className="invalid-feedback" />
                </div>

                <div className="mb-3">
                  <label htmlFor="notes" className="form-label">Notes (Optional)</label>
                  <Field 
                    as="textarea" 
                    name="notes" 
                    className="form-control"
                    placeholder="Any relevant notes about this account"
                    rows={3}
                  />
                </div>

                <div className="mb-4 form-check">
                  <Field 
                    type="checkbox" 
                    name="is_active" 
                    className="form-check-input"
                    id="is_active"
                  />
                  <label className="form-check-label" htmlFor="is_active">
                    Account Active
                  </label>
                </div>

                <div className="d-flex justify-content-end">
                  <Link to="/accounts" className="btn btn-secondary me-2">
                    Cancel
                  </Link>
                  <Button 
                    type="submit" 
                    variant="primary" 
                    disabled={isSubmitting || loading}
                  >
                    {(isSubmitting || loading) ? 'Adding...' : 'Add Account'}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AddAccountPage; 