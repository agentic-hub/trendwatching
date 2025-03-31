# Nhost Project

This is a Nhost project setup using Docker Compose.

## Getting Started

1. Make sure you have Docker and Docker Compose installed on your machine.

2. Start the services:
```bash
docker-compose up -d
```

3. The following endpoints will be available:

- GraphQL API: http://localhost:1337/v1/graphql
- Auth API: http://localhost:1337/v1/auth
- Storage API: http://localhost:1337/v1/storage
- Functions API: http://localhost:1337/v1/functions
- Hasura Console: http://localhost:1337
- Nhost Dashboard: http://localhost:3030
- Mailhog SMTP testing: http://localhost:8025
- Traefik Dashboard: http://localhost:9090

## Running the Hasura Console Locally (for database changes)

To make changes to the database from the Nhost dashboard, you need to run the Hasura console locally:

1. Install Hasura CLI
2. Run the console:
```bash
hasura console
```

This will expose the Hasura migrations API on port 9693, which is required by the Nhost Dashboard to make database changes.

## Project Structure

- `emails/`: Email templates
- `functions/`: Serverless functions
- `initdb.d/`: Database initialization scripts
- `test/`: Test files
- `.env`: Environment variables
- `config.yaml`: Nhost configuration
- `docker-compose.yaml`: Docker Compose configuration 