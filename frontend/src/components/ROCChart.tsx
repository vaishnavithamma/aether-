import Plot from 'react-plotly.js';

export default function ROCChart() {
  return (
    <div className="h-48 mt-8 border border-border bg-surface1 rounded-lg overflow-hidden">
      <Plot
        data={[
          {
            x: [0, 0.05, 0.1, 0.2, 0.5, 1],
            y: [0, 0.8, 0.95, 0.98, 0.99, 1],
            type: 'scatter',
            mode: 'lines',
            name: 'Dual-Engine',
            line: { color: '#00e5ff', width: 2 }
          },
          {
            x: [0, 0.1, 0.3, 0.6, 1],
            y: [0, 0.6, 0.8, 0.9, 1],
            type: 'scatter',
            mode: 'lines',
            name: 'RX Baseline',
            line: { color: 'rgba(255,255,255,0.3)', width: 2, dash: 'dash' }
          }
        ]}
        layout={{
          title: { text: 'ROC Curve' },
          margin: { l: 30, r: 10, t: 30, b: 30 },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent',
          font: { color: '#888', family: 'Inter', size: 10 },
          xaxis: { title: { text: 'FPR' }, gridcolor: 'rgba(255,255,255,0.05)', showline: false, zeroline: false },
          yaxis: { title: { text: 'TPR' }, gridcolor: 'rgba(255,255,255,0.05)', showline: false, zeroline: false },
          showlegend: false,
          autosize: true
        }}
        useResizeHandler
        style={{ width: '100%', height: '100%' }}
        config={{ displayModeBar: false }}
      />
    </div>
  );
}
