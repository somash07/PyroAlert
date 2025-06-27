const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ElementType;
  description: string;
  color: string;
}> = ({ title, value, icon: Icon, description, color }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <Icon className={`w-5 h-5 ${color}`} />
    </div>
    <p className="text-3xl font-bold text-gray-800">{value}</p>
    <p className="text-xs text-gray-400 mt-1">{description}</p>
  </div>
);

export default StatCard
