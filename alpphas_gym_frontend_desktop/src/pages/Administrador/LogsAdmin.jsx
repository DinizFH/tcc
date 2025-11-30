import { useEffect, useState } from "react";
import api from "../../axios";
import Layout from "../../components/Layout";
import { FiDownload } from "react-icons/fi";

export default function LogsAdmin() {
  const [logs, setLogs] = useState([]);
  const [tipoLog, setTipoLog] = useState("envio");
  const [filtroTipoEnvio, setFiltroTipoEnvio] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get(`/admin/logs${tipoLog !== "todos" ? `?tipo=${tipoLog}` : ""}`);
        setLogs(res.data);
      } catch (err) {
        console.error("Erro ao buscar logs:", err);
        setErro("Erro ao carregar logs.");
      }
    };
    fetchLogs();
  }, [tipoLog]);

  const safeParse = (str) => {
    try {
      return typeof str === "object" ? str : JSON.parse(str);
    } catch {
      return {};
    }
  };

  const filtrarLogs = () => {
    if (tipoLog !== "envio") return logs;
    return logs.filter((log) => {
      const tipoOk = filtroTipoEnvio ? log.tipo_envio === filtroTipoEnvio : true;
      const statusOk = filtroStatus ? log.status?.toLowerCase().includes(filtroStatus) : true;
      return tipoOk && statusOk;
    });
  };

  const exportarCSV = () => {
    const headers =
      tipoLog === "acao"
        ? ["ID", "Usuário", "Ação", "Detalhes", "Data"]
        : ["ID", "Remetente", "Destinatário", "Tipo", "Destino", "Mensagem", "Status", "Data"];

    const linhas = filtrarLogs().map((log) => {
      if (log.tipo_log === "acao") {
        return [
          log.id_log,
          log.usuario_origem || "-",
          log.acao || "-",
          log.detalhes || "-",
          new Date(log.data).toLocaleString("pt-BR"),
        ].join(";");
      } else {
        const conteudo = safeParse(log.conteudo);
        return [
          log.id_log,
          conteudo.nome_enviante || "Desconhecido",
          log.usuario_destino || "Desconhecido",
          log.tipo_envio,
          log.destino,
          conteudo.mensagem || "-",
          log.status,
          new Date(log.data_envio).toLocaleString("pt-BR"),
        ].join(";");
      }
    });

    const csv = [headers.join(";"), ...linhas].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "logs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">📋 Logs do Sistema</h1>
          <button
            onClick={exportarCSV}
            className="flex items-center gap-2 text-blue-600 border border-blue-600 px-3 py-1 rounded hover:bg-blue-100 text-sm"
          >
            <FiDownload /> Exportar CSV
          </button>
        </div>

        <div className="flex flex-wrap gap-4 mb-4">
          <select
            value={tipoLog}
            onChange={(e) => setTipoLog(e.target.value)}
            className="border px-2 py-1 text-sm"
          >
            <option value="envio">Logs de Envio</option>
            <option value="acao">Logs de Ação</option>
            <option value="todos">Todos</option>
          </select>

          {tipoLog === "envio" && (
            <>
              <select
                value={filtroTipoEnvio}
                onChange={(e) => setFiltroTipoEnvio(e.target.value)}
                className="border px-2 py-1 text-sm"
              >
                <option value="">Tipo de envio</option>
                <option value="email">E-mail</option>
                <option value="whatsapp">WhatsApp</option>
              </select>

              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="border px-2 py-1 text-sm"
              >
                <option value="">Status</option>
                <option value="sucesso">Sucesso</option>
                <option value="falha">Falha</option>
              </select>
            </>
          )}
        </div>

        {erro && <p className="text-red-500">{erro}</p>}

        {filtrarLogs().length === 0 ? (
          <p>Nenhum log encontrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 rounded-lg shadow-sm bg-white text-sm">
              <thead className="bg-gray-100">
                <tr>
                  {tipoLog === "acao" ? (
                    <>
                      <th className="px-4 py-2 border">Usuário</th>
                      <th className="px-4 py-2 border">Ação</th>
                      <th className="px-4 py-2 border">Detalhes</th>
                      <th className="px-4 py-2 border">Data</th>
                    </>
                  ) : (
                    <>
                      <th className="px-4 py-2 border">Remetente</th>
                      <th className="px-4 py-2 border">Destinatário</th>
                      <th className="px-4 py-2 border">Destino</th>
                      <th className="px-4 py-2 border">Tipo</th>
                      <th className="px-4 py-2 border">Mensagem</th>
                      <th className="px-4 py-2 border">Status</th>
                      <th className="px-4 py-2 border">Data</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {filtrarLogs().map((log) => {
                  const conteudo = safeParse(log.conteudo);
                  return tipoLog === "acao" ? (
                    <tr key={log.id_log} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border">{log.usuario_origem || "-"}</td>
                      <td className="px-4 py-2 border">{log.acao}</td>
                      <td className="px-4 py-2 border whitespace-pre-wrap break-words">{log.detalhes}</td>
                      <td className="px-4 py-2 border">{new Date(log.data).toLocaleString("pt-BR")}</td>
                    </tr>
                  ) : (
                    <tr key={log.id_log} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border">{conteudo.nome_enviante || "-"}</td>
                      <td className="px-4 py-2 border">{log.usuario_destino || "-"}</td>
                      <td className="px-4 py-2 border">{log.destino}</td>
                      <td className="px-4 py-2 border">{log.tipo_envio}</td>
                      <td className="px-4 py-2 border whitespace-pre-wrap break-words">{conteudo.mensagem || "-"}</td>
                      <td className={`px-4 py-2 border font-semibold ${
                        log.status?.toLowerCase().includes("sucesso")
                          ? "text-green-600"
                          : "text-red-600"
                      }`}>
                        {log.status}
                      </td>
                      <td className="px-4 py-2 border">{new Date(log.data_envio).toLocaleString("pt-BR")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
