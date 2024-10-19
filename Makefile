# Makefile for managing Docker for Vite project

# Variables
DOCKER_COMPOSE = docker-compose
SERVICE_NAME = vite-app

.PHONY: up

# Build the Docker image
build:
	@echo "Building Docker image..."
	$(DOCKER_COMPOSE) build

# Run the application in the background
up: build
	@echo "Starting application..."
	$(DOCKER_COMPOSE) up -d

# Stop and remove the containers
down:
	@echo "Stopping and removing containers..."
	$(DOCKER_COMPOSE) down

# Clean up the Docker images and containers
clean:
	@echo "Cleaning up Docker images and containers..."
	$(DOCKER_COMPOSE) down --rmi all --volumes
