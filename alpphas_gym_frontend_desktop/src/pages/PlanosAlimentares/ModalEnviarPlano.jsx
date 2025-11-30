import { useState } from "react";
import { FaWhatsapp, FaEnvelope, FaPaperPlane } from "react-icons/fa";
import api from "../../axios";

export default function ModalEnviarPlano({ idPlano, onClose }) {
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");

  const enviar = async (tipo) => {
    setLoading(true);
    setMensagem("");

    try {
      if (tipo === "email") {
        await api.post(`/planos/${idPlano}/enviar`);
        setMensagem("📧 Plano enviado por e-mail com sucesso!");
      } else if (tipo === "whatsapp") {
        await api.post(`/planos/${idPlano}/enviar-whatsapp`);
        setMensagem("📱 Plano enviado via WhatsApp com sucesso!");
      } else if (tipo === "ambos") {
        await api.post(`/planos/${idPlano}/enviar`);
        await api.post(`/planos/${idPlano}/enviar-whatsapp`);
        setMensagem("✅ Plano enviado por e-mail e WhatsApp!");
      }
    } catch (err) {
      console.error("Erro ao enviar plano:", err);
      setMensagem("❌ Erro ao enviar plano. Verifique a conexão ou tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-500 hover:text-gray-700 text-xl"
        >
          ×
        </button>

        <h2 className="text-2xl font-bold text-center mb-3">Enviar Plano Alimentar</h2>
        <p className="text-center text-gray-600 mb-4">Selecione como deseja enviar o plano.</p>

        <div className="flex justify-center gap-6 mb-4">
          <button
            onClick={() => enviar("email")}
            disabled={loading}
            className="flex flex-col items-center bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg transition disabled:opacity-50"
          >
            <FaEnvelope size={28} />
            <span className="mt-2 text-sm">E-mail</span>
          </button>

          <button
            onClick={() => enviar("whatsapp")}
            disabled={loading}
            className="flex flex-col items-center bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg transition disabled:opacity-50"
          >
            <FaWhatsapp size={28} />
            <span className="mt-2 text-sm">WhatsApp</span>
          </button>

          <button
            onClick={() => enviar("ambos")}
            disabled={loading}
            className="flex flex-col items-center bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg transition disabled:opacity-50"
          >
            <FaPaperPlane size={28} />
            <span className="mt-2 text-sm">Ambos</span>
          </button>
        </div>

        {mensagem && (
          <p className="text-center text-sm font-medium text-gray-700 mt-2">{mensagem}</p>
        )}

        {loading && (
          <p className="text-center text-xs text-gray-500 animate-pulse mt-1">Enviando...</p>
        )}
      </div>
    </div>
  );
}
