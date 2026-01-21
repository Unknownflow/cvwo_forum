# pull the base image
FROM golang:1.25.5

# Set destination for COPY
WORKDIR /app

# Download Go modules
COPY go.* ./

# Copy migrations file
COPY ./migrations /migrations

RUN go mod download

# Copy source code
COPY . .

# Build
RUN go build -o main cmd/server/main.go

EXPOSE 8000

# Run
CMD ["go", "run", "./cmd/server/main.go"]