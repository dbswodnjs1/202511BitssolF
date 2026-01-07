// src/components/weather/RainProbabilityGauge.tsx

interface RainProbabilityGaugeProps {
  value: number // 0 ~ 90
}

const ticks = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90]

function clampValue(value: number) {
  return Math.min(90, Math.max(0, value))
}

function RainProbabilityGauge({ value }: RainProbabilityGaugeProps) {
  const clampedValue = clampValue(value)
  const percentage = (clampedValue / 90) * 100

  return (
    <div className="d-flex flex-column gap-2">
      <span className="badge text-bg-primary align-self-start">강수확률 {clampedValue}%</span>

    {/* 채워지는 바 valuenow에 적힌 값이 칠해져서 표현된다. */}
      <div className="progress" style={{ height: '0.75rem' }}>
        <div
          className="progress-bar"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={90}
          aria-valuenow={clampedValue}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="d-flex justify-content-between text-muted small">
        {ticks.map((tick) => (
          <span key={tick}>{tick}</span>
        ))}
      </div>
    </div>
  )
}

export default RainProbabilityGauge
