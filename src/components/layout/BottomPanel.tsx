import type { ReactNode } from 'react'

interface BottomPanelProps {
    children: ReactNode
}

// 회색 패널(사각형) 배경 위에 콘텐츠를 얹는 용도
function BottomPanel({ children }: BottomPanelProps) {
    return (
        <section className="mt-auto bg-light border-top rounded-top-4 p-3 shadow-sm">
            <div className="d-flex flex-column gap-3">{children}</div>
        </section>
    )
}

export default BottomPanel
