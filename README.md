# NUS Forum (CVWO Winter Assignment 2025)

Creator: Clarence Lau

This repository contains the code for a university web forum website.

### Tech Stack

**Frontend:**
React, Typescript, Axios, TanStack Query, MUI

**Backend:**
GoLang, Go-chi

**Database:**
PostgresSQL

**Others:**
Docker

### Installation

1. Clone the repository to your local machine.

```sh
git clone https://github.com/Unknownflow/cvwo_assignment.git
```

2. Navigate to the directory containing the backend code.

```bash
cd ../backend
```

3. Download and install Go by following the instructions [here](https://go.dev/doc/install).

4. Run the go server by entering this command:

```bash
go run ./cmd/server/main.go
```

5. Open your terminal and navigate to the directory containing the frontend code.

```bash
cd /frontend
```

6. Install dependencies for the project by entering this command:

```bash
yarn install
```

7. Run the app in development mode by entering this command:

```bash
yarn start
```

8. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Installation using Docker

1. Clone the repository to your local machine

```sh
git clone https://github.com/Unknownflow/cvwo_assignment.git
```

2. Open your terminal and navigate to the directory containing your cloned project

3. Run the following docker command to build the docker containers with all of its images.

```sh
docker compose build
```

3. Run the following docker command to start up the docker container.

```sh
docker compose up -d
```

4. Open [http://localhost:3000](http://localhost:3000) to view the frontend in the browser.

### Environment variables for root directory

- DB_HOST="postgres" (localhost for local deployment, postgres for docker deployment)
- DB_USER
- DB_PASSWORD
- DB_NAME
- DB_PORT (Default port: 5432)
- DB_DEFAULT_USER
- JWT_ACCESS_TOKEN_SECRET
- JWT_REFRESH_TOKEN_SECRET
- IS_PRODUCTION (true / false)

### Environment variable for frontend directory

- REACT_APP_API_BASE_URL

### AI Use

- Used Claude Sonnet 4.5 to evaluate my user authentication components
- Used Claude Sonnet 4.5 to suggest a recommended structure for Go backend to improve the maintainability and scalability of the backend
