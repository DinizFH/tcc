from flask import Blueprint, request, jsonify, send_file
from flask_cors import cross_origin
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils.logs import registrar_log_envio
from app.extensions.db import get_db
from app.utils.jwt import extrair_user_info

from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.lib.colors import Color
from io import BytesIO
from app.extensions.mail import mail
from flask_mail import Message
import os, requests


planos_bp = Blueprint("planos", __name__)

# ===============================
# Buscar aluno por nome
# ===============================
@planos_bp.route("/buscar-aluno", methods=["GET"])
@jwt_required()
def buscar_aluno_por_nome():
    identidade = extrair_user_info()
    if identidade.get("tipo_usuario") != "nutricionista":
        return jsonify({"message": "Apenas nutricionistas podem buscar alunos"}), 403

    nome = request.args.get("nome", "").strip()
    if not nome:
        return jsonify({"message": "Parâmetro 'nome' é obrigatório"}), 400

    db = get_db()
    try:
        with db.cursor() as cursor:
            cursor.execute("""
                SELECT id_usuario, nome, cpf, email, whatsapp
                FROM usuarios
                WHERE tipo_usuario = 'aluno' AND nome LIKE %s AND ativo = TRUE
            """, (f"%{nome}%",))
            return jsonify(cursor.fetchall()), 200
    except Exception as e:
        return jsonify({"message": f"Erro ao buscar aluno: {str(e)}"}), 500


# ===============================
# Criar plano alimentar
# ===============================
@planos_bp.route("/", methods=["POST"])
@jwt_required()
def criar_plano():
    identidade = extrair_user_info()
    if identidade.get("tipo_usuario") != "nutricionista":
        return jsonify({"message": "Apenas nutricionistas podem criar planos"}), 403

    data = request.get_json()
    id_aluno = data.get("id_aluno")
    refeicoes = data.get("refeicoes", [])

    if not id_aluno or not refeicoes:
        return jsonify({"message": "Dados obrigatórios ausentes"}), 400

    db = get_db()
    try:
        with db.cursor() as cursor:
            # Verifica se o aluno existe
            cursor.execute(
                "SELECT id_usuario FROM usuarios WHERE id_usuario=%s AND tipo_usuario='aluno'",
                (id_aluno,)
            )
            if not cursor.fetchone():
                return jsonify({"message": "Aluno não encontrado"}), 404

            # Cria plano
            cursor.execute("""
                INSERT INTO planosalimentares (id_aluno, id_nutricionista, ativo)
                VALUES (%s, %s, TRUE)
            """, (id_aluno, identidade["id"]))
            id_plano = cursor.lastrowid

            # Refeições e alimentos
            for r in refeicoes:
                cursor.execute("""
                    INSERT INTO refeicoes (id_plano, titulo, calorias_estimadas)
                    VALUES (%s, %s, %s)
                """, (id_plano, r["titulo"], r["calorias_estimadas"]))
                id_refeicao = cursor.lastrowid

                for alimento in r.get("alimentos", []):
                    nome = str(alimento.get("nome", "")).strip()
                    peso = str(alimento.get("peso", "")).strip()

                    if not nome or not peso:
                        continue

                    cursor.execute("""
                        INSERT INTO alimentos (id_refeicao, nome, peso)
                        VALUES (%s, %s, %s)
                    """, (id_refeicao, nome, peso))

            db.commit()
            return jsonify({"message": "Plano criado com sucesso", "id_plano": id_plano}), 201

    except Exception as e:
        db.rollback()
        print("Erro ao criar plano:", e)
        return jsonify({"message": f"Erro ao criar plano: {str(e)}"}), 500

# ===============================
# Editar plano alimentar
# ===============================
@planos_bp.route("/<int:id_plano>", methods=["PUT"])
@jwt_required()
def editar_plano(id_plano):
    identidade = extrair_user_info()
    if identidade.get("tipo_usuario") != "nutricionista":
        return jsonify({"message": "Apenas nutricionistas podem editar planos"}), 403

    data = request.get_json()
    refeicoes = data.get("refeicoes", [])
    if not refeicoes:
        return jsonify({"message": "Refeições são obrigatórias"}), 400

    db = get_db()
    try:
        with db.cursor() as cursor:
            # verifica se o plano pertence ao nutri logado
            cursor.execute("""
                SELECT id_plano FROM planosalimentares
                WHERE id_plano=%s AND id_nutricionista=%s AND ativo=TRUE
            """, (id_plano, identidade["id"]))
            if not cursor.fetchone():
                return jsonify({"message": "Plano não encontrado ou acesso negado"}), 403

            # apagar refeições/alimentos antigos
            cursor.execute("SELECT id_refeicao FROM refeicoes WHERE id_plano=%s", (id_plano,))
            for ref_ant in cursor.fetchall():
                cursor.execute("DELETE FROM alimentos WHERE id_refeicao=%s", (ref_ant["id_refeicao"],))
            cursor.execute("DELETE FROM refeicoes WHERE id_plano=%s", (id_plano,))

            # inserir novas refeições e alimentos
            for r in refeicoes:
                cursor.execute("""
                    INSERT INTO refeicoes (id_plano, titulo, calorias_estimadas)
                    VALUES (%s, %s, %s)
                """, (id_plano, r["titulo"], r["calorias_estimadas"]))
                id_refeicao = cursor.lastrowid

                for alimento in r.get("alimentos", []):
                    nome = str(alimento.get("nome", "")).strip()
                    peso = str(alimento.get("peso", "")).strip()

                    if not nome or not peso:
                        continue

                    cursor.execute("""
                        INSERT INTO alimentos (id_refeicao, nome, peso)
                        VALUES (%s, %s, %s)
                    """, (id_refeicao, nome, peso))

            db.commit()
            return jsonify({"message": "Plano atualizado com sucesso"}), 200

    except Exception as e:
        db.rollback()
        print("Erro ao editar plano:", e)
        return jsonify({"message": f"Erro ao editar plano: {str(e)}"}), 500

# ===============================
# Listar planos
# ===============================
@planos_bp.route("/", methods=["GET"])
@jwt_required()
def listar_planos():
    identidade = extrair_user_info()
    user_id = identidade["id"]
    tipo = identidade["tipo_usuario"]

    db = get_db()
    try:
        with db.cursor() as cursor:
            base_sql = """
                SELECT 
                    p.id_plano,
                    u1.nome AS nome_aluno,
                    u2.nome AS nome_profissional,
                    p.data_criacao
                FROM planosalimentares p
                JOIN usuarios u1 ON p.id_aluno = u1.id_usuario
                JOIN usuarios u2 ON p.id_nutricionista = u2.id_usuario
                WHERE {FILTRO} AND p.ativo = TRUE
                ORDER BY p.data_criacao DESC
            """

            if tipo == "aluno":
                cursor.execute(base_sql.replace("{FILTRO}", "p.id_aluno = %s"), (user_id,))
            elif tipo == "nutricionista":
                cursor.execute(base_sql.replace("{FILTRO}", "p.id_nutricionista = %s"), (user_id,))
            else:
                return jsonify({"message": "Tipo de usuário não autorizado"}), 403

            return jsonify(cursor.fetchall()), 200
    except Exception as e:
        print("[ERRO] Falha ao listar planos:", e)
        return jsonify({"message": f"Erro ao listar planos: {str(e)}"}), 500

# ===============================
# Desativar plano
# ===============================
@planos_bp.route("/<int:id_plano>", methods=["DELETE"])
@jwt_required()
def excluir_plano(id_plano):
    identidade = extrair_user_info()
    if identidade["tipo_usuario"] != "nutricionista":
        return jsonify({"message": "Apenas nutricionistas podem excluir planos"}), 403

    db = get_db()
    try:
        with db.cursor() as cursor:
            cursor.execute("UPDATE planosalimentares SET ativo=FALSE WHERE id_plano=%s", (id_plano,))
            db.commit()
            return jsonify({"message": "Plano desativado"}), 200
    except Exception as e:
        return jsonify({"message": f"Erro ao desativar plano: {str(e)}"}), 500
    
# ===============================
# Obter detalhes do Plano
# ================================
@planos_bp.route("/<int:id_plano>", methods=["GET"])
@jwt_required()
def obter_plano(id_plano):
    identidade = extrair_user_info()
    db = get_db()
    try:
        with db.cursor() as cursor:
            # Buscar informações principais do plano
            cursor.execute("""
                SELECT 
                    p.id_plano,
                    u1.nome AS nome_aluno,
                    u2.nome AS nome_profissional,
                    p.data_criacao
                FROM planosalimentares p
                JOIN usuarios u1 ON p.id_aluno = u1.id_usuario
                JOIN usuarios u2 ON p.id_nutricionista = u2.id_usuario
                WHERE p.id_plano = %s AND p.ativo = TRUE
            """, (id_plano,))
            plano = cursor.fetchone()

            if not plano:
                return jsonify({"message": "Plano não encontrado"}), 404

            # Buscar refeições do plano
            cursor.execute("""
                SELECT 
                    r.id_refeicao,
                    r.titulo,
                    r.calorias_estimadas
                FROM refeicoes r
                WHERE r.id_plano = %s
                ORDER BY r.id_refeicao ASC
            """, (id_plano,))
            refeicoes = cursor.fetchall()

            # Para cada refeição, buscar alimentos
            for refeicao in refeicoes:
                cursor.execute("""
                    SELECT 
                        a.id_alimento,
                        a.nome,
                        a.peso
                    FROM alimentos a
                    WHERE a.id_refeicao = %s
                    ORDER BY a.id_alimento ASC
                """, (refeicao["id_refeicao"],))
                refeicao["alimentos"] = cursor.fetchall()

            plano["refeicoes"] = refeicoes
            return jsonify(plano), 200

    except Exception as e:
        print("[ERRO] Falha ao obter plano:", e)
        return jsonify({"message": f"Erro ao obter plano: {str(e)}"}), 500



# =======================
# Função auxiliar: detalhamento de plano
# =======================
def detalhar_plano_para_uso(id_plano):
    db = get_db()
    with db.cursor() as cursor:
        cursor.execute("""
            SELECT p.id_aluno,
                   u1.nome AS nome_aluno,
                   u2.nome AS nome_profissional,
                   u2.email, u2.telefone, u2.endereco, u2.crn
            FROM planosalimentares p
            JOIN usuarios u1 ON p.id_aluno = u1.id_usuario
            JOIN usuarios u2 ON p.id_nutricionista = u2.id_usuario
            WHERE p.id_plano = %s
        """, (id_plano,))

        plano = cursor.fetchone()
        if not plano:
            return None

        cursor.execute("SELECT * FROM refeicoes WHERE id_plano = %s", (id_plano,))
        refeicoes = cursor.fetchall()
        for r in refeicoes:
            cursor.execute("SELECT nome, peso FROM alimentos WHERE id_refeicao = %s", (r["id_refeicao"],))
            r["alimentos"] = cursor.fetchall()
        plano["refeicoes"] = refeicoes
        return plano
