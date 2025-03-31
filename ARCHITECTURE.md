# Trendwatching System Architecture

This document outlines the architecture of the Trendwatching application, built on the Nhost platform.

## Overview

Trendwatching is a web application that leverages the Nhost stack, which combines Hasura GraphQL Engine, PostgreSQL, and serverless functions to provide a complete backend solution. The application follows a microservices architecture pattern with containerized services.

## Core Components

### Backend Services

1. **PostgreSQL Database**
   - Stores all application data
   - Contains schemas for todos and other application-specific data
   - Initialized with scripts in the `initdb.d/` directory

2. **Hasura GraphQL Engine**
   - Provides a GraphQL API for interacting with the database
   - Handles authorization and access control
   - Configured via metadata in the `metadata/` directory

3. **Authentication (Nhost Auth)**
   - Manages user authentication and sessions
   - Handles email templates for user signup, password reset, etc.
   - JWT-based authentication integrated with Hasura

4. **Storage Service**
   - Manages file uploads and storage
   - Uses MinIO as the S3-compatible object storage backend

5. **Serverless Functions**
   - Custom business logic implemented as serverless functions
   - Located in the `functions/` directory
   - Accessible via HTTP endpoints

### Infrastructure

The application uses Docker Compose for local development, with the following containers:

- **traefik**: API Gateway and reverse proxy
- **postgres**: PostgreSQL database
- **graphql-engine**: Hasura GraphQL Engine
- **auth**: Nhost Authentication service
- **storage**: Nhost Storage service
- **functions**: Serverless function runner
- **minio**: S3-compatible object storage
- **mailhog**: SMTP testing server
- **dashboard**: Nhost admin dashboard

## Data Model

The initial database schema includes:

- **Todos**: A simple todo application with fields for:
  - ID (UUID)
  - Title (Text)
  - Completion status (Boolean)
  - Creation and update timestamps
  - User ID (UUID) for ownership

Additional views:
- **active_todos**: A view that filters for incomplete todos

## Authentication and Authorization

- JWT-based authentication provided by Nhost Auth
- Role-based access control configured in Hasura
- Authorization rules enforced at the GraphQL API level

## API Architecture

- **GraphQL API**: Primary API for frontend applications
- **RESTful Endpoints**: Provided by serverless functions
- **Storage API**: For file uploads and downloads
- **Authentication API**: For user management

## Deployment

The application can be deployed:
1. Locally using Docker Compose
2. To Nhost Cloud for production environments

## Development Workflow

1. Local development using Docker Compose
2. Database migrations tracked via Hasura migrations
3. CI/CD can be implemented using GitHub Actions or similar tools

## Scalability Considerations

- PostgreSQL can be scaled vertically or horizontally (with replication)
- Hasura provides caching and optimization for GraphQL queries
- Serverless functions scale automatically based on load

## Security

- Environment variables for sensitive configuration
- JWT secrets for secure authentication
- CORS configuration for API security
- Database access restricted to authenticated users 