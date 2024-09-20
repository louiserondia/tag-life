import os
import shutil
import subprocess

def remove_directory(dir_path):
    if os.path.exists(dir_path):
        shutil.rmtree(dir_path)
        print(f"Removed directory: {dir_path}")
    else:
        print(f"Directory does not exist: {dir_path}")

def remove_file(file_path):
    if os.path.exists(file_path):
        os.remove(file_path)
        print(f"Removed file: {file_path}")
    else:
        print(f"File does not exist: {file_path}")

def clear_directory(dir_path):
    if os.path.exists(dir_path):
        for filename in os.listdir(dir_path):
            file_path = os.path.join(dir_path, filename)
            if os.path.isfile(file_path) or os.path.islink(file_path):
                os.unlink(file_path)
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path)
        print(f"Cleared directory: {dir_path}")
    else:
        print(f"Directory does not exist: {dir_path}")

def run_django_command(command):
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    if result.returncode == 0:
        print(f"Command '{command}' ran successfully.")
    else:
        print(f"Error running command '{command}': {result.stderr}")

# Paths to remove
directories_to_remove = [
    'apps/main/migrations',
    'apps/main/migrations main',
    'apps/main/__pycache__'
]

file_to_remove = 'db.sqlite3'
uploads_directory = 'media/uploads'

# Remove directories
for directory in directories_to_remove:
    remove_directory(directory)

# Remove the SQLite database file
remove_file(file_to_remove)

# Clear the uploads directory
clear_directory(uploads_directory)

# Run Django commands
django_commands = [
    'python manage.py makemigrations',
    'python manage.py makemigrations main',
    'python manage.py migrate'
]

for command in django_commands:
    run_django_command(command)
