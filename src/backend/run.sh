#!/bin/bash

# Set MinIO credentials
export MINIO_ROOT_USER="minioadmin"
export MINIO_ROOT_PASSWORD="minioadmin"

# Start the MinIO server
echo "Starting MinIO server with authentication..."
minio server /data &
MINIO_PID=$! # Capture the MinIO process ID

# Wait for MinIO to start
echo "Waiting for MinIO to initialize..."
sleep 5 # Adjust the wait time if necessary

# Start the Go backend
echo "Starting Go backend with gow..."
gow run main.go

# Stop MinIO when the script is stopped
echo "Stopping MinIO server..."
kill $MINIO_PID
