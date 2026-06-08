export interface BlogPost {
  id: number;
  title: string;
  content: string;
  author: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBlogPostPayload {
  title: string;
  content: string;
  author: string;
}

export interface UpdateBlogPostPayload {
  title?: string;
  content?: string;
  author?: string;
}

export interface ApiError {
  detail: string | Array<{ msg: string; loc: string[] }>;
}
