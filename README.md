# NUS Forum

Created by: Clarence Lau Cun Guang

This repository contains the code for a university web forum website made for the CVWO Winter Assignment 2025.

## Deployment

- Frontend Server: https://nus-forum.vercel.app/
- Backend API Server: https://nus-forum-server.onrender.com
- PostgresSQL Database: hosted on Render

## 🚀 Core Features

- Topics: allow creation of new topics to generate further discussions on the forum
- Posts: allow creation of posts related to the topics and users to reply to posts
- Search: search for favourite topics, posts and comments
- Sort: sort topics, posts and comments by any order
- Voting: like or dislike any posts or comments created by other users, and view liked posts and comments
- Profile: view posts created by other users

## 🛠️ Tech Stack

**Frontend:**
React, Typescript, Axios, TanStack Query, MUI

**Backend:**
Golang, Go-chi

**Database:**
PostgresSQL

**Others:**
Docker

## Project structure

```
.
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/         # API routes
│   │   ├── components/  # React components
│   │   ├── context/     # React Context
│   │   ├── hooks/       # Custom React hooks
│   │   ├── pages/       # Page components
│   │   ├── routes/      # React routing
│   │   ├── styles/      # Global styles
│   │   ├── types/       # React types
│   │   └── utils/       # Utility functions
│   ├── tsconfig.json
│   ├── Dockerfile
│   ├── package.json
│   ├── .eslintrc.js
│   ├── .prettierrc.js
│   └── yarn.lock
├── backend
│   ├── cmd/
│   │   └── server/      # API routes
│   ├── internal/
│   │   ├── api/         # Encapsulates types and utilities related to the API
│   │   ├── auth/
│   │   ├── database/    # Encapsulates the types and utilities related to the database
│   │   ├── handlers/    # Handler functions to respond to requests
│   │   ├── middlewares/ # Middleware functions to handle requests and responses
│   │   ├── models/      # Definitions of objects used in the application
│   │   ├── repository/  # Handle writing and retrieving from database
│   │   ├── router/      # Encapsulates types and utilities related to the router
│   │   ├── routes/      # Defines routes that are used in the application
│   │   ├── service/     # Handle business logic
│   │   └── token/       # Handle JWT tokens
│   ├── migrations/
│   └── Dockerfile
├── docker-compose.yml
├── LICENSE
├── README.md
└── tsconfig.json
```

## API Endpoints

### Authentication endpoints

- Login: POST /auth/login
- Sign up: POST /auth/signup
- Log out: POST /auth/logout

All API endpoints below are protected routes and JSON Web Tokens are required to access these endpoints.

### Topics

- Create topic: POST /topics
- Get all topics: GET /topics
- Get topic: GET /topics/{id}
- Update topic: PUT /topics/{id}
- Delete topic: DELETE /topics/{id}

### Posts

- Create post: POST /posts
- Get all topic posts: GET /topics/{id}/posts
- Get post: GET /posts/{id}
- Get all posts by user: GET /posts/user/{user}
- Update post: PUT /posts/{id}
- Delete post: DELETE /posts/{id}

### Comments

- Create comment: POST /comments
- Get all post comments: GET /posts/{id}/comments
- Get comment: GET /comments/{id}
- Update comment: PUT /comments/{id}
- Delete comment: DELETE /comments/{id}

### Post likes

- Create post like: POST /posts/likes
- Get post like: GET /posts/likes/{id}
- Delete post like: DELETE /posts/likes/{id}
- Get posts liked by user: GET /posts/likes

### Comment likes

- Create comment like: POST /comments/likes
- Get comment like: GET /comments/likes/{id}
- Delete comment like: DELETE /comments/likes/{id}
- Get comments liked by user: GET /comments/likes

## ⚙️ Local development

### Prerequisites

- Go 1.25+
- NodeJS 22+ and npm
- Docker (recommended for deployment)

### 🐳 Installation using Docker (Recommended)

1. Clone the repository to your local machine

```sh
git clone https://github.com/Unknownflow/cvwo_assignment.git
```

2. Open your terminal and navigate to the directory containing your cloned project

3. Create an .env file with all the environment variables listed below.

4. Run the following docker command to build the docker containers with all of its images.

```sh
docker compose build
```

5. Run the following docker command to start up the docker container.

```sh
docker compose up -d
```

6. Open [http://localhost:3000](http://localhost:3000) to view the frontend in the browser.

### Installation without using Docker

1. Clone the repository to your local machine.

```sh
git clone https://github.com/Unknownflow/cvwo_assignment.git
```

2. Set up your local PostgresSQL Database

3. Create an .env file with all the environment variables listed below.

4. Navigate to the directory containing the backend code.

```sh
cd backend
```

5. Download and install Go by following the instructions [here](https://go.dev/doc/install).

6. Run the go server by entering this command:

```sh
go run ./cmd/server/main.go
```

7. Open your terminal and navigate to the directory containing the frontend code.

```sh
cd ../frontend
```

8. Install dependencies for the project by entering this command:

```sh
yarn install
```

9. Run the app in development mode by entering this command:

```sh
yarn start
```

10. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Setting up of environment variables

### Root directory

```
DB_HOST=postgres                // postgres for docker, localhost for localhost
DB_USER=user                    // change username
DB_PASSWORD=password            // change password
DB_NAME=database                // change database name
DB_PORT=5432
DB_DEFAULT_ROLE=user
JWT_ACCESS_TOKEN_SECRET=secret  // change the secret
JWT_REFRESH_TOKEN_SECRET=secret // change the secret
IS_PRODUCTION=false             // set to true for production
```

### Frontend directory

```
REACT_APP_API_BASE_URL=http://localhost:8000 // change for production
```

## AI Use

- Used Claude Sonnet 4.5 to evaluate my user authentication components
- Used Claude Sonnet 4.5 to suggest a recommended structure for Go backend to improve the maintainability and scalability of the backend
- Used Claude Sonnet 4.5 to suggest a template README.md for a project which uses React for frontend and Golang for backend.
