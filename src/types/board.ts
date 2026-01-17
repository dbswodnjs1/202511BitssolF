// 게시판 관련 TypeScript 타입 정의

export interface Board {
  boardId: number
  writer: string
  title: string
  content: string
  category: string
  viewCount: number
  imageUrl?: string
  likeCount: number
  likedByUser: boolean
  voteOptions?: Vote[]
  isVotedByUser: boolean
  createdAt: string
  updatedAt: string
  prevId?: number
  nextId?: number
  commentCount: number
}

export interface BoardListResponse {
  boards: Board[]
  totalPages: number
  currentPage: number
  totalElements: number
}

export interface Comment {
  commentId: number
  userId: number
  boardId: number
  content: string
  writer: string
  isHidden: number
  createdAt: string
  parentId?: number
  children: Comment[]
  likeCount: number
  likedByUser: boolean
}

export interface CommentListResponse {
  comments: Comment[]
  totalPages: number
  currentPage: number
  totalElements: number
}

export interface Vote {
  voteId: number
  boardId: number
  optionText: string
  createdAt: string
  voteCount: number
  selectedByUser: boolean
}

export interface LikesDto {
  userId: number
  targetType: 'BOARD' | 'COMMENT'
  targetId: number
}

export interface VoteResultsDto {
  userId: number
  voteId: number
}

export interface BoardFormData {
  title: string
  content: string
  category: string
  imageUrl?: string
  voteOptionTexts?: string[]
}
