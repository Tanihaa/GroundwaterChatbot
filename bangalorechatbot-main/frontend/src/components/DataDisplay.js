// components/DataDisplay.js
import React from 'react';
import './DataDisplay.css';

function DataDisplay({ data }) {
  // If data is empty or undefined
  if (!data || data.length === 0) {
    return <div className="data-display empty">No data available</div>;
  }

  // Extract column names from the first object
  const columns = Object.keys(data[0]);

  return (
    <div className="data-display">
      <table>
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column, colIndex) => (
                <td key={colIndex}>
                  {row[column] !== null ? row[column].toString() : 'N/A'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataDisplay;