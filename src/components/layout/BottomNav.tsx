import type { JSX } from 'react'
import type { FC } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

type NavKey = 'home' | 'music' | 'group' | 'profile'

interface NavItem {
  key: NavKey
  label: string
  path: string
  Icon: FC<{ active: boolean }>
}


const navItems: NavItem[] = [
  { key: 'home', label: '홈', Icon: HomeIcon, path: '/' },
  { key: 'music', label: '음악', Icon: HeadphonesIcon, path: '/sound' },
  { key: 'group', label: '그룹', Icon: UsersIcon, path: '/board' }, // TODO: 나중에 경로 수정
  { key: 'profile', label: '프로필', Icon: UserIcon, path: '/mypage' },
]

// 하단 네비게이션 바: 4개의 버튼, 각 버튼은 하나의 SVG로만 구성
function BottomNav() {
  const location = useLocation()

  return (
    <nav className="bg-dark rounded-pill px-3 py-2 shadow-sm" aria-label="하단 메뉴">
      <div className="d-flex justify-content-between align-items-center gap-3">
        {navItems.map((item) => (
          <BottomNavItem
            key={item.key}
            label={item.label}
            path={item.path}
            Icon={item.Icon}
            active={location.pathname === item.path}
          />
        ))}
      </div>
    </nav>
  )
}

interface BottomNavItemProps {
  label: string
  path: string
  active: boolean
  Icon: FC<{ active: boolean }>
}

function BottomNavItem({ label, path, active, Icon }: BottomNavItemProps) {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      className="btn p-0 border-0 bg-transparent"
      aria-label={label}
      onClick={() => navigate(path)}
    >
      <Icon active={active} />
    </button>
  )
}

function HomeIcon({ active }: { active: boolean }) {
  const stroke = active ? '#ffffff' : '#B8B8B8'
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3.5 10.5002L14 2.3335L24.5 10.5002V23.3335C24.5 23.9523 24.2542 24.5458 23.8166 24.9834C23.379 25.421 22.7855 25.6668 22.1667 25.6668H5.83333C5.21449 25.6668 4.621 25.421 4.18342 24.9834C3.74583 24.5458 3.5 23.9523 3.5 23.3335V10.5002Z"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.5 25.6667V14H17.5V25.6667"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function HeadphonesIcon({ active }: { active: boolean }) {
  const stroke = active ? '#ffffff' : '#B8B8B8'
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3.5 21V14C3.5 11.2152 4.60625 8.54451 6.57538 6.57538C8.54451 4.60625 11.2152 3.5 14 3.5C16.7848 3.5 19.4555 4.60625 21.4246 6.57538C23.3938 8.54451 24.5 11.2152 24.5 14V21"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24.5 22.1668C24.5 22.7857 24.2542 23.3792 23.8166 23.8167C23.379 24.2543 22.7855 24.5002 22.1667 24.5002H21C20.3812 24.5002 19.7877 24.2543 19.3501 23.8167C18.9125 23.3792 18.6667 22.7857 18.6667 22.1668V18.6668C18.6667 18.048 18.9125 17.4545 19.3501 17.0169C19.7877 16.5793 20.3812 16.3335 21 16.3335H24.5V22.1668ZM3.5 22.1668C3.5 22.7857 3.74583 23.3792 4.18342 23.8167C4.621 24.2543 5.21449 24.5002 5.83333 24.5002H7C7.61884 24.5002 8.21233 24.2543 8.64992 23.8167C9.0875 23.3792 9.33333 22.7857 9.33333 22.1668V18.6668C9.33333 18.048 9.0875 17.4545 8.64992 17.0169C8.21233 16.5793 7.61884 16.3335 7 16.3335H3.5V22.1668Z"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function UsersIcon({ active }: { active: boolean }) {
  const stroke = active ? '#ffffff' : '#B8B8B8'
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_32_73)">
        <path
          d="M19.8332 24.5V22.1667C19.8332 20.929 19.3415 19.742 18.4663 18.8668C17.5912 17.9917 16.4042 17.5 15.1665 17.5H5.83317C4.59549 17.5 3.40851 17.9917 2.53334 18.8668C1.65817 19.742 1.1665 20.929 1.1665 22.1667V24.5"
          stroke={stroke}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10.5002 12.8333C13.0775 12.8333 15.1668 10.744 15.1668 8.16667C15.1668 5.58934 13.0775 3.5 10.5002 3.5C7.92283 3.5 5.8335 5.58934 5.8335 8.16667C5.8335 10.744 7.92283 12.8333 10.5002 12.8333Z"
          stroke={stroke}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M26.8335 24.5002V22.1669C26.8327 21.1329 26.4886 20.1284 25.8551 19.3112C25.2216 18.494 24.3346 17.9104 23.3335 17.6519"
          stroke={stroke}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M18.6665 3.65186C19.6703 3.90887 20.56 4.49267 21.1954 5.31122C21.8308 6.12976 22.1757 7.13649 22.1757 8.17269C22.1757 9.20889 21.8308 10.2156 21.1954 11.0342C20.56 11.8527 19.6703 12.4365 18.6665 12.6935"
          stroke={stroke}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_32_73">
          <rect width="28" height="28" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

function UserIcon({ active }: { active: boolean }) {
  const stroke = active ? '#ffffff' : '#B8B8B8'
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M23.3332 24.5V22.1667C23.3332 20.929 22.8415 19.742 21.9663 18.8668C21.0912 17.9917 19.9042 17.5 18.6665 17.5H9.33317C8.09549 17.5 6.90851 17.9917 6.03334 18.8668C5.15817 19.742 4.6665 20.929 4.6665 22.1667V24.5"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.0002 12.8333C16.5775 12.8333 18.6668 10.744 18.6668 8.16667C18.6668 5.58934 16.5775 3.5 14.0002 3.5C11.4228 3.5 9.3335 5.58934 9.3335 8.16667C9.3335 10.744 11.4228 12.8333 14.0002 12.8333Z"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default BottomNav
