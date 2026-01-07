import HomeIndicatorIcon from '../../assets/icons/home_indicator.svg'

// 화면 하단 홈 인디케이터 (iOS 홈 바)
function HomeIndicator() {
    return (
        <div className="d-flex justify-content-center py-2">
            <img src={HomeIndicatorIcon} alt="Home indicator" className="img-fluid" />
        </div>
    )
}

export default HomeIndicator
