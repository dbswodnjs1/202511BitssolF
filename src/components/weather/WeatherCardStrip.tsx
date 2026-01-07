import WeatherCard, { type WeatherCardProps } from './WeatherCard'

interface WeatherCardStripProps {
    items: WeatherCardProps[]
}

// 오늘 날씨 카드 가로 스크롤 리스트
function WeatherCardStrip({ items }: WeatherCardStripProps) {
    return (
        <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 g-2">
            {items.map((item, idx) => (
                <div className="col" key={`${item.secondaryText}-${idx}`}>
                    <WeatherCard {...item} />
                </div>
            ))}
        </div>
    )
}

export default WeatherCardStrip
