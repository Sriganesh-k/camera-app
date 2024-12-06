#!/bin/bash

# Set MinIO credentials
export MINIO_ROOT_USER=minioadmin
export MINIO_ROOT_PASSWORD=minioadmin

# Start MinIO server in the background
echo "Starting MinIO server..."
minio server ./data &
MINIO_PID=$!  # Capture the MinIO process ID

# Start Go backend
echo "Starting Go backend..."
go run main.go

# Stop MinIO server after backend stops
echo "Stopping MinIO server..."
kill -9 $MINIO_PID
