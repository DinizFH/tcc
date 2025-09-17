import { useState } from "react";
import api from "../axios";

export default function ModalCadastroRapidoAluno({ onClose, onAlunoCriado }) {
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    data_nascimento: "",
    email: "",
    whatsapp: ""
  });

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setErro("");
    setSucesso("");

    try {
      const res = await api.post("/auth/cadastro-rapido", formData);
      setSucesso("Aluno cadastrado com sucesso!");
      onAlunoCriado(res.data); // envia o aluno para o componente pai
      onClose(); // fecha o modal
    } catch (err) {
      const msg =
        err.response?.data?.msg || "Erro ao cadastrar aluno. Verifique os dados.";
      setErro(msg);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl">
        <h2 className="text-xl font-bold mb-4">Cadastro Rápido de Aluno</h2>

        <div className="space-y-3">
          <input
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            placeholder="Nome completo"
            className="w-full border rounded px-3 py-2"
          />
          <input
            type="text"
            name="cpf"
            value={formData.cpf}
            onChange={handleChange}
            placeholder="CPF (somente números)"
            className="w-full border rounded px-3 py-2"
          />
          <input
            type="date"
            name="data_nascimento"
            value={formData.data_nascimento}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="E-mail"
            className="w-full border rounded px-3 py-2"
          />
          <input
            type="text"
            name="whatsapp"
            value={formData.whatsapp}
            onChange={handleChange}
            placeholder="WhatsApp (ex: 5567999999999)"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {erro && <p className="text-red-600 mt-3">{erro}</p>}
        {sucesso && <p className="text-green-600 mt-3">{sucesso}</p>}

        <div className="flex justify-end space-x-3 mt-5">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Cadastrar
          </button>
        </div>
      </div>
    </div>
  );
}
