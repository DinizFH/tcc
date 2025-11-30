@echo off
REM Define o título da janela do prompt
title Executando Prebuild e Run:android

echo.
echo 🚀 Iniciando o processo de prebuild do Expo...
echo Comando: npx expo prebuild --clean
echo.

REM 1. Executa o prebuild (limpa as pastas nativas existentes e gera novas)
npx expo prebuild --clean

REM Verifica se o comando anterior foi bem-sucedido (código de retorno 0)
if %errorlevel% neq 0 (
    echo.
    echo ❌ ERRO: O comando 'npx expo prebuild --clean' falhou!
    echo O processo nao continuara para o 'run:android'.
    echo.
    pause
    exit /b %errorlevel%
)

echo.
echo ✅ Prebuild concluido com sucesso!
echo.