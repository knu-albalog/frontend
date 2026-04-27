import { getAccessToken } from './tokenStorage';

const BASE_URL = 'http://douzonesumin.kro.kr:8082';

// 토큰 없이 요청하는 함수
// 로그인, 회원가입처럼 access token이 아직 없는 API에 사용
export const publicRequest = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API 요청 실패: ${response.status}`);
  }

  return response.json();
};

// access token을 포함해서 요청하는 함수
// 로그인 이후 사용자 정보가 필요한 API에 사용
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const accessToken = await getAccessToken();

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken && {
        Authorization: `Bearer ${accessToken}`,
      }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API 요청 실패: ${response.status}`);
  }

  return response.json();
};