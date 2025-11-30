import os
from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from app import create_app
from app.extensions.db import get_db

# ===========================
# Carrega variáveis do .env
# ===========================
load_dotenv()

# ===========================
# Inicializa aplicação
# ===========================
app = create_app()

# ===========================
# Configurações JWT
# ===========================
app.config['JWT_TOKEN_LOCATION'] = ['headers']
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'supersecret')
app.config['JWT_BLACKLIST_ENABLED'] = True
app.config['JWT_BLACKLIST_TOKEN_CHECKS'] = ['access']

# ===========================
# Inicializa JWT
# ===========================
jwt = JWTManager(app)

@jwt.token_in_blocklist_loader
def verificar_token_revogado(jwt_header, jwt_payload):
    jti = jwt_payload["jti"]
    db = get_db()
    with db.cursor() as cursor:
        cursor.execute("SELECT 1 FROM tokensrevogados WHERE jti = %s", (jti,))
        return cursor.fetchone() is not None

# ===========================
# CORS global (desktop + mobile)
# ===========================
CORS(
    app,
    origins=[
        "http://localhost:5173",   # Frontend desktop (React)
        "http://localhost:8081",   # Expo Web local
        "http://192.168.8.4:8081", # Expo Web via IP local
        "exp://192.168.8.4:8081",  # Expo Go (Android/iOS)
    ],
    supports_credentials=True
)

# ===========================
# Executa localmente
# ===========================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
