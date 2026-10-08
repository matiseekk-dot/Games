// v1.19.1 - The only recharts pieces the app draws with. Loaded on demand by loadCharts()
// in App.jsx; a named re-export keeps tree-shaking (a bare import('recharts') would pull
// in every chart type).
export { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
