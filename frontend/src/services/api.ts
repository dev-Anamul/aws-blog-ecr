import type {
  ApiError,
  BlogPost,
  CreateBlogPostPayload,
  UpdateBlogPostPayload,
} from '../types/blogPost';

// Relative path works with ALB path-based routing on a single host (e.g. /api/v1).
// Override with an absolute URL only for split local dev (see frontend/.env.example).
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

class ApiClientError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
  }
}

async function parseError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as ApiError;
    if (typeof data.detail === 'string') {
      return data.detail;
    }
    if (Array.isArray(data.detail)) {
      return data.detail.map((item) => item.msg).join(', ');
    }
  } catch {
    // Fall through to generic message.
  }
  return `Request failed with status ${response.status}`;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    const message = await parseError(response);
    throw new ApiClientError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const blogPostApi = {
  list: () => request<BlogPost[]>('/posts'),
  get: (id: number) => request<BlogPost>(`/posts/${id}`),
  create: (payload: CreateBlogPostPayload) =>
    request<BlogPost>('/posts', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  update: (id: number, payload: UpdateBlogPostPayload) =>
    request<BlogPost>(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  remove: (id: number) =>
    request<void>(`/posts/${id}`, {
      method: 'DELETE',
    }),
};

export { ApiClientError };
