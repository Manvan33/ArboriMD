#!/bin/bash

# Script should be executed next to main.py
if [ ! -f main.py ]; then
    echo "Script should be executed next to main.py"
    exit 1
fi
# Script should receive the path of a target folder
if [ $# -ne 1 ]; then
    echo "Please provide the path of a target folder (should be inside a git repository)"
    exit 1
fi
TARGET_FOLDER=$1
# Check that the target folder exists
if [ ! -d $TARGET_FOLDER ]; then
    echo "The provided path is not a folder"
    exit 1
fi
# Check that git commands can be executed in the target folder
if ! git -C $TARGET_FOLDER rev-parse --is-inside-work-tree; then
    echo "The provided path is not a git repository"
    exit 1
fi
# Check if the git repository is clean
if [ -n "$(git -C $TARGET_FOLDER status --porcelain)" ]; then
    echo "The git repository is not clean"
    exit 1
fi

# switch to virtual environment
source .venv/bin/activate
# Generate the backup file
BACKUP_FILE=`python -c 'from main import generate_backup_file; print(generate_backup_file("/tmp"))'`

# Update the git repository
git -C $TARGET_FOLDER pull
# Empty the target folder so notes deleted from the backup are removed as well
rm -rf $TARGET_FOLDER/*
# Extract the backup file
unzip $BACKUP_FILE -d $TARGET_FOLDER
# Add the extracted files to the git repository
git -C $TARGET_FOLDER add .
# Commit the changes
git -C $TARGET_FOLDER commit -m "Updated backup on $(date -I'seconds' | cut -d "+" -f 1)"
# Push the changes
git -C $TARGET_FOLDER push