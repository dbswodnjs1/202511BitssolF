export function formatTimeAgo(createdAt: string) {
  const now = new Date()
  const past = new Date(createdAt)
  const diffMs = now.getTime() - past.getTime()
  const diffMin = Math.floor(diffMs / 60000)

  if (diffMin < 1) return '방금 전'
  if (diffMin < 60) return `${diffMin}분 전`

  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour}시간 전`

  const diffDay = Math.floor(diffHour / 24)
  if (diffDay < 30) return `${diffDay}일 전`

  const diffMonth = Math.floor(diffDay / 30)
  return `${diffMonth}개월 전`
}
