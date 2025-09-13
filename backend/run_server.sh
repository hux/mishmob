#!/bin/bash

# Activate virtual environment
source venv/bin/activate

# Run Django development server on port 9000
echo "Starting Django server on port 9000..."
python manage.py runserver 9000