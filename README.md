# Trendwatching

A web application built on the Nhost platform for trend monitoring and analysis.

## Getting Started

1. Make sure you have Docker and Docker Compose installed on your machine.

2. Clone the repository and navigate to the project directory.

3. Create a `.env` file based on `.env.example` (if not already present).

4. Start the services:
```bash
docker-compose up -d
```

5. The following endpoints will be available:

- GraphQL API: http://localhost:1337/v1/graphql
- Auth API: http://localhost:1337/v1/auth
- Storage API: http://localhost:1337/v1/storage
- Functions API: http://localhost:1337/v1/functions
- Hasura Console: http://localhost:1337
- Nhost Dashboard: http://localhost:3030
- Mailhog SMTP testing: http://localhost:8025
- Traefik Dashboard: http://localhost:9090

## Running the Hasura Console Locally

To make changes to the database schema:

1. Install Hasura CLI:
```bash
curl -L https://github.com/hasura/graphql-engine/raw/stable/cli/get.sh | bash
```

2. Run the console:
```bash
hasura console
```

This will expose the Hasura migrations API on port 9693, which is required by the Nhost Dashboard to make database changes.

## Project Structure

- `emails/`: Email templates for user authentication and notifications
- `functions/`: Serverless functions for backend processing
- `initdb.d/`: Database initialization scripts and schema definitions
- `metadata/`: Hasura metadata files
- `migrations/`: Database migration files
- `seeds/`: Seed data for development
- `test/`: Test files and test setup
- `.env`: Environment variables configuration
- `config.yaml`: Nhost configuration
- `docker-compose.yaml`: Docker Compose configuration for local development

## Development Workflow

1. Make database schema changes through the Hasura console (running locally)
2. Write serverless functions in the `functions/` directory
3. Configure authentication in the Nhost dashboard
4. Deploy your application

## Documentation

For more detailed information about the system architecture, see [architecture.md](./architecture.md). 