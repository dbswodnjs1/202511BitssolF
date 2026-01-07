export interface WeatherCardProps {
    secondaryText?: string
    footerText?: string
    iconSrc?: string
    iconAlt?: string
}

// SVG 비율을 유지한 채 텍스트/아이콘만 덮는 카드
function WeatherCard({ secondaryText, footerText, iconSrc, iconAlt }: WeatherCardProps) {
    return (
        <div className="card h-100 text-center shadow-sm">
            <div className="card-body d-flex flex-column align-items-center gap-2">
                {iconSrc && <img src={iconSrc} alt={iconAlt ?? ''} className="img-fluid w-50" />}
                {secondaryText && <div className="fs-5 fw-semibold text-dark">{secondaryText}</div>}
                {footerText && <div className="small text-muted">{footerText}</div>}
            </div>
        </div>
    )
}

export default WeatherCard
