import pytest
from app import create_app
import random
import json


def _print_resp(label, resp):
    try:
        body = resp.get_json(silent=True)
    except Exception:
        body = None
    print("\n" + "=" * 90)
    print(f"[{label}] status={resp.status_code} url={getattr(resp, 'request', None) and resp.request.path}")
    if body is not None:
        print(f"[{label}] json={json.dumps(body, ensure_ascii=False)}")
    else:
        print(f"[{label}] raw={resp.data!r}")
    print("=" * 90 + "\n")


class TestRegistroTreino:
    @classmethod
    def setup_class(cls):
        cls.app = create_app()
        cls.client = cls.app.test_client()

        # Identificadores únicos para evitar colisões
        sufixo = str(random.randint(1000, 9999))
        cls.sufixo = sufixo
        cls.email_personal = f"personal_reg{sufixo}@teste.com"
        cls.email_aluno = f"aluno_reg{sufixo}@teste.com"
        cls.nome_plano = f"Plano {sufixo}"
        cls.nome_treino = f"Treino {sufixo}"
        cls.nome_exercicio = f"Supino {sufixo}"

        # Criar personal
        res = cls.client.post("/auth/register", json={
            "nome": "Personal Teste",
            "email": cls.email_personal,
            "senha": "123456",
            "tipo_usuario": "personal",
            "cref": f"CREF{sufixo}"
        })
        _print_resp("register_personal", res)

        # Criar aluno
        res = cls.client.post("/auth/register", json={
            "nome": "Aluno Teste",
            "email": cls.email_aluno,
            "senha": "123456",
            "tipo_usuario": "aluno"
        })
        _print_resp("register_aluno", res)

        # Logins
        res = cls.client.post("/auth/login", json={
            "email": cls.email_personal, "senha": "123456"
        })
        _print_resp("login_personal", res)
        cls.token_personal = res.get_json()["access_token"]

        res = cls.client.post("/auth/login", json={
            "email": cls.email_aluno, "senha": "123456"
        })
        _print_resp("login_aluno", res)
        cls.token_aluno = res.get_json()["access_token"]

        cls.headers_personal = {"Authorization": f"Bearer {cls.token_personal}"}
        cls.headers_aluno = {"Authorization": f"Bearer {cls.token_aluno}"}

        # Buscar ID do aluno (a rota não traz e-mail; escolhemos o mais recente pelo MAIOR id)
        res = cls.client.get("/usuarios/alunos", headers=cls.headers_personal)
        _print_resp("get_alunos", res)
        alunos = res.get_json() or []
        assert alunos, "Nenhum aluno retornado por /usuarios/alunos"

        cls.id_aluno = max(alunos, key=lambda a: a.get("id_usuario", 0))["id_usuario"]
        print(f"[setup] id_aluno(selecionado)=#{cls.id_aluno}")
        print("[setup] alunos_dump=" + json.dumps(alunos, ensure_ascii=False))

        # Criar exercício
        payload_ex = {
            "nome": cls.nome_exercicio,
            "grupo_muscular": "Peito",
            "observacoes": "Executar com cuidado",
            "video": ""
        }
        res = cls.client.post("/exercicios/", headers=cls.headers_personal, json=payload_ex)
        _print_resp("create_exercicio", res)
        assert res.status_code in (200, 201)
        cls.id_exercicio = res.get_json()["id_exercicio"]
        print(f"[setup] id_exercicio={cls.id_exercicio}")

        # Criar plano de treino com um treino e um exercício
        payload_plano = {
            "id_aluno": cls.id_aluno,
            "nome_plano": cls.nome_plano,
            "treinos": [
                {
                    "nome_treino": cls.nome_treino,
                    "exercicios": [
                        {"id_exercicio": cls.id_exercicio, "series": 3, "repeticoes": 12, "observacoes": "Carga leve"}
                    ]
                }
            ]
        }
        res = cls.client.post("/treinos/plano", headers=cls.headers_personal, json=payload_plano)
        _print_resp("create_plano", res)
        assert res.status_code in (200, 201), "Falha ao criar plano"
        data_plano = res.get_json()
        cls.id_plano = data_plano.get("id_plano")
        print(f"[setup] id_plano={cls.id_plano}")

        # Buscar treinos do aluno e localizar o id_treino criado
        res = cls.client.get(f"/treinos/aluno/{cls.id_aluno}/detalhes", headers=cls.headers_personal)
        _print_resp("get_treinos_detalhes", res)
        treinos = res.get_json() or []
        assert treinos, "Nenhum treino retornado em /treinos/aluno/<id>/detalhes"
        print("[setup] treinos_detalhes_dump=" + json.dumps(treinos, ensure_ascii=False))

        # 1) tenta por nome do treino
        treino = next((t for t in treinos if t.get("nome_treino") == cls.nome_treino), None)
        # 2) se não achar, tenta por nome do plano
        if treino is None:
            treino = next((t for t in treinos if t.get("nome_plano") == cls.nome_plano), None)
        # 3) fallback: pega o último (geralmente mais novo)
        if treino is None:
            treino = treinos[-1]

        cls.id_treino = treino.get("id_treino")
        print(f"[setup] id_treino={cls.id_treino} (nome_treino='{treino.get('nome_treino')}', nome_plano='{treino.get('nome_plano')}')")

    # =====================================================================
    # Testes
    # =====================================================================

    def test_01_criar_registro_treino_aluno(self):
        """Aluno cria registro (fluxo principal)"""
        payload = {
            "id_plano": self.__class__.id_plano,
            "id_treino": self.__class__.id_treino,
            "observacoes": "Registro feito pelo aluno",
            "cargas": [{"id_exercicio": self.__class__.id_exercicio, "carga": 30}]
        }
        print(f"[test_01] payload_aluno={json.dumps(payload, ensure_ascii=False)}")

        res = self.client.post("/registrostreino/", json=payload, headers=self.__class__.headers_aluno)
        _print_resp("post_registro_aluno", res)

        assert res.status_code == 201, f"Erro ao criar registro: {res.data}"
        self.__class__.id_registro = res.get_json()["id_registro"]
        print(f"[test_01] id_registro={self.__class__.id_registro}")

    def test_02_criar_registro_treino_personal(self):
        """Personal cria registro para o aluno"""
        payload = {
            "id_plano": self.__class__.id_plano,
            "id_treino": self.__class__.id_treino,
            "id_aluno": self.__class__.id_aluno,
            "observacoes": "Registro feito pelo personal",
            "cargas": [{"id_exercicio": self.__class__.id_exercicio, "carga": 40}]
        }
        print(f"[test_02] payload_personal={json.dumps(payload, ensure_ascii=False)}")

        res = self.client.post("/registrostreino/", json=payload, headers=self.__class__.headers_personal)
        _print_resp("post_registro_personal", res)

        assert res.status_code == 201, f"Erro ao criar registro (personal): {res.data}"

    def test_03_listar_registros_aluno(self):
        res = self.client.get("/registrostreino/meus", headers=self.__class__.headers_aluno)
        _print_resp("get_registros_meus", res)
        assert res.status_code == 200
        registros = res.get_json()
        print(f"[test_03] meus_registros_dump={json.dumps(registros, ensure_ascii=False)}")
        assert any(r.get("id_registro") == self.__class__.id_registro for r in registros)

    def test_04_listar_registros_personal(self):
        res = self.client.get("/registrostreino/", headers=self.__class__.headers_personal)
        _print_resp("get_registros_personal", res)
        assert res.status_code == 200
        registros = res.get_json()
        print(f"[test_04] registros_personal_dump={json.dumps(registros, ensure_ascii=False)}")
        assert any(r.get("id_registro") == self.__class__.id_registro for r in registros)

    def test_05_obter_registro_por_id(self):
        res = self.client.get(f"/registrostreino/{self.__class__.id_registro}", headers=self.__class__.headers_aluno)
        _print_resp("get_registro_by_id", res)
        assert res.status_code == 200
        data = res.get_json()
        print(f"[test_05] registro_by_id_dump={json.dumps(data, ensure_ascii=False)}")
        assert data.get("id_registro") == self.__class__.id_registro

    def test_06_atualizar_registro(self):
        payload = {
            "observacoes": "Registro atualizado pelo aluno",
            "cargas": [{"id_exercicio": self.__class__.id_exercicio, "carga": 50}]
        }
        print(f"[test_06] payload_update={json.dumps(payload, ensure_ascii=False)}")

        res = self.client.put(f"/registrostreino/{self.__class__.id_registro}",
                              json=payload,
                              headers=self.__class__.headers_aluno)
        _print_resp("put_registro", res)
        assert res.status_code == 200

    def test_07_listar_registros_apos_update(self):
        res = self.client.get("/registrostreino/meus", headers=self.__class__.headers_aluno)
        _print_resp("get_meus_apos_update", res)
        assert res.status_code == 200
        registros = res.get_json()
        print(f"[test_07] meus_registros_pos_update_dump={json.dumps(registros, ensure_ascii=False)}")
        atualizado = next(r for r in registros if r.get("id_registro") == self.__class__.id_registro)
        assert atualizado.get("observacoes") == "Registro atualizado pelo aluno"

    def test_08_excluir_registro(self):
        res = self.client.delete(f"/registrostreino/{self.__class__.id_registro}", headers=self.__class__.headers_aluno)
        _print_resp("delete_registro", res)
        assert res.status_code == 200

        # Verifica que não está mais ativo
        res2 = self.client.get(f"/registrostreino/{self.__class__.id_registro}", headers=self.__class__.headers_aluno)
        _print_resp("get_registro_depois_delete", res2)
        assert res2.status_code == 404
