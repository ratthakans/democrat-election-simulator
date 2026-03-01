
import { Doughnut } from 'react-chartjs-2'
import './ChartConfig'

interface DoughnutChartProps {
  data: {
    labels: string[]
    datasets: {
      data: number[]
      backgroundColor: string[]
      borderColor?: string[]
      borderWidth?: number
    }[]
  }
}

export default function DoughnutChart({ data }: DoughnutChartProps) {
  return (
    <div className="w-full h-full flex items-center justify-center relative">
      <Doughnut
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                font: { family: 'var(--font-prompt)' },
                usePointStyle: true,
              }
            }
          },
          cutout: '60%',
        }}
      />
    </div>
  )
}
