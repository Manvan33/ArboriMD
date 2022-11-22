#!/bin/bash
if [ -d .venv ]; then
    source .venv/bin/activate
else
    python3 -m venv .venv
    source .venv/bin/activate
fi

pip install -r requirements.txt
gunicorn -w 4 -b 0.0.0.0:5000 "main:app"