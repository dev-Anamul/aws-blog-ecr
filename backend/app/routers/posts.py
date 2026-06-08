from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.blog_post import BlogPost
from app.schemas.blog_post import BlogPostCreate, BlogPostResponse, BlogPostUpdate

router = APIRouter(prefix="/posts", tags=["posts"])


@router.get("", response_model=list[BlogPostResponse])
def list_posts(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
) -> list[BlogPost]:
    return (
        db.query(BlogPost)
        .order_by(BlogPost.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/{post_id}", response_model=BlogPostResponse)
def get_post(post_id: int, db: Session = Depends(get_db)) -> BlogPost:
    post = db.get(BlogPost, post_id)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Blog post with id {post_id} not found",
        )
    return post


@router.post("", response_model=BlogPostResponse, status_code=status.HTTP_201_CREATED)
def create_post(payload: BlogPostCreate, db: Session = Depends(get_db)) -> BlogPost:
    post = BlogPost(**payload.model_dump())
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


@router.put("/{post_id}", response_model=BlogPostResponse)
def update_post(
    post_id: int,
    payload: BlogPostUpdate,
    db: Session = Depends(get_db),
) -> BlogPost:
    post = db.get(BlogPost, post_id)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Blog post with id {post_id} not found",
        )

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(post, field, value)

    db.commit()
    db.refresh(post)
    return post


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(post_id: int, db: Session = Depends(get_db)) -> None:
    post = db.get(BlogPost, post_id)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Blog post with id {post_id} not found",
        )
    db.delete(post)
    db.commit()
