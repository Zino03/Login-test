/*
페이지가 많아질수록 같은 코드가 계속 반복
인터셉터를 쓰면 모든 요청/응답을 중간에서 가로채서 한 곳에서 처리
모든 요청 → 인터셉터 → 서버
모든 응답 → 인터셉터 → 각 페이지
                ↑
           여기서 401, 403 한번에 처리
*/

import axios from "axios";

// axios 인스턴스 생성
// 기본 axios 대신 이걸 import해서 사용하면 인터셉터가 자동 적용
const api = axios.create();

// 응답 인터셉터
// 모든 응답을 여기서 가로채서 처리
api.interceptors.response.use(
    // 응답이 성공이면 통과
    (res) => res,

    // 응답이 실패면 여기서 처리
    (err) => {
        const status = err.response?.status;

        if(status === 401){
            // 401 Unauthorized : 인증 실패 -> 로그인 페이지로 이동
            // localStorage 토큰도 삭제 (만료된 토큰 제거)
            localStorage.removeItem("accessToken");
            window.location.href = "/login";
        }

        if(status === 403){
            // 403 Forbidden: 권한 없음 -> 권한 없음 페이지 이동
            window.location.href = "/forbidden";
        }

        // 에러를 그대로 던져서 각 페이지 catch에서 받을 수 있도록 함
        return Promise.reject(err);

        /*
        Promise : 나중에 결과를 약속하는 객체 (비동기 작업 결과 저장)
        pending  → 아직 결과 없음 (요청 중)
        fulfilled → 성공 (응답 받음)
        rejected  → 실패 (에러 발생)
        */
    }
)

/*
    axios, api 차이 (axios를 api로 교체해서 반복되는 catch문 정리)
    api는 인터셉터를 적용한 axios로 만든 커스텀 인스턴스
    -> 실패 시 자동으로 처리 
    (기능은 같은데 공통 처리가 자동으로 붙어 있는 것)
*/

export default api;