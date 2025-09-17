import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../axios";
import Layout from "../../components/Layout";

export default function EditarPerfil() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    data_nascimento: "",
    telefone: "",
    whatsapp: "",
    endereco: "",
  });
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [cpfOriginal, setCpfOriginal] = useState(""); // Guardar o CPF original

  // Carrega os dados do perfil ao montar o componente
  useEffect(() => {
    async function carregarPerfil() {
      try {
        const res = await api.get("/usuarios/perfil");
        const perfil = res.data;

        setFormData({
          nome: perfil.nome || "",
          cpf: perfil.cpf || "",
          data_nascimento: perfil.data_nascimento?.split("T")[0] || "",
          telefone: perfil.telefone || "",
          whatsapp: perfil.whatsapp || "",
          endereco: perfil.endereco || "",
        });

        setCpfOriginal(perfil.cpf || ""); // Guarda o CPF atual
        setCarregando(false);
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
        setErro("Erro ao carregar perfil.");
        setCarregando(false);
      }
    }

    carregarPerfil();
  }, []);

  // Atualiza os campos do formulário
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Bloqueia edição do CPF se ele já existir
    if (name === "cpf" && cpfOriginal && value !== cpfOriginal) {
      setErro("O CPF não pode ser alterado após o cadastro.");
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submete os dados para o backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setSucesso("");

    try {
      await api.put("/usuarios/editar", formData);

      setSucesso("Perfil atualizado com sucesso!");
      setTimeout(() => navigate("/perfil"), 2000);
    } catch (err) {
      console.error("Erro ao salvar perfil:", err);

      if (err.response && err.response.status === 403) {
        setErro("O CPF não pode ser alterado após o cadastro.");
      } else {
        setErro("Erro ao salvar perfil. Tente novamente.");
      }
    }
  };

  if (carregando) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-lg font-semibold text-gray-600">
            Carregando dados do perfil...
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded-xl shadow">
        <h2 className="text-2xl font-bold mb-4">Editar Perfil</h2>

        {erro && (
          <p className="text-red-500 mb-4 font-semibold bg-red-100 p-2 rounded">
            {erro}
          </p>
        )}

        {sucesso && (
          <p className="text-green-600 mb-4 font-semibold bg-green-100 p-2 rounded">
            {sucesso}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div>
            <label className="block font-semibold">Nome:</label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className="w-full border rounded p-2"
              required
            />
          </div>

          {/* CPF - Bloqueado se já existir */}
          <div>
            <label className="block font-semibold">CPF:</label>
            <input
              type="text"
              name="cpf"
              value={formData.cpf}
              onChange={handleChange}
              readOnly={!!cpfOriginal} // Impede edição
              placeholder="Digite seu CPF"
              maxLength="14"
              className={`w-full border rounded p-2 ${
                cpfOriginal ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
            />
            {cpfOriginal && (
              <p className="text-xs text-gray-500 mt-1">
                O CPF não pode ser alterado.
              </p>
            )}
          </div>

          {/* Data de Nascimento */}
          <div>
            <label className="block font-semibold">Data de Nascimento:</label>
            <input
              type="date"
              name="data_nascimento"
              value={formData.data_nascimento}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>

          {/* Telefone */}
          <div>
            <label className="block font-semibold">Telefone:</label>
            <input
              type="tel"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              className="w-full border rounded p-2"
              placeholder="(DDD) 99999-9999"
            />
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block font-semibold">WhatsApp:</label>
            <input
              type="tel"
              name="whatsapp"
              value={formData.whatsapp}
              onChange={handleChange}
              className="w-full border rounded p-2"
              placeholder="(DDD) 99999-9999"
            />
          </div>

          {/* Endereço */}
          <div>
            <label className="block font-semibold">Endereço:</label>
            <input
              type="text"
              name="endereco"
              value={formData.endereco}
              onChange={handleChange}
              className="w-full border rounded p-2"
              placeholder="Digite seu endereço"
            />
          </div>

          {/* Botões */}
          <div className="flex items-center gap-4 mt-6">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Salvar
            </button>
            <button
              type="button"
              onClick={() => navigate("/perfil")}
              className="flex-1 bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
