// msw/node 패키지에서 Node 전용 MSW 서버 생성 함수를 가져옵니다.
// 이 서버는 실제 HTTP 포트를 열지 않고,
// Node의 네트워크 계층에서 요청을 가로채는(intercept) 역할만 수행합니다.
import { setupServer } from 'msw/node';

// 외부 API 역할을 할 요청 핸들러들입니다.
// 각 핸들러는 특정 URL + HTTP Method 조합에 대해
// 어떤 응답을 돌려줄지 정의하는 "네트워크 계약(Contract)"에 해당합니다.
import { userHandlers } from './6-2-1.example.handlers';

// setupServer에 핸들러 배열을 펼쳐서 전달하면,
// MSW는 이 핸들러 목록을 기준으로
// 들어오는 모든 HTTP 요청을 검사하고,
// 일치하는 요청이 있을 경우 실제 네트워크로 보내지 않고
// 해당 핸들러의 응답을 즉시 반환합니다.
export const server = setupServer(...userHandlers);

// 이 server 객체는 보통 Vitest의 global setup 단계에서
// server.listen()  → 네트워크 interception ON
// server.close()   → 네트워크 interception OFF
// 형태로 사용되며,
//
// 테스트 코드나 애플리케이션 코드에서는
// MSW의 존재를 전혀 알 필요 없이
// 평소와 동일하게 axios / fetch 요청을 보내기만 하면 됩니다.
