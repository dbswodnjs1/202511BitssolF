import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react'; 
// ✅ [재원 추가] useRef: 같은 곡 중복 저장 방지용

import { usePlayer } from '../../hooks/usePlayer';
import api from '../../api';
// ✅ [재원 추가] 최근 재생 저장 API
import { recordRecentPlay } from '../../api/mypage';

// 초 단위의 시간을 MM:SS 형식으로 변환하는 헬퍼 함수
const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

function SoundPlayer() {
    const {
        currentSound,
        isPlaying,
        togglePlayPause,
        currentTime,
        duration,
        seekTo
    } = usePlayer();

    const navigate = useNavigate();

    // 즐겨찾기 상태 관리
    const [isFavorite, setIsFavorite] = useState(false);

    // 드래그 중 슬라이더의 값을 관리하기 위한 로컬 상태
    const [sliderValue, setSliderValue] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    // ✅ [재원 추가] 최근 재생 중복 저장 방지용 (같은 곡으로 리렌더링될 때 연속 POST 방지)
    const lastRecordedSoundIdRef = useRef<number | null>(null);

    // ✅ [재원 추가] currentSound가 설정될 때(플레이어 진입/곡 변경 시점) 최근 재생 저장
    useEffect(() => {
        if (!currentSound) return;

        // ✅ [재원 추가] 같은 곡이면 다시 저장하지 않음
        if (lastRecordedSoundIdRef.current === currentSound.soundId) return;
        lastRecordedSoundIdRef.current = currentSound.soundId;

        // ✅ [재원 추가] 실패해도 플레이어 동작은 유지(UX 깨지지 않게)
        recordRecentPlay(currentSound.soundId).catch((e) => {
            console.error('최근 재생 저장 실패:', e);
        });
    }, [currentSound]);

    // 즐겨찾기 상태 확인 (currentSound 바뀔 때마다)
    useEffect(() => {
        if (currentSound) {
            api.get<boolean>(`/v1/sounds/${currentSound.soundId}/favorite`)
                .then(res => setIsFavorite(res.data))
                .catch(() => setIsFavorite(false));
        }
    }, [currentSound]);

    // 즐겨찾기 토글 함수
    const toggleFavorite = async () => {
        if (!currentSound) return;

        try {
            if (isFavorite) {
                await api.delete(`/v1/sounds/${currentSound.soundId}/favorite`);
            } else {
                await api.post(`/v1/sounds/${currentSound.soundId}/favorite`);
            }
            setIsFavorite(!isFavorite);
        } catch (error) {
            console.error('즐겨찾기 처리 실패:', error);
        }
    };

    // 전역 currentTime과 로컬 슬라이더 값을 동기화
    // 단, 사용자가 슬라이더를 드래그하고 있지 않을 때만 수행
    useEffect(() => {
        if (!isDragging) {
            setSliderValue(currentTime);
        }
    }, [currentTime, isDragging]);

    if (!currentSound) {
        return (
            <div className="playerContainer">
                <h2>음악을 선택해주세요.</h2>
                <button onClick={() => navigate(-1)}>뒤로가기</button>
            </div>
        );
    }

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = Number(e.target.value);
        setSliderValue(newValue);

        // 드래그 중이 아니라면 클릭한 것으로 간주하여 즉시 탐색(seek)
        if (!isDragging) {
            seekTo(newValue);
        }
    };

    const handleMouseDown = () => {
        setIsDragging(true);
    };

    const handleMouseUp = (e: React.MouseEvent<HTMLInputElement>) => {
        const newValue = Number(e.currentTarget.value);

        if (isDragging) {
            // 드래그 중이었다가 놓은 상태이므로 최종 값으로 탐색(seek)
            seekTo(newValue);
        }
        setIsDragging(false);
    };

    // 화면에 표시되는 시간은 드래그 동작을 즉시 반영
    const displayedTime = isDragging ? sliderValue : currentTime;

    return (
        <div className="playerContainer">
            {/* 상단 헤더 영역 */}
            <div className="header">
                <button onClick={() => navigate(-1)} className="backButton">
                    &lt; Back
                </button>

                {/* 즐겨찾기 버튼 추가 */}
                <button onClick={toggleFavorite} className="favoriteButton">
                    {isFavorite ? '★' : '☆'}
                </button>
            </div>

            <div className="thumbnailWrapper">
                <img src={currentSound.thumbnailUrl} alt={currentSound.title} className="thumbnail" />
            </div>

            <div className="trackInfo">
                <h2 className="trackTitle">{currentSound.title}</h2>
                <p className="trackArtist">{currentSound.uploader}</p>
            </div>

            <div className="progressContainer">
                <input
                    type="range"
                    value={sliderValue}
                    max={duration || 0}
                    onChange={handleSliderChange}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    className="progressBar"
                />
                <div className="timeLabels">
                    <span>{formatTime(displayedTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            <div className="controls">
                <button className="controlButton">{"<<"}</button>
                <button className="controlButton playPauseButton" onClick={togglePlayPause}>
                    {isPlaying ? "❚❚" : "▶"}
                </button>
                <button className="controlButton">{">>"}</button>
            </div>
        </div>
    );
}

export default SoundPlayer;
