// src/components/weather/WeatherCondition.tsx

import React from 'react'

export type WeatherCondition =
  | 'clear'
  | 'partly-cloudy'
  | 'cloudy'
  | 'rain'
  | 'snow'

interface TodayWeatherProps {
  condition: WeatherCondition
  temperature: number
}

const conditionLabelMap: Record<WeatherCondition, string> = {
  clear: '맑음',
  'partly-cloudy': '구름 조금',
  cloudy: '흐림',
  rain: '비',
  snow: '눈',
}

const conditionIconMap: Record<WeatherCondition, string> = {
  clear: '/icons/weather/sunny.svg',
  'partly-cloudy': '/icons/weather/partly-cloudy.svg',
  cloudy: '/icons/weather/cloudy.svg',
  rain: '/icons/weather/rain.svg',
  snow: '/icons/weather/snow.svg',
}

function TodayWeather({ condition, temperature }: TodayWeatherProps) {
  return (
    <div className="d-flex flex-column align-items-center text-center">

      {/* 상태 텍스트 */}
      <span className="badge rounded-pill bg-light text-dark mb-3 px-3 py-2">
        {conditionLabelMap[condition]}
      </span>

      {/* 아이콘 */}
      <img
        src={conditionIconMap[condition]}
        alt={conditionLabelMap[condition]}
        className="img-fluid mb-3"
        style={{ maxWidth: '160px' }}
      />

      {/* 온도 */}
      <div className="fw-semibold text-white" style={{ fontSize: '3rem' }}>
        {temperature}°C
      </div>

    </div>
  )
}

export default TodayWeather
