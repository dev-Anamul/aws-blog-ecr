from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class BlogPostBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1)
    author: str = Field(default="Anonymous", min_length=1, max_length=100)


class BlogPostCreate(BlogPostBase):
    pass


class BlogPostUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    content: str | None = Field(default=None, min_length=1)
    author: str | None = Field(default=None, min_length=1, max_length=100)


class BlogPostResponse(BlogPostBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
