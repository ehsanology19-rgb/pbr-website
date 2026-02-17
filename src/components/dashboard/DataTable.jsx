export default function DataTable({ columns, data, keyField = 'id', emptyMessage = 'No data yet.' }) {
  if (!data?.length) {
    return (
      <div className="dashboard-table-wrap">
        <div className="dashboard-empty">{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div className="dashboard-table-wrap">
      <table className="dashboard-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={col.thStyle}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row[keyField]}>
              {columns.map((col) => (
                <td key={col.key} style={col.tdStyle}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
