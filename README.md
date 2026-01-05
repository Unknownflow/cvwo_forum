# NUS Forum

By: Clarence Lau

This repository contains the code for a university web forum website made for the CVWO Winter Assignment 2025.

## Tech Stack

**Frontend:**
React, Typescript, Axios, TanStack Query, MUI

**Backend:**
GoLang, Go-chi

**Database:**
PostgresSQL

**Others:**
Docker

## Installation using Docker (Recommended)

1. Clone the repository to your local machine

```sh
git clone https://github.com/Unknownflow/cvwo_assignment.git
```

2. Open your terminal and navigate to the directory containing your cloned project

3. Run the following docker command to build the docker containers with all of its images.

```sh
docker compose build
```

4. Run the following docker command to start up the docker container.

```sh
docker compose up -d
```

5. Open [http://localhost:3000](http://localhost:3000) to view the frontend in the browser.

## Installation without using Docker

1. Clone the repository to your local machine.

```sh
git clone https://github.com/Unknownflow/cvwo_assignment.git
```

2. Set up your local PostgresSQL Database

3. Navigate to the directory containing the backend code.

```sh
cd backend
```

4. Download and install Go by following the instructions [here](https://go.dev/doc/install).

5. Run the go server by entering this command:

```sh
go run ./cmd/server/main.go
```

6. Open your terminal and navigate to the directory containing the frontend code.

```sh
cd ../frontend
```

7. Install dependencies for the project by entering this command:

```sh
yarn install
```

8. Run the app in development mode by entering this command:

```sh
yarn start
```

9. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Setting up of environment variables

### Root directory

- DB_HOST="postgres" (localhost for local deployment, postgres for docker deployment)
- DB_USER
- DB_PASSWORD
- DB_NAME
- DB_PORT (Default port: 5432)
- DB_DEFAULT_ROLE
- JWT_ACCESS_TOKEN_SECRET
- JWT_REFRESH_TOKEN_SECRET
- IS_PRODUCTION (true / false)

### Frontend directory

- REACT_APP_API_BASE_URL

## AI Use

- Used Claude Sonnet 4.5 to evaluate my user authentication components
- Used Claude Sonnet 4.5 to suggest a recommended structure for Go backend to improve the maintainability and scalability of the backend
