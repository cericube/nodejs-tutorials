import { http, HttpResponse } from 'msw';

export const userHandlers = [
  // 1. GET 요청 및 Query Parameter 처리
  http.get('https://api.example.com/users', ({ request }) => {
    const url = new URL(request.url);
    const role = url.searchParams.get('role');

    return HttpResponse.json([{ id: 1, name: 'Alice', role: role || 'user' }]);
  }),

  // 2. POST 요청 및 Request Body 검증
  http.post('https://api.example.com/users', async ({ request }) => {
    const newUser = await request.json();

    if (!(newUser as any).name) {
      return new HttpResponse(null, { status: 400 });
    }

    return HttpResponse.json({ id: 2, ...(newUser as any) }, { status: 201 });
  }),
];
