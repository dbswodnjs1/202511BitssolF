import StatusBar from '../components/layout/StatusBar'
import BottomNav from '../components/layout/BottomNav'
import BottomPanel from '../components/layout/BottomPanel'
import WeatherCardStrip from '../components/weather/WeatherCardStrip'
import type { WeatherCardProps } from '../components/weather/WeatherCard'
import PartlyCloudyIcon from '../assets/icons/partly_cloudy.svg'
import RainProbabilityGauge from '../components/weather/RainProbabilityGauge'
import WeatherCard from '../components/weather/WeatherCard'
import WeatherCondition from '../components/weather/WeatherCondition'

// 샘플 데이터: 실제 API 연동 시 이 부분만 교체하면 된다.
const weatherCardItems: WeatherCardProps[] = [
    { secondaryText: '27°C', footerText: '11/12', iconSrc: PartlyCloudyIcon },
    { secondaryText: '47°C', footerText: '01/02', iconSrc: PartlyCloudyIcon },
    { secondaryText: '17°C', footerText: '08/31', iconSrc: PartlyCloudyIcon },
    { secondaryText: '25°C', footerText: '07/22', iconSrc: PartlyCloudyIcon },
]

// 홈 화면 조립
function BissolHome() {
    return (
        <div className="container-fluid min-vh-100 d-flex flex-column py-3">
            <StatusBar /> {/* 상단 상태 표시줄, 단순 표시용. 나중에는 자기 스마트폰 상태를 불러와야 함. */}

            <main className="d-flex flex-column flex-grow-1 gap-3">
                <WeatherCard />
                <WeatherCondition condition="partly-cloudy" temperature={27} />
                <RainProbabilityGauge value={55} />
                <BottomPanel>
                    <WeatherCardStrip items={weatherCardItems} />
                    <div className="pt-2">
                        <BottomNav />
                    </div>
                </BottomPanel>
            </main>
        </div>
    )
}

export default BissolHome
