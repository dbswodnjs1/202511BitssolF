/* 
    src/router/index.jsx 

    - 파일명을 index.js or index.jsx 로 작성하면 외부에서
      router 폴더까지만 import 했을 때 자동으로 index.js or index.jsx
      파일에서 export default 된 자원을 사용할 수 있다. 
    - index 는 약속된 파일명이다.
*/

import { createHashRouter, Navigate } from "react-router-dom";
import App from "../App";
import Home from "../pages/BissolHome";
import BoardList from "../pages/Board/BoardList";
import BoardDetail from "../pages/Board/BoardDetail";
import BoardForm from "../pages/Board/BoardForm";
import BoardVoteForm from "../pages/Board/BoardVoteForm";
import SoundMain from "../pages/sound/SoundMain";
import SoundForm from "../pages/sound/SoundForm";
import SoundPlayer from "../pages/sound/SoundPlayer";
import Login from "../pages/user/Login";
import Signup from "../pages/user/Signup";
import ProtectedRoute from "../components/ProtectedRoute";
import MyPage from "../pages/option/MyPage";
import Settings from "../pages/option/Settings";
import ChangePassword from "../pages/option/ChangePassword";
import ProfileImageSettings from "../pages/option/ProfileImageSettings";
import RecentPlaysPage from "../components/mypage/RecentPlaysPage";
import MyUploadsPage from "../components/mypage/MyUploadsPage";
import FavoritesPage from "../components/mypage/FavoritesPage";
import ProfileSettings from "../pages/option/ProfileSettings";

// 페이지 routing 정보를 배열에 미리 저장해둔다.
const routes = [

    // 공개 페이지 (로그인 필요 없음)
    { path: "/login", element: <Login />, isPublic: true },
    { path: "/signup", element: <Signup />, isPublic: true },

    //  마이페이지(로그인 필요)
    { path: "/mypage", element: <MyPage /> },
    { path: "/option/settings", element: <Settings /> },
    { path: "/option/password", element: <ChangePassword /> },
    { path: "/option/profile-image", element: <ProfileImageSettings /> },
    { path: "/mypage/recent", element: <RecentPlaysPage /> },
    { path: "/mypage/uploads", element: <MyUploadsPage /> },
    { path: "/mypage/favorites", element: <FavoritesPage /> },
    { path: "/option/profile", element: <ProfileSettings /> },

    // 보호된 페이지 (로그인 필요)
    // spring boot 서버에 넣어서 실행하면 최초 로딩될때  /index.html 경로로 로딩된다.
    // 그럴때도  Home 컴포넌트가 활성화 될수 있도록 라우트 정보를 추가한다. 
    { path: "/index.html", element: <Home /> },
    { path: "/", element: <Home /> },
    { path: "/sound", element: <SoundMain /> },
    { path: "/sound/new", element: <SoundForm /> },
    { path: "/soundplayer", element: <SoundPlayer /> },
    { path: "/board", element: <BoardList /> },
    { path: "/board/:id", element: <BoardDetail /> },
    { path: "/board/new", element: <BoardForm /> },
    { path: "/board/:id/edit", element: <BoardForm /> },
    { path: "/board/vote", element: <BoardVoteForm /> },
    { path: "/board/:id/vote/edit", element: <BoardVoteForm /> },
];


//export 해줄 router 객체를 만든다
const router = createHashRouter([{
    path: "/",
    element: <App />,
    children: routes.map((route) => {
        // 공개 페이지면 그대로, 아니면 ProtectedRoute로 감싸기
        const element = route.isPublic
            ? route.element
            : <ProtectedRoute>{route.element}</ProtectedRoute>;

        return {
            index: route.path === "/", //자식의 path 가 "/" 면 index 페이지 역할을 하게 하기 
            path: route.path === "/" ? undefined : route.path, // path 에 "/" 두개가 표시되지 않게  
            element: element //어떤 컴포넌트를 활성화 할것인지 
        }
    })
}]);

export default router;