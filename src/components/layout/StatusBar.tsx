import StatusBarIcon from '../../assets/icons/status_bar.svg'

// 단순 상태바 래퍼: iOS 스타일 상태바 SVG 표시
function StatusBar() {
    return (
        <div className="d-flex justify-content-end">
            <img src={StatusBarIcon} alt="Status bar" className="img-fluid w-100" />
        </div>
    )
}

export default StatusBar
