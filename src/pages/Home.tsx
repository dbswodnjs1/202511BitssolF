import { useNavigate } from 'react-router-dom'
import StatusBar from '../components/layout/StatusBar'
import BottomNav from '../components/layout/BottomNav'
import BottomPanel from '../components/layout/BottomPanel'
import WeatherCardStrip from '../components/weather/WeatherCardStrip'
import type { WeatherCardProps } from '../components/weather/WeatherCard'
import PartlyCloudyIcon from '../assets/icons/partly_cloudy.svg'

// 샘플 데이터: 실제 API 연동 시 이 부분만 교체하면 된다.
const weatherCardItems: WeatherCardProps[] = [
  { secondaryText: '27°C', footerText: '11/12', iconSrc: PartlyCloudyIcon },
  { secondaryText: '47°C', footerText: '01/02', iconSrc: PartlyCloudyIcon },
  { secondaryText: '17°C', footerText: '08/31', iconSrc: PartlyCloudyIcon },
  { secondaryText: '25°C', footerText: '07/22', iconSrc: PartlyCloudyIcon },
]

// 홈 화면 조립
function Home() {

  return (
    <div className="home-screen">
      <StatusBar /> {/* 상단 상태 표시줄, 단순 표시용. 나중에는 자기 스마트폰 상태를 불러와야 함.  */}

      <main className="home-screen__content">
        <BottomPanel>
          <WeatherCardStrip items={weatherCardItems} />
          
        </BottomPanel>
        <BottomNav />
      </main>

    </div>
  )
}

export default Home
