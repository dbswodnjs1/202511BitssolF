// 게시판 목록 페이지

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getBoardList } from '../../api/boardApi'
import Pagination from '../../components/board/Pagination'
import BottomNav from '../../components/layout/BottomNav'
import { formatTimeAgo } from '../../utils/time'
import type { BoardListResponse } from '../../types/board'
import './Board.css'


const CATEGORIES = [
    { value: 'all', label: '전체' },
    { value: 'free', label: '자유게시판' },
    { value: 'vote', label: '투표' },
    { value: 'daily', label: '일상' },
    { value: 'recommend', label: '추천' },
    { value: 'question', label: '질문' },
]
type CategoryType = 'free' | 'daily' | 'recommend' | 'question' | 'vote'

const CATEGORY_LABEL_MAP: Record<CategoryType, string> = {
    free: '자유게시판',
    daily: '일상',
    recommend: '추천',
    question: '질문',
    vote: '투표',
}


function BoardList() {
    const navigate = useNavigate()
    const [boardData, setBoardData] = useState<BoardListResponse | null>(null)
    const [currentCategory, setCurrentCategory] = useState('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [isLoading, setIsLoading] = useState(false)

    const loadBoards = async (category: string, page: number) => {
        setIsLoading(true)
        try {
            const data = await getBoardList(category, page, 10)
            setBoardData(data)
        } catch (error) {
            console.error('게시글 목록 조회 실패:', error)
            alert('게시글 목록을 불러오는데 실패했습니다.')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadBoards(currentCategory, currentPage)
    }, [currentCategory, currentPage])

    const handleCategoryChange = (category: string) => {
        setCurrentCategory(category)
        setCurrentPage(1)
    }

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }


    return (
        <div className="home-screen">
            <div className="board-header">
                <h1 className="board-header__title">커뮤니티</h1>
                <button
                    className="board-header__write-btn"
                    onClick={() => navigate('/board/new')}
                >
                    글쓰기
                </button>
            </div>

            <div className="board-categories">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.value}
                        className={`board-category ${currentCategory === cat.value ? 'active' : ''
                            }`}
                        onClick={() => handleCategoryChange(cat.value)}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            <main className="home-screen__content">
                <div className="bottom-panel">
                    <div className="bottom-panel__content">
                        {isLoading ? (
                            <div className="board-loading">게시글을 불러오는 중...</div>
                        ) : boardData && boardData.boards.length > 0 ? (
                            <>
                                <div className="board-list">
                                    {boardData.boards.map((board) => (
                                        <div
                                            key={board.boardId}
                                            className="board-card"
                                            onClick={() => navigate(`/board/${board.boardId}`)}
                                        >
                                            <div className="board-card__header">
                                                <span className="board-card__category">
                                                    {CATEGORY_LABEL_MAP[board.category as CategoryType] ?? board.category}
                                                </span>

                                                <span className="board-card__date">
                                                    {formatTimeAgo(board.createdAt)}
                                                </span>
                                            </div>
                                            <h3 className="board-card__title">{board.title}</h3>
                                            <p className="board-card__preview">
                                                {board.content.substring(0, 50)}
                                                {board.content.length > 50 ? '...' : ''}
                                            </p>
                                            <div className="board-card__meta">
                                                <span className="board-card__writer">{board.writer}</span>
                                                <div className="board-card__stats">
                                                    <span>👁 {board.viewCount}</span>
                                                    <span>❤️ {board.likeCount}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {boardData.totalPages > 1 && (
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={boardData.totalPages}
                                        onPageChange={handlePageChange}
                                    />
                                )}
                            </>
                        ) : (
                            <div className="board-empty">게시글이 없습니다.</div>
                        )}
                    </div>
                    <div className="bottom-nav-fixed">
                        <BottomNav />
                    </div>
                </div>
            </main>
        </div>
    )
}

export default BoardList
