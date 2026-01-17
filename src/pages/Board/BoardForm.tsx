// 일반 게시글 작성/수정 페이지 (투표 제외)

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getBoardDetail, createBoard, updateBoard } from '../../api/boardApi'
import BottomNav from '../../components/layout/BottomNav'
import type { BoardFormData } from '../../types/board'
import './Board.css'

const CATEGORIES = [
    { value: 'free', label: '자유게시판' },
    { value: 'vote', label: '투표' },        // 🔥 선택 시 전용 폼으로 이동
    { value: 'daily', label: '일상' },
    { value: 'recommend', label: '추천' },
    { value: 'question', label: '질문' },
]

function BoardForm() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const isEditMode = !!id

    const [formData, setFormData] = useState<BoardFormData>({
        title: '',
        content: '',
        category: 'free',
        imageUrl: '',
    })

    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (isEditMode && id) {
            loadBoard()
        }
    }, [id])

    const loadBoard = async () => {
        if (!id) return
        setIsLoading(true)
        try {
            const data = await getBoardDetail(Number(id))
            setFormData({
                title: data.title,
                content: data.content,
                category: data.category,
                imageUrl: data.imageUrl || '',
            })
        } catch (error) {
            console.error('게시글 조회 실패:', error)
            alert('게시글을 불러오는데 실패했습니다.')
            navigate('/board')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.title.trim()) {
            alert('제목을 입력해주세요.')
            return
        }

        if (!formData.content.trim()) {
            alert('내용을 입력해주세요.')
            return
        }

        setIsLoading(true)
        try {
            if (isEditMode && id) {
                await updateBoard(Number(id), formData)
                alert('게시글이 수정되었습니다.')
                navigate(`/board/${id}`)
            } else {
                const newBoard = await createBoard(formData)
                alert('게시글이 작성되었습니다.')
                navigate(`/board/${newBoard.boardId}`)
            }
        } catch {
            alert(isEditMode ? '게시글 수정에 실패했습니다.' : '게시글 작성에 실패했습니다.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="home-screen">
            <div className="board-header">
                <button
                    className="board-header__back-btn"
                    onClick={() => navigate('/board')}
                >
                    ← 취소
                </button>
                <h1 className="board-header__title">
                    {isEditMode ? '게시글 수정' : '게시글 작성'}
                </h1>
            </div>

            <main className="home-screen__content">
                <div className="bottom-panel">
                    <div className="bottom-panel__bg" />
                    <div className="bottom-panel__content">
                        <form className="board-form" onSubmit={handleSubmit}>
                            
                            {/* 카테고리 */}
                            <div className="board-form__group">
                                <label className="board-form__label">카테고리</label>
                                <select
                                    className="board-form__select"
                                    value={formData.category}
                                    onChange={(e) => {
                                        const selected = e.target.value

                                        // 🔥 투표 선택 시 즉시 이동
                                        if (selected === 'vote') {
                                            navigate("/board/vote")
                                            return
                                        }

                                        setFormData({
                                            ...formData,
                                            category: selected,
                                        })
                                    }}
                                    disabled={isLoading}
                                >
                                    {CATEGORIES.map((cat) => (
                                        <option key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* 제목 */}
                            <div className="board-form__group">
                                <label className="board-form__label">제목</label>
                                <input
                                    type="text"
                                    className="board-form__input"
                                    value={formData.title}
                                    onChange={(e) =>
                                        setFormData({ ...formData, title: e.target.value })
                                    }
                                    placeholder="제목을 입력하세요"
                                    disabled={isLoading}
                                />
                            </div>

                            {/* 내용 */}
                            <div className="board-form__group">
                                <label className="board-form__label">내용</label>
                                <textarea
                                    className="board-form__textarea"
                                    value={formData.content}
                                    onChange={(e) =>
                                        setFormData({ ...formData, content: e.target.value })
                                    }
                                    placeholder="내용을 입력하세요"
                                    rows={10}
                                    disabled={isLoading}
                                />
                            </div>

                            {/* 버튼 */}
                            <div className="board-form__actions">
                                <button
                                    type="button"
                                    className="board-form__btn board-form__btn--cancel"
                                    onClick={() => navigate('/board')}
                                    disabled={isLoading}
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    className="board-form__btn board-form__btn--submit"
                                    disabled={isLoading}
                                >
                                    {isLoading ? '처리중...' : isEditMode ? '수정' : '작성'}
                                </button>
                            </div>
                        </form>
                    </div>
                    <BottomNav />
                </div>
            </main>
        </div>
    )
}

export default BoardForm
