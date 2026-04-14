@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title SkinMetrics Project Menu

:menu
cls
echo ===============================================================
echo                SkinMetrics - PROEKT MENU
echo ===============================================================
echo.
echo [Podgotovka]
echo   1. npm install                   - ustanovit zavisimosti
echo   2. Create .env                   - kopiya iz .env.example
echo.
echo [Docker / PostgreSQL]
echo   3. Docker up                     - docker compose up -d
echo   4. Docker down                   - docker compose down
echo   5. Docker status                 - docker ps
echo.
echo [Prisma / Baza]
echo   6. Prisma generate               - npm run db:generate
echo   7. Prisma migrate dev            - npm run db:migrate
echo   8. Prisma db push                - npm run db:push
echo   9. Prisma migrate status         - npx prisma migrate status
echo  10. Prisma seed                   - npm run db:seed
echo  11. Prisma Studio                 - open in new window
echo.
echo [Run]
echo  12. DEV server                    - npm run dev (new window)
echo  13. PROD server                   - build + start (new window)
echo.
echo [Checks]
echo  14. Lint                          - npm run lint
echo  15. Tests                         - npm run test
echo  16. E2E tests                     - npm run test:e2e
echo  17. Build                         - npm run build
echo.
echo [Scenarios]
echo  18. Quick start                   - docker up + generate + db push + dev
echo  19. Full check                    - lint + test + build
echo  20. Environment diagnostics       - check Node/NPM/Docker/.env/port 5432
echo.
echo [Help]
echo  21. Show usage guide
echo.
echo   0. Exit
echo.
set /p choice=Vyberi punkt: 

if "%choice%"=="1" goto install_deps
if "%choice%"=="2" goto copy_env
if "%choice%"=="3" goto docker_up
if "%choice%"=="4" goto docker_down
if "%choice%"=="5" goto docker_status
if "%choice%"=="6" goto db_generate
if "%choice%"=="7" goto db_migrate
if "%choice%"=="8" goto db_push
if "%choice%"=="9" goto db_migrate_status
if "%choice%"=="10" goto db_seed
if "%choice%"=="11" goto db_studio
if "%choice%"=="12" goto dev_server
if "%choice%"=="13" goto prod_server
if "%choice%"=="14" goto lint
if "%choice%"=="15" goto test
if "%choice%"=="16" goto test_e2e
if "%choice%"=="17" goto build
if "%choice%"=="18" goto quick_start
if "%choice%"=="19" goto full_check
if "%choice%"=="20" goto diagnostics
if "%choice%"=="21" goto help
if "%choice%"=="0" goto end

echo.
echo ERROR: unknown option.
pause
goto menu

:install_deps
cls
echo [1] npm install
call npm install
pause
goto menu

:copy_env
cls
echo [2] create .env from .env.example
if exist ".env" (
  echo .env already exists. Skip.
) else (
  copy ".env.example" ".env" >nul
  echo .env created.
)
pause
goto menu

:docker_up
cls
echo [3] docker compose up -d
docker compose up -d
pause
goto menu

:docker_down
cls
echo [4] docker compose down
docker compose down
pause
goto menu

:docker_status
cls
echo [5] docker ps
docker ps --format "table {{.Names}}\t{{.Status}}"
pause
goto menu

:db_generate
cls
echo [6] npm run db:generate
call npm run db:generate
pause
goto menu

:db_migrate
cls
echo [7] npm run db:migrate
call npm run db:migrate
pause
goto menu

:db_push
cls
echo [8] npm run db:push
call npm run db:push
pause
goto menu

:db_migrate_status
cls
echo [9] npx prisma migrate status
call npx prisma migrate status
pause
goto menu

:db_seed
cls
echo [10] npm run db:seed
call npm run db:seed
pause
goto menu

:db_studio
cls
echo [11] Prisma Studio (new window)
start "SkinMetrics Prisma Studio" cmd /k "cd /d ""%~dp0"" && npm run db:studio"
pause
goto menu

:dev_server
cls
echo [12] DEV server (new window)
start "SkinMetrics DEV" cmd /k "cd /d ""%~dp0"" && npm run dev"
pause
goto menu

:prod_server
cls
echo [13] Build + Start (new window)
call npm run build
if errorlevel 1 goto command_failed
start "SkinMetrics PROD" cmd /k "cd /d ""%~dp0"" && npm run start"
pause
goto menu

:lint
cls
echo [14] npm run lint
call npm run lint
pause
goto menu

:test
cls
echo [15] npm run test
call npm run test
pause
goto menu

:test_e2e
cls
echo [16] npm run test:e2e
echo NOTE: ensure app is running at http://127.0.0.1:3000
call npm run test:e2e
pause
goto menu

:build
cls
echo [17] npm run build
call npm run build
pause
goto menu

:quick_start
cls
echo [18] Quick start
echo Step 1/4: docker compose up -d
docker compose up -d
if errorlevel 1 goto command_failed
echo Step 2/4: npm run db:generate
call npm run db:generate
if errorlevel 1 goto command_failed
echo Step 3/4: npm run db:push
call npm run db:push
if errorlevel 1 goto command_failed
echo Step 4/4: start dev server
start "SkinMetrics DEV" cmd /k "cd /d ""%~dp0"" && npm run dev"
echo Done.
pause
goto menu

:full_check
cls
echo [19] Full check
echo Step 1/3: lint
call npm run lint
if errorlevel 1 goto command_failed
echo Step 2/3: test
call npm run test
if errorlevel 1 goto command_failed
echo Step 3/3: build
call npm run build
if errorlevel 1 goto command_failed
echo All checks passed.
pause
goto menu

:diagnostics
cls
echo [20] Environment diagnostics
echo ---------------------------------------------------------------
echo CWD: %CD%
echo.
echo [Node]
where node
node -v
echo.
echo [NPM]
where npm
npm -v
echo.
echo [Docker]
where docker
docker --version
echo.
echo [Docker compose]
docker compose version
echo.
echo [.env]
if exist ".env" (
  echo .env exists
) else (
  echo .env NOT FOUND
)
echo.
echo [Postgres port 5432]
powershell -NoProfile -Command "try { $r=Test-NetConnection -ComputerName localhost -Port 5432 -WarningAction SilentlyContinue; if($r.TcpTestSucceeded){'Port 5432: OPEN'} else {'Port 5432: CLOSED'} } catch { 'Port 5432: UNKNOWN' }"
echo.
echo [Docker containers]
docker ps --format "table {{.Names}}\t{{.Status}}"
echo ---------------------------------------------------------------
pause
goto menu

:help
cls
echo [21] Usage guide
echo.
echo First run:
echo   1 ^> 2 ^> 3 ^> 6 ^> 8 ^> 12
echo.
echo Daily run:
echo   3 ^> 12
echo.
echo Before commit:
echo   14 ^> 15 ^> 17
echo.
echo One-click option:
echo   18
echo.
pause
goto menu

:command_failed
echo.
echo ERROR: command failed. See output above.
pause
goto menu

:end
endlocal
exit /b 0
