@echo off
setlocal
title Instalacion de Base de Datos TechAsset

echo ====================================================================
echo  TechAsset - Instalacion Idempotente de Base de Datos PostgreSQL
echo  Innovatech Solutions S.A.C.
echo ====================================================================

set PGPASSWORD=postgres
set PGHOST=localhost
set PGPORT=5432
set PGUSER=postgres

echo 1. Comprobando conexion con PostgreSQL...
psql -h %PGHOST% -p %PGPORT% -U %PGUSER% -c "SELECT 1;" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] No se pudo conectar a PostgreSQL en %PGHOST%:%PGPORT% con usuario %PGUSER%.
    echo Asegurate de que el servicio este iniciado y la clave sea 'postgres'.
    exit /b 1
)

echo 2. Creando base de datos 'techassetdb' si no existe...
psql -h %PGHOST% -p %PGPORT% -U %PGUSER% -tc "SELECT 1 FROM pg_database WHERE datname = 'techassetdb'" | findstr "1" >nul
if %ERRORLEVEL% NEQ 0 (
    psql -h %PGHOST% -p %PGPORT% -U %PGUSER% -c "CREATE DATABASE techassetdb;"
    echo    Base de datos 'techassetdb' creada.
) else (
    echo    Base de datos 'techassetdb' ya existe.
)

echo 3. Ejecutando database/instalar.sql...
psql -h %PGHOST% -p %PGPORT% -U %PGUSER% -d techassetdb -f "%~dp0instalar.sql" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Ocurrio un fallo ejecutando instalar.sql.
    exit /b 1
)

echo.
echo ====================================================================
echo  [EXITO] Base de datos 'techassetdb' configurada correctamente.
echo.
echo  Credenciales de acceso para demostracion:
echo  -------------------------------------------------------------
echo  Administrador:            fabian.gomez@innovatech.pe    / TechAsset2026!
echo  Resp. de Tecnologia:      valeria.rios@innovatech.pe    / TechAsset2026!
echo  Colaborador:              carlos.mendoza@innovatech.pe  / TechAsset2026!
echo  -------------------------------------------------------------
echo ====================================================================
echo.
exit /b 0
