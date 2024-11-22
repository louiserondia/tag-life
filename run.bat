@echo off
rem Activer l'environnement virtuel
call .\myenv\Scripts\activate

rem Lancer le serveur Django
python .\manage.py runserver
pause