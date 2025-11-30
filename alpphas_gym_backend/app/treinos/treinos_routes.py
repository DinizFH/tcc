from flask import Blueprint, request, jsonify, send_file
from flask_cors import cross_origin
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions.db import get_db
from app.utils.jwt import extrair_user_info
from app.utils.logs import registrar_log_envio


from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.lib.colors import Color
from app.extensions.mail import mail
from flask_mail import Message

import json
import os, requests

treinos_bp = Blueprint("treinos", __name__)

def extrair_user_info():
    identidade = get_jwt_identity()
    try:
        return json.loads(identidade) if isinstance(identidade, str) else identidade
    except Exception:
        return {}

# ===============================
# Rotas destinadas para planos de treinos 
# ===============================

# ===============================
# Criar Plano de Treino
# ===============================    
@treinos_bp.route("/plano", methods=["POST"])
@jwt_required()
def criar_plano_de_treinos():
    identidade = extrair_user_info()
    print("DEBUG - Identidade recebida no plano:", identidade)

    if identidade.get("tipo_usuario") != "personal":
        return jsonify({"message": "Apenas personal trainers podem criar planos de treino"}), 403

    data = request.get_json()
    id_aluno = data.get("id_aluno")
    nome_plano = data.get("nome_plano")
    treinos = data.get("treinos")

    if not id_aluno or not nome_plano or not treinos:
        return jsonify({"message": "Campos obrigatórios ausentes"}), 400

    db = get_db()
    try:
        with db.cursor() as cursor:
            # Verifica se o aluno existe
            cursor.execute("SELECT id_usuario FROM usuarios WHERE id_usuario = %s AND tipo_usuario = 'aluno'", (id_aluno,))
            if not cursor.fetchone():
                return jsonify({"message": "Aluno não encontrado"}), 404

            # Cria o plano de treino
            cursor.execute(
                "INSERT INTO planos_treino (id_aluno, nome_plano) VALUES (%s, %s)",
                (id_aluno, nome_plano)
            )
            id_plano = cursor.lastrowid

            for treino in treinos:
                nome_treino = treino.get("nome_treino")
                exercicios = treino.get("exercicios", [])

                if not nome_treino or not exercicios:
                    continue

                # Cria o treino vinculado ao plano
                cursor.execute(
                    "INSERT INTO treinos (id_aluno, id_profissional, nome_treino, objetivo, ativo, id_plano) VALUES (%s, %s, %s, %s, TRUE, %s)",
                    (id_aluno, identidade.get("id"), nome_treino, "", id_plano)
                )
                id_treino = cursor.lastrowid

                for ex in exercicios:
                    cursor.execute("""
                        INSERT INTO treinoexercicios (id_treino, id_exercicio, series, repeticoes, observacoes)
                        VALUES (%s, %s, %s, %s, %s)
                    """, (
                        id_treino,
                        ex.get("id_exercicio"),
                        ex.get("series"),
                        ex.get("repeticoes"),
                        ex.get("observacoes")
                    ))

            db.commit()
            return jsonify({
                "message": "Plano de treino criado com sucesso",
                "id_plano": id_plano
            }), 201

    except Exception as e:
        db.rollback()
        print("Erro ao criar plano de treinos:", e)
        return jsonify({"message": "Erro interno ao criar plano de treino"}), 500

# ===============================
# Excluir Plano de Treino
# ===============================
@treinos_bp.route("/plano/<int:id_plano>", methods=["DELETE"])
@jwt_required()
def excluir_plano_de_treino(id_plano):
    identidade = extrair_user_info()

    if identidade.get("tipo_usuario") != "personal":
        return jsonify({"message": "Apenas personal trainers podem excluir planos de treino"}), 403

    db = get_db()
    try:
        with db.cursor() as cursor:
            # Verifica se o plano existe
            cursor.execute("SELECT id_plano FROM planos_treino WHERE id_plano = %s", (id_plano,))
            if not cursor.fetchone():
                return jsonify({"message": "Plano de treino não encontrado"}), 404

            # Seleciona todos os treinos vinculados ao plano
            cursor.execute("SELECT id_treino FROM treinos WHERE id_plano = %s", (id_plano,))
            treinos = cursor.fetchall()

            # Exclui os exercícios dos treinos
            for treino in treinos:
                cursor.execute("DELETE FROM treinoexercicios WHERE id_treino = %s", (treino["id_treino"],))

            # Exclui os treinos
            cursor.execute("DELETE FROM treinos WHERE id_plano = %s", (id_plano,))

            # Exclui o plano
            cursor.execute("DELETE FROM planos_treino WHERE id_plano = %s", (id_plano,))

            db.commit()
            return jsonify({"message": "Plano de treino excluído com sucesso"}), 200

    except Exception as e:
        db.rollback()
        print("Erro ao excluir plano de treino:", e)
        return jsonify({"message": "Erro interno ao excluir plano de treino"}), 500



# ===============================
# Rotas destinadas para treinos 
# ===============================

# =======================
# Criar novo treino
# =======================
@treinos_bp.route("/", methods=["POST"])
@jwt_required()
def criar_treino():
    identidade = extrair_user_info()
    print("DEBUG - Identidade recebida no treino:", identidade)
    if identidade.get("tipo_usuario") != "personal":
        return jsonify({"message": "Apenas usuários do tipo 'personal' podem criar treinos"}), 403

    data = request.get_json()
    id_aluno = data.get("id_aluno")
    nome_treino = data.get("nome_treino")
    objetivo = data.get("objetivo", "")
    exercicios = data.get("exercicios", [])

    if not all([id_aluno, nome_treino]) or not exercicios:
        return jsonify({"message": "Campos obrigatórios não fornecidos"}), 400

    db = get_db()
    try:
        with db.cursor() as cursor:
            cursor.execute("""
                INSERT INTO treinos (id_aluno, id_profissional, nome_treino, objetivo, ativo)
                VALUES (%s, %s, %s, %s, TRUE)
            """, (id_aluno, identidade.get("id"), nome_treino, objetivo))
            id_treino = cursor.lastrowid

            for ex in exercicios:
                cursor.execute("""
                    INSERT INTO treinoexercicios (id_treino, id_exercicio, series, repeticoes, observacoes)
                    VALUES (%s, %s, %s, %s, %s)
                """, (
                    id_treino,
                    ex.get("id_exercicio"),
                    ex.get("series"),
                    ex.get("repeticoes"),
                    ex.get("observacoes")
                ))

            db.commit()
            return jsonify({
                "message": "Treino criado com sucesso",
                "id_treino": id_treino
            }), 201

    except Exception as e:
        print("Erro ao criar treino:", e)
        return jsonify({"message": "Erro interno"}), 500
    finally:
        db.close()

# ===============================
# Adicionar novo treino a um plano existente
# ===============================
@treinos_bp.route("/adicionar-ao-plano", methods=["POST"])
@jwt_required()
def adicionar_treino_ao_plano():
    identidade = extrair_user_info()
    print("DEBUG - Identidade recebida:", identidade)

    if identidade.get("tipo_usuario") != "personal":
        return jsonify({"message": "Apenas usuários do tipo 'personal' podem adicionar treinos a um plano"}), 403

    data = request.get_json()
    id_plano = data.get("id_plano")
    nome_treino = data.get("nome_treino")
    exercicios = data.get("exercicios", [])

    if not id_plano or not nome_treino or not exercicios:
        return jsonify({"message": "Campos obrigatórios não fornecidos"}), 400

    db = get_db()
    try:
        with db.cursor() as cursor:
            # Verifica se o plano existe e busca o id_aluno
            cursor.execute("""
                SELECT id_aluno FROM planos_treino WHERE id_plano = %s
            """, (id_plano,))
            plano = cursor.fetchone()
            if not plano:
                return jsonify({"message": "Plano de treino não encontrado"}), 404

            id_aluno = plano["id_aluno"]

            # Cria o novo treino vinculado ao plano
            cursor.execute("""
                INSERT INTO treinos (id_aluno, id_profissional, nome_treino, objetivo, ativo, id_plano)
                VALUES (%s, %s, %s, %s, TRUE, %s)
            """, (id_aluno, identidade.get("id"), nome_treino, "", id_plano))
            id_treino = cursor.lastrowid

            # Associa os exercícios ao novo treino
            for ex in exercicios:
                cursor.execute("""
                    INSERT INTO treinoexercicios (id_treino, id_exercicio, series, repeticoes, observacoes)
                    VALUES (%s, %s, %s, %s, %s)
                """, (
                    id_treino,
                    ex.get("id_exercicio"),
                    ex.get("series"),
                    ex.get("repeticoes"),
                    ex.get("observacoes")
                ))

            db.commit()
            return jsonify({
                "message": "Treino adicionado com sucesso ao plano",
                "id_treino": id_treino
            }), 201

    except Exception as e:
        db.rollback()
        print("Erro ao adicionar treino ao plano:", e)
        return jsonify({"message": "Erro interno ao adicionar treino ao plano"}), 500
    finally:
        db.close()

# ===============================
# Excluir treino (inativar)
# ===============================
@treinos_bp.route("/<int:id_treino>", methods=["DELETE"])
@jwt_required()
def excluir_treino(id_treino):
    identidade = extrair_user_info()
    if identidade.get("tipo_usuario") != "personal":
        return jsonify({"message": "Apenas personal pode excluir treinos"}), 403

    db = get_db()
    try:
        with db.cursor() as cursor:
            cursor.execute("UPDATE treinos SET ativo = FALSE WHERE id_treino = %s", (id_treino,))
            db.commit()
            return jsonify({"message": "Treino excluído com sucesso"}), 200
    except Exception as e:
        print("Erro ao excluir treino:", e)
        return jsonify({"message": "Erro interno"}), 500
    finally:
        db.close()

# ===============================
# Rotas destinadas para a listagem de treinos e planso
# ===============================

# =======================
# Obter treino por ID
# =======================
@treinos_bp.route("/<int:id_treino>", methods=["GET"])
@jwt_required()
def obter_treino(id_treino):
    identidade = extrair_user_info()
    if identidade.get("tipo_usuario") != "personal":
        return jsonify({"message": "Apenas personal pode visualizar treinos"}), 403

    db = get_db()
    try:
        with db.cursor() as cursor:
            # Buscar treino
            cursor.execute("""
                SELECT id_treino, nome_treino, id_aluno
                FROM treinos
                WHERE id_treino = %s AND ativo = TRUE
            """, (id_treino,))
            treino = cursor.fetchone()
            if not treino:
                return jsonify({"message": "Treino não encontrado"}), 404

            # Buscar exercícios
            cursor.execute("""
                SELECT te.id_exercicio, e.nome, e.grupo_muscular,
                       te.series, te.repeticoes, te.observacoes
                FROM treinoexercicios te
                JOIN exercicios e ON te.id_exercicio = e.id_exercicio
                WHERE te.id_treino = %s
            """, (id_treino,))
            exercicios = cursor.fetchall()

            treino["exercicios"] = exercicios
            return jsonify(treino), 200

    except Exception as e:
        print("Erro ao obter treino:", e)
        return jsonify({"message": "Erro interno"}), 500
    finally:
        db.close()

# ===============================
# Rotas destinadas para a edição de treinos e planso
# ===============================
# ===============================
# Editar treino
# ===============================
@treinos_bp.route("/<int:id_treino>", methods=["PUT"])
@jwt_required()
def editar_treino(id_treino):
    identidade = extrair_user_info()
    if identidade.get("tipo_usuario") != "personal":
        return jsonify({"message": "Apenas personal pode editar treinos"}), 403

    data = request.get_json()
    nome_treino = data.get("nome_treino")
    exercicios = data.get("exercicios", [])

    db = get_db()
    try:
        with db.cursor() as cursor:
            cursor.execute("""
                UPDATE treinos SET nome_treino = %s WHERE id_treino = %s
            """, (nome_treino, id_treino))

            cursor.execute("DELETE FROM treinoexercicios WHERE id_treino = %s", (id_treino,))
            for ex in exercicios:
                cursor.execute("""
                    INSERT INTO treinoexercicios (id_treino, id_exercicio, series, repeticoes, observacoes)
                    VALUES (%s, %s, %s, %s, %s)
                """, (id_treino, ex["id_exercicio"], ex["series"], ex["repeticoes"], ex["observacoes"]))

            db.commit()
            return jsonify({"message": "Treino atualizado com sucesso"}), 200
    except Exception as e:
        print("Erro ao editar treino:", e)
        return jsonify({"message": "Erro interno"}), 500
    finally:
        db.close()


# ===============================
# Rotas destinadas para a listagem e exibição dos treinos no Dashboard
# ===============================

# ===============================
# Listar treinos por profissional
# ===============================
@treinos_bp.route("/profissional", methods=["GET"])
@jwt_required()
def listar_treinos_por_profissional():
    identidade = extrair_user_info()
    if identidade.get("tipo_usuario") != "personal":
        return jsonify({"message": "Apenas personal pode acessar"}), 403

    nome = request.args.get("nome", "")

    db = get_db()
    try:
        with db.cursor() as cursor:
            cursor.execute("""
                SELECT u.id_usuario, u.nome, u.cpf,
                       t.id_treino, t.nome_treino,
                       pt.nome_plano, t.id_plano
                FROM usuarios u
                JOIN treinos t ON u.id_usuario = t.id_aluno
                LEFT JOIN planos_treino pt ON t.id_plano = pt.id_plano
                WHERE t.id_profissional = %s
                  AND t.ativo = TRUE
                  AND u.nome LIKE %s
                ORDER BY u.nome, pt.nome_plano, t.nome_treino
            """, (identidade.get("id"), f"%{nome}%"))

            dados = cursor.fetchall()

            resposta = {}
            for row in dados:
                uid = row["id_usuario"]
                if uid not in resposta:
                    resposta[uid] = {
                        "id_usuario": uid,
                        "nome": row["nome"],
                        "cpf": row["cpf"],
                        "treinos": []
                    }
                resposta[uid]["treinos"].append({
                    "id_treino": row["id_treino"],
                    "nome_treino": row["nome_treino"],
                    "nome_plano": row["nome_plano"] or "Sem Plano",
                    "id_plano": row["id_plano"]
                })

            return jsonify(list(resposta.values())), 200
    except Exception as e:
        print("Erro ao listar treinos:", e)
        return jsonify({"message": "Erro interno"}), 500
    finally:
        db.close()

# ===============================
# Listar treinos do aluno logado
# ===============================
@treinos_bp.route("/meus", methods=["GET"])
@jwt_required()
def listar_treinos_do_aluno():
    identidade = extrair_user_info()
    if identidade.get("tipo_usuario") != "aluno":
        return jsonify({"message": "Apenas alunos podem acessar"}), 403

    id_aluno = identidade.get("id")

    db = get_db()
    try:
        with db.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    t.id_treino,
                    t.nome_treino,
                    pt.id_plano,
                    pt.nome_plano,
                    u.nome AS nome_profissional
                FROM treinos t
                LEFT JOIN planos_treino pt ON t.id_plano = pt.id_plano
                LEFT JOIN usuarios u ON t.id_profissional = u.id_usuario
                WHERE t.id_aluno = %s AND t.ativo = TRUE
                ORDER BY pt.nome_plano, t.nome_treino
            """, (id_aluno,))
            treinos = cursor.fetchall()
            return jsonify(treinos), 200
    except Exception as e:
        print("Erro ao listar treinos do aluno:", e)
        return jsonify({"message": "Erro interno"}), 500
    finally:
        db.close()

# ===============================
# Listar treinos de um aluno por ID (usado por personal)
# ===============================
@treinos_bp.route("/aluno/<int:id_aluno>/detalhes", methods=["GET"])
@jwt_required()
def obter_detalhes_treinos_completos(id_aluno):
    identidade = extrair_user_info()
    if identidade.get("tipo_usuario") not in ["personal", "aluno"]:
        return jsonify({"message": "Permissão negada"}), 403

    db = get_db()
    try:
        with db.cursor() as cursor:
            # Buscar treinos com plano e profissional
            cursor.execute("""
                SELECT t.id_treino, t.nome_treino, 
                       pt.nome_plano,
                       u.nome AS nome_profissional
                FROM treinos t
                LEFT JOIN planos_treino pt ON t.id_plano = pt.id_plano
                LEFT JOIN usuarios u ON t.id_profissional = u.id_usuario
                WHERE t.id_aluno = %s AND t.ativo = TRUE
            """, (id_aluno,))
            treinos = cursor.fetchall()

            for treino in treinos:
                cursor.execute("""
                    SELECT e.id_exercicio, e.nome, e.grupo_muscular, 
                           te.series, te.repeticoes, te.observacoes
                    FROM treinoexercicios te
                    JOIN exercicios e ON te.id_exercicio = e.id_exercicio
                    WHERE te.id_treino = %s
                """, (treino["id_treino"],))
                treino["exercicios"] = cursor.fetchall()

            return jsonify(treinos), 200
    except Exception as e:
        print("Erro ao buscar treinos detalhados:", e)
        return jsonify({"message": "Erro interno"}), 500
    finally:
        db.close()

# ==================================
# Listagem de treinos com exercicios
# ==================================
@treinos_bp.route("/meus/detalhes", methods=["GET"])
@jwt_required()
def listar_treinos_com_exercicios():
    identidade = extrair_user_info()
    if identidade.get("tipo_usuario") != "aluno":
        return jsonify({"message": "Apenas alunos podem acessar"}), 403

    db = get_db()
    try:
        with db.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    t.id_treino, t.nome_treino,
                    pt.nome_plano,
                    u.nome AS nome_profissional,
                    e.nome AS nome_exercicio,
                    te.series, te.repeticoes
                FROM treinos t
                LEFT JOIN planos_treino pt ON t.id_plano = pt.id_plano
                LEFT JOIN usuarios u ON u.id_usuario = t.id_profissional
                LEFT JOIN treinoexercicios te ON te.id_treino = t.id_treino
                LEFT JOIN exercicios e ON e.id_exercicio = te.id_exercicio
                WHERE t.id_aluno = %s AND t.ativo = TRUE
                ORDER BY pt.nome_plano, t.nome_treino
            """, (identidade.get("id"),))
            rows = cursor.fetchall()

            treinos_por_plano = {}
            for row in rows:
                plano = row["nome_plano"] or "Sem Plano"
                id_treino = row["id_treino"]
                treino_info = {
                    "id_treino": id_treino,
                    "nome_treino": row["nome_treino"],
                    "nome_profissional": row["nome_profissional"],
                    "exercicios": []
                }

                if plano not in treinos_por_plano:
                    treinos_por_plano[plano] = {}

                if id_treino not in treinos_por_plano[plano]:
                    treinos_por_plano[plano][id_treino] = treino_info

                treinos_por_plano[plano][id_treino]["exercicios"].append({
                    "nome": row["nome_exercicio"],
                    "series": row["series"],
                    "repeticoes": row["repeticoes"]
                })

            # Transformar dicts aninhados em listas
            resultado_final = []
            for plano, treinos_dict in treinos_por_plano.items():
                for treino in treinos_dict.values():
                    treino["nome_plano"] = plano
                    resultado_final.append(treino)

            return jsonify(resultado_final), 200

    except Exception as e:
        print("Erro ao listar treinos com exercícios:", e)
        return jsonify({"message": "Erro interno"}), 500
    finally:
        db.close()


# =============================
# Listar planos de treino de um aluno (acesso personal + aluno)
# =============================
@treinos_bp.route("/aluno/<int:id_aluno>/planos", methods=["GET"])
@jwt_required()
def listar_planos_do_aluno(id_aluno):
    user = extrair_user_info()

    # Se for aluno, só pode acessar os próprios planos
    if user["tipo_usuario"] == "aluno":
        if user["id"] != id_aluno:
            return jsonify({"message": "Acesso negado"}), 403

    # Se não for personal nem aluno → nega acesso
    elif user["tipo_usuario"] != "personal":
        return jsonify({"message": "Apenas alunos e personal podem acessar"}), 403

    db = get_db()
    try:
        with db.cursor() as cursor:
            # Buscar planos do aluno
            cursor.execute("""
                SELECT pt.id_plano, pt.nome_plano
                FROM planos_treino pt
                WHERE EXISTS (
                    SELECT 1
                    FROM treinos t
                    WHERE t.id_plano = pt.id_plano
                      AND t.id_aluno = %s
                      AND t.ativo = TRUE
                )
                ORDER BY pt.nome_plano
            """, (id_aluno,))
            planos = cursor.fetchall()

            # Para cada plano, buscar treinos vinculados
            for plano in planos:
                cursor.execute("""
                    SELECT t.id_treino, t.nome_treino
                    FROM treinos t
                    WHERE t.id_plano = %s
                      AND t.id_aluno = %s
                      AND t.ativo = TRUE
                    ORDER BY t.nome_treino
                """, (plano["id_plano"], id_aluno))
                plano["treinos"] = cursor.fetchall()

        print(f"[DEBUG] {user['tipo_usuario']} acessou planos do aluno {id_aluno}: {planos}")
        return jsonify({"planos": planos}), 200

    except Exception as e:
        print("Erro ao listar planos do aluno:", e)
        return jsonify({"message": "Erro ao listar planos do aluno"}), 500


# ===============================
# Rotas destinadas para a obtenção de detalhes de treinos e planos
# ===============================

# ===============================
# Obter detalhes do treino (aluno e personal)
# ===============================
@treinos_bp.route("/<int:id_treino>", methods=["GET"])
@jwt_required()
def detalhes_treino(id_treino):
    identidade = extrair_user_info()
    tipo = identidade.get("tipo_usuario")
    id_user = identidade.get("id")

    db = get_db()
    try:
        with db.cursor() as cursor:
            cursor.execute("""
                SELECT t.id_treino, t.nome_treino, t.id_aluno,
                       u.nome AS nome_aluno, u.cpf AS cpf_aluno,
                       pt.id_plano, pt.nome_plano
                FROM treinos t
                JOIN usuarios u ON u.id_usuario = t.id_aluno
                LEFT JOIN planos_treino pt ON pt.id_plano = t.id_plano
                WHERE t.id_treino = %s AND t.ativo = TRUE
            """, (id_treino,))
            treino = cursor.fetchone()
            if not treino:
                return jsonify({"message": "Treino não encontrado"}), 404

            # Regras de permissão
            if tipo == "aluno" and treino["id_aluno"] != id_user:
                return jsonify({"message": "Acesso negado"}), 403
            if tipo not in ["aluno", "personal"]:
                return jsonify({"message": "Acesso restrito"}), 403

            # Buscar exercícios vinculados ao treino
            cursor.execute("""
                SELECT e.id_exercicio, e.nome AS nome_exercicio, e.grupo_muscular, e.video,
                       te.series, te.repeticoes, te.observacoes
                FROM treinoexercicios te
                JOIN exercicios e ON te.id_exercicio = e.id_exercicio
                WHERE te.id_treino = %s
            """, (id_treino,))
            treino["exercicios"] = cursor.fetchall()

            return jsonify(treino), 200

    except Exception as e:
        print("Erro ao obter treino:", e)
        return jsonify({"message": "Erro interno"}), 500
    finally:
        db.close()


# =============================
# Detalhes de plano de treino
# =============================
@treinos_bp.route("/plano/<int:id_plano>/detalhes", methods=["GET"])
@jwt_required()
def detalhes_plano_treino(id_plano):
    identidade = extrair_user_info()

    db = get_db()
    try:
        with db.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    t.id_treino, t.nome_treino, 
                    e.id_exercicio, e.nome AS nome_exercicio, e.grupo_muscular, e.video,
                    te.series, te.repeticoes, te.observacoes
                FROM treinos t
                JOIN treinoexercicios te ON t.id_treino = te.id_treino
                JOIN exercicios e ON te.id_exercicio = e.id_exercicio
                WHERE t.id_plano = %s AND t.ativo = TRUE
                ORDER BY t.nome_treino, e.nome
            """, (id_plano,))
            dados = cursor.fetchall()

        if not dados:
            return jsonify({"message": "Nenhum treino encontrado para este plano"}), 404

        # Agrupar exercícios por treino
        treinos_agrupados = {}
        for item in dados:
            id_treino = item["id_treino"]
            if id_treino not in treinos_agrupados:
                treinos_agrupados[id_treino] = {
                    "id_treino": id_treino,
                    "nome_treino": item["nome_treino"],
                    "exercicios": []
                }

            treinos_agrupados[id_treino]["exercicios"].append({
                "id_exercicio": item["id_exercicio"],
                "nome": item["nome_exercicio"],
                "grupo_muscular": item["grupo_muscular"],
                "series": item["series"],
                "repeticoes": item["repeticoes"],
                "observacoes": item["observacoes"],
                "video": item["video"]
            })

        return jsonify({
            "plano": {
                "id_plano": id_plano,
                "treinos": list(treinos_agrupados.values())
            }
        }), 200

    except Exception as e:
        print("Erro ao buscar plano de treino:", e)
        return jsonify({"message": "Erro interno ao buscar detalhes do plano"}), 500
    finally:
        db.close()
