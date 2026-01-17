// 게시글 상세 페이지

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getBoardDetail, deleteBoard } from '../../api/boardApi'
import LikeButton from '../../components/board/LikeButton'
import VoteSection from '../../components/board/VoteSection'
import CommentList from '../../components/board/CommentList'
import BottomNav from '../../components/layout/BottomNav'
import { formatTimeAgo } from '../../utils/time'
import type { Board } from '../../types/board'
import './Board.css'

type CategoryType = 'free' | 'daily' | 'recommend' | 'question' | 'vote'

const CATEGORY_LABEL_MAP: Record<CategoryType, string> = {
    free: '자유게시판',
    daily: '일상',
    recommend: '추천',
    question: '질문',
    vote: '투표',
}

function BoardDetail() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [board, setBoard] = useState<Board | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const loadBoard = async () => {
        if (!id) return
        setIsLoading(true)
        try {
            const data = await getBoardDetail(Number(id))
            setBoard(data)
        } catch (error) {
            console.error('게시글 조회 실패:', error)
            alert('게시글을 불러오는데 실패했습니다.')
            navigate('/board')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadBoard()
    }, [id])

    const handleDelete = async () => {
        if (!board || !confirm('게시글을 삭제하시겠습니까?')) return

        try {
            await deleteBoard(board.boardId)
            alert('게시글이 삭제되었습니다.')
            navigate('/board')
        } catch {
            alert('게시글 삭제에 실패했습니다.')
        }
    }

    // const formatDate = (dateString: string) => {
    //     const date = new Date(dateString)
    //     return date.toLocaleString('ko-KR', {
    //         year: 'numeric',
    //         month: '2-digit',
    //         day: '2-digit',
    //         hour: '2-digit',
    //         minute: '2-digit',
    //     })
    // }

    if (isLoading) {
        return (
            <div className="home-screen">
                <div className="board-loading">게시글을 불러오는 중...</div>
            </div>
        )
    }

    if (!board) return null

    return (


        <div className="home-screen">
            <div className="board-header">
                <button className="board-header__back-btn" onClick={() => navigate('/board')}>
                    ← 목록
                </button>
                <div className="board-header__actions">
                    <button
                        className="board-header__btn"
                        onClick={() =>
                            board.category === 'vote'
                                ? navigate(`/board/${board.boardId}/vote/edit`)
                                : navigate(`/board/${board.boardId}/edit`)
                        }
                    >
                        수정
                    </button>
                    <button className="board-header__btn" onClick={handleDelete}>
                        삭제
                    </button>
                </div>
            </div>

            <main className="home-screen__content">
                <div className="bottom-panel">
                    <div className="bottom-panel__content">
                        <div className="board-detail">
                            <div className="board-detail__header">
                                {/* 카테고리 */}
                                <span className="board-detail__category">
                                    {CATEGORY_LABEL_MAP[board.category as CategoryType] ?? board.category}
                                </span>

                                {/* 🔹 작성자 닉네임 (프로필 이미지 없이) */}
                                <div className="board-detail__author">
                                    <span className="board-detail__writer">
                                        {board.writer}
                                    </span>
                                </div>

                                {/* 제목 */}
                                <h1 className="board-detail__title">
                                    {board.title}
                                </h1>
                                <span className="board-detail__date board-detail__date--absolute">
                                    {formatTimeAgo(board.createdAt)}
                                </span>


                                {/* 날짜 / 조회수
                                <div className="board-detail__meta">
                                    <span className="board-detail__date">
                                        {formatDate(board.createdAt)}
                                    </span>
                                    <span className="board-detail__views">
                                        조회 {board.viewCount}
                                    </span>
                                </div> */}
                            </div>
                            {board.imageUrl && (
                                <div className="board-detail__image">
                                    <img src={board.imageUrl} alt={board.title} />
                                </div>
                            )}

                            <div className="board-detail__content">
                                <p>{board.content}</p>
                            </div>

                            <div className="board-detail__actions">
                                <LikeButton
                                    targetType="board"
                                    targetId={board.boardId}
                                    initialLikeCount={board.likeCount}
                                    initialLikedByUser={board.likedByUser}
                                />

                                <div className="board-detail__comment-count">
                                    💬 {board.commentCount}
                                </div>
                            </div>

                            {board.voteOptions && board.voteOptions.length > 0 && (
                                <VoteSection
                                    voteOptions={board.voteOptions}
                                    isVotedByUser={board.isVotedByUser}
                                    onVoteSuccess={loadBoard}
                                />
                            )}

                            <div className="board-detail__nav">
                                {board.prevId && (
                                    <button
                                        className="board-detail__nav-btn"
                                        onClick={() => navigate(`/board/${board.prevId}`)}
                                    >
                                        ← 이전글
                                    </button>
                                )}
                                {board.nextId && (
                                    <button
                                        className="board-detail__nav-btn"
                                        onClick={() => navigate(`/board/${board.nextId}`)}
                                    >
                                        다음글 →
                                    </button>
                                )}
                            </div>

                            <CommentList boardId={board.boardId} />
                        </div>
                    </div>
                    <div className="bottom-nav-fixed">
                        <BottomNav />
                    </div>
                </div>
            </main>
        </div>
    )
}

export default BoardDetail