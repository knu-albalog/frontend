import { getAccessToken } from './tokenStorage';

const BASE_URL = 'http://douzonesumin.kro.kr:8082';

// 공통 API 요청 함수
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