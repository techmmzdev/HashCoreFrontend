// src/pages/admin/DashboardPage.jsx (CORREGIDO PARA DARK MODE)
import { TrendingUp, Users, DollarSign, Activity } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const DashboardClientPage = () => {
  // Hook para detectar si el tema oscuro está activo (asumiendo que estás usando el hook de un contexto)
  // NOTA: Para un entorno real, necesitarías un hook o estado para saber si el modo oscuro está activo.
  // Aquí usaremos una variable booleana que debes reemplazar por tu lógica de tema.
  const isDarkMode = document.documentElement.classList.contains("dark");

  // Colores y estilos condicionales para Recharts
  const axisColor = isDarkMode ? "#9ca3af" : "#374151"; // gray-400 / gray-700
  const gridStroke = isDarkMode ? "#374151" : "#e5e7eb"; // gray-700 / gray-200

  // Datos para los gráficos
  const salesData = [
    { mes: "Ene", ventas: 4000, usuarios: 2400 },
    { mes: "Feb", ventas: 3000, usuarios: 1398 },
    { mes: "Mar", ventas: 2000, usuarios: 9800 },
    { mes: "Abr", ventas: 2780, usuarios: 3908 },
    { mes: "May", ventas: 1890, usuarios: 4800 },
    { mes: "Jun", ventas: 2390, usuarios: 3800 },
  ];

  const categoryData = [
    { name: "Tecnología", value: 400 },
    { name: "Deportes", value: 300 },
    { name: "Noticias", value: 300 },
    { name: "Entretenimiento", value: 200 },
  ];

  const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b"]; // Índigo, Púrpura, Rosa, Naranja

  const stats = [
    {
      name: "Total Ventas",
      value: "45,231",
      change: "+20.1%",
      icon: DollarSign,
      color: "bg-blue-500",
      changeColor: "text-green-600 dark:text-green-400",
    },
    {
      name: "Usuarios Activos",
      value: "2,345",
      change: "+12.5%",
      icon: Users,
      color: "bg-green-500",
      changeColor: "text-green-600 dark:text-green-400",
    },
    {
      name: "Crecimiento",
      value: "34.5%",
      change: "+4.3%",
      icon: TrendingUp,
      color: "bg-purple-500",
      changeColor: "text-green-600 dark:text-green-400",
    },
    {
      name: "Conversión",
      value: "8.2%",
      change: "+1.2%",
      icon: Activity,
      color: "bg-orange-500",
      changeColor: "text-green-600 dark:text-green-400",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {/* 👈 DARK MODE */}
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {/* 👈 DARK MODE */}
          Bienvenido al panel de administración
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300 dark:border dark:border-gray-700"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className={`shrink-0 ${stat.color} rounded-md p-3`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        {/* 👈 DARK MODE */}
                        {stat.name}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                          {/* 👈 DARK MODE */}
                          {stat.value}
                        </div>
                        <div
                          className={`ml-2 flex items-baseline text-sm font-semibold ${stat.changeColor}`}
                        >
                          {stat.change}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          {/* 👈 DARK MODE */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {/* 👈 DARK MODE */}
            Ventas y Usuarios Mensuales
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              {/* Ajuste de color para la rejilla */}
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              {/* Ajuste de color para los ejes y etiquetas */}
              <XAxis
                dataKey="mes"
                stroke={axisColor}
                tick={{ fill: axisColor }}
              />
              <YAxis stroke={axisColor} tick={{ fill: axisColor }} />
              {/* Ajuste de estilo para Tooltip, que a menudo requiere un componente personalizado o tema */}
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? "#1f2937" : "#fff",
                  border: `1px solid ${gridStroke}`,
                  borderRadius: "4px",
                }}
                labelStyle={{ color: axisColor }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="ventas"
                stroke="#6366f1"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="usuarios"
                stroke="#8b5cf6"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          {/* 👈 DARK MODE */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {/* 👈 DARK MODE */}
            Comparativa Mensual
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis
                dataKey="mes"
                stroke={axisColor}
                tick={{ fill: axisColor }}
              />
              <YAxis stroke={axisColor} tick={{ fill: axisColor }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? "#1f2937" : "#fff",
                  border: `1px solid ${gridStroke}`,
                  borderRadius: "4px",
                }}
                labelStyle={{ color: axisColor }}
              />
              <Legend />
              <Bar dataKey="ventas" fill="#6366f1" />
              <Bar dataKey="usuarios" fill="#ec4899" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          {/* 👈 DARK MODE */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {/* 👈 DARK MODE */}
            Distribución por Categoría
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              {/* Tooltip con estilos condicionales */}
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? "#1f2937" : "#fff",
                  border: `1px solid ${gridStroke}`,
                  borderRadius: "4px",
                }}
                labelStyle={{ color: axisColor }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          {/* 👈 DARK MODE */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {/* 👈 DARK MODE */}
            Actividad Reciente
          </h3>
          <div className="space-y-4">
            {[
              {
                action: "Nueva publicación creada",
                time: "Hace 5 minutos",
                color: "bg-blue-500",
              },
              {
                action: "Reporte generado",
                time: "Hace 1 hora",
                color: "bg-green-500",
              },
              {
                action: "Usuario registrado",
                time: "Hace 2 horas",
                color: "bg-purple-500",
              },
              {
                action: "Publicación editada",
                time: "Hace 3 horas",
                color: "bg-orange-500",
              },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${item.color} rounded-full`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {/* 👈 DARK MODE */}
                    {item.action}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {item.time}
                  </p>
                  {/* 👈 DARK MODE */}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardClientPage;
