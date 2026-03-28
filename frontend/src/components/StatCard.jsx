const StatCard = ({ title, value, hint }) => (
  <div className="card">
    <p className="text-sm text-slate-500">{title}</p>
    <h3 className="text-2xl font-bold mt-1">{value}</h3>
    {hint ? <p className="text-xs text-slate-400 mt-1">{hint}</p> : null}
  </div>
);
export default StatCard;
