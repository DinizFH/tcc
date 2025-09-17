import React from "react";

export default function ModalVideoExercicio({ videoUrl, onClose }) {
  if (!videoUrl) return null;

  // Função para gerar o link correto de incorporação
  const gerarLinkEmbed = (url) => {
    try {
      if (!url) return null;

      // Caso seja um link padrão do YouTube
      if (url.includes("watch?v=")) {
        const videoId = url.split("watch?v=")[1].split("&")[0];
        return `https://www.youtube.com/embed/${videoId}?rel=0`;
      }

      // Caso seja um link encurtado do YouTube (https://youtu.be/ID)
      if (url.includes("youtu.be")) {
        const videoId = url.split("youtu.be/")[1].split("?")[0];
        return `https://www.youtube.com/embed/${videoId}?rel=0`;
      }

      // Caso já seja um link de embed ou outro player válido
      return url;
    } catch (err) {
      console.error("Erro ao processar URL do vídeo:", err);
      return null;
    }
  };

  const embedUrl = gerarLinkEmbed(videoUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-white p-4 rounded-xl shadow-xl w-full max-w-2xl relative">
        {/* Botão de fechar */}
        <button
          className="absolute top-2 right-2 text-red-600 text-xl hover:text-red-800 transition"
          onClick={onClose}
        >
          ✖
        </button>

        {/* Título */}
        <h2 className="text-xl font-semibold mb-3 text-gray-800">Vídeo do Exercício</h2>

        {/* Player de vídeo */}
        <div className="aspect-video w-full rounded-lg overflow-hidden">
          {embedUrl ? (
            <iframe
              className="w-full h-full rounded"
              src={embedUrl}
              title="Vídeo do exercício"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <p className="text-center text-red-600 font-medium">
              Não foi possível carregar o vídeo.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
