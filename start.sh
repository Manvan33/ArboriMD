#!/bin/bash
if [ -d .venv ]; then
    source .venv/bin/activate
else
    python3.10 -m venv .venv
    source .venv/bin/activate
fi

pip install -r requirements.txt
gunicorn -w 4 --error-logfile "-" --access-logfile "-" -b 0.0.0.0:5000 "main:app"
