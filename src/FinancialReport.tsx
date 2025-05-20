import React from 'react';
import { Chart } from 'react-google-charts';

// Helper to convert snake_case to Title Case
const toTitleCase = (str: string) => {
  if (!str) return '';
  return str
    .replace(/_/g, ' ')
    .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

interface ReportItemData {
  value: number;
  quintile: number;
  content: string;
}

export interface ReportData {
  [key: string]: ReportItemData;
}

interface FinancialReportProps {
  data: ReportData;
}

const FinancialReport: React.FC<FinancialReportProps> = ({ data }) => {
  const reportItems = Object.entries(data);

  return (
    <div className="p-4 sm:p-6 bg-white shadow-xl rounded-lg w-full max-w-4xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold text-sky-900 mb-6 sm:mb-8 text-center">Your Financial Report</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportItems.map(([key, itemData]) => (
          <div key={key} className="p-4 border border-slate-200 rounded-lg shadow-md bg-slate-50 flex flex-col items-center text-center">
            <h3 className="text-lg sm:text-xl font-semibold text-sky-800 mb-3 h-12 flex items-center justify-center">{toTitleCase(key)}</h3>
            <Chart
              width={'100%'}
              height={'180px'}
              chartType="Gauge"
              loader={<div className="flex justify-center items-center h-[180px]">Loading Chart...</div>}
              data={[
                ['Label', 'Value'],
                ['Quintile', itemData.quintile],
              ]}
              options={{
                min: 1, // Quintiles are 1-5
                max: 5,
                redFrom: 1,
                redTo: 2,     // Quintile 1 (value of 1 will be in this range)
                yellowFrom: 2,
                yellowTo: 4,  // Quintiles 2 & 3
                greenFrom: 4,
                greenTo: 5.001, // Quintiles 4 & 5 (use 5.001 to ensure 5 is fully green and included)
                minorTicks: 0, // No minor ticks between 1, 2, 3, 4, 5 as quintiles are whole numbers
                majorTicks: ['1', '2', '3', '4', '5'],
                animation: {
                  duration: 1000,
                  easing: 'out',
                },
              }}
            />
            <p className="text-md sm:text-lg font-medium text-slate-700 mt-3">
              Value: {typeof itemData.value === 'number' ? itemData.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : itemData.value}
            </p>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 px-1 leading-relaxed">
              {itemData.content.split('"&"').map((part, index, array) => (
                <React.Fragment key={index}>
                  {part.trim()}
                  {index < array.length - 1 && <><br /><br /></>} {/* Add more space for paragraph breaks */}
                </React.Fragment>
              ))}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FinancialReport;