import axios from 'axios';

const BASE_URL = process.env.REACT_APP_AUTH_URL || 'http://localhost:1337/v1/auth';

// Custom auth service for Nhost
export const nhost = {
  auth: {
    // Sign up a new user
    signUp: async ({ email, password }: { email: string; password: string }) => {
      try {
        const response = await axios.post(`${BASE_URL}/signup/email-password`, {
          email,
          password,
          options: {
            redirectTo: window.location.origin
          }
        });
        
        if (response.data?.session?.accessToken) {
          localStorage.setItem('auth_token', response.data.session.accessToken);
          return { session: response.data.session, error: null };
        }
        
        return { session: null, error: new Error('Registration failed') };
      } catch (error: any) {
        return { 
          session: null, 
          error: error.response?.data?.message 
            ? new Error(error.response.data.message) 
            : error 
        };
      }
    },

    // Sign in an existing user
    signIn: async ({ email, password }: { email: string; password: string }) => {
      try {
        const response = await axios.post(`${BASE_URL}/signin/email-password`, {
          email,
          password
        });
        
        if (response.data?.session?.accessToken) {
          localStorage.setItem('auth_token', response.data.session.accessToken);
          return { session: response.data.session, error: null };
        }
        
        return { session: null, error: new Error('Authentication failed') };
      } catch (error: any) {
        return { 
          session: null, 
          error: error.response?.data?.message 
            ? new Error(error.response.data.message) 
            : error 
        };
      }
    },

    // Sign out the current user
    signOut: async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          await axios.post(`${BASE_URL}/sign-out`, {}, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
        }
        localStorage.removeItem('auth_token');
        return { error: null };
      } catch (error) {
        return { error };
      }
    },

    // Check if user is authenticated
    isAuthenticated: () => {
      return !!localStorage.getItem('auth_token');
    },

    // Get the current access token
    getAccessToken: () => {
      return localStorage.getItem('auth_token');
    }
  }
}; 