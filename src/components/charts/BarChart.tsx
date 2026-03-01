
import { Bar } from 'react-chartjs-2'
import { ChartOptions } from 'chart.js'
import './ChartConfig'

interface BarChartProps {
  data: {
    labels: string[]
    datasets: {
      label?: string
      data: number[]
      backgroundColor: string[] | string
      borderColor?: string
      borderWidth?: number
      tension?: number
    }[]
  }
  options?: ChartOptions<'bar'>
}

export default function BarChart({ data, options }: BarChartProps) {
  return (
    <div className="w-full h-full">
      <Bar
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          ...options,
          plugins: {
            legend: {
              display: false
            },
            ...options?.plugins
          },
          scales: {
            y: {
              beginAtZero: true,
              ...options?.scales?.y
            },
            x: {
              ...options?.scales?.x
            }
          }
        }}
      />
    </div>
  )
}
