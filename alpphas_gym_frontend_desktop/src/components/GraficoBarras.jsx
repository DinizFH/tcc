import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Legend,
  LabelList,
} from "recharts";

export default function GraficoBarras({ avaliacoes, campo }) {
  const data = avaliacoes.map((a) => ({
    nome: new Date(a.data_avaliacao).toLocaleDateString("pt-BR"),
    valor: parseFloat(a[campo]) || 0,
  }));

  const temDadosValidos = data.some((d) => d.valor > 0);

  if (!temDadosValidos) {
    return (
      <div className="bg-white p-4 shadow rounded">
        <h4 className="text-md font-semibold mb-2">
          {campo.replace(/_/g, " ").toUpperCase()}
        </h4>
        <p className="text-sm text-gray-500">Sem dados disponíveis.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 shadow rounded">
      <h4 className="text-md font-semibold mb-2">
        {campo.replace(/_/g, " ").toUpperCase()}
      </h4>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <XAxis dataKey="nome" />
          <YAxis />
          <Legend />
          <Bar dataKey="valor" fill="#3b82f6">
            {/* 🔹 Força exibir o valor acima da barra */}
            <LabelList
              dataKey="valor"
              position="top"
              fill="#111"
              fontSize={12}
              formatter={(value) => value.toFixed(2)}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
