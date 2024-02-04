from enum import StrEnum

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.future import select
from sqlalchemy.orm import sessionmaker
from typing import List

import fastapi
from fastapi import Depends, HTTPException
from fastapi.staticfiles import StaticFiles

from pydantic import BaseModel

from .models import Bookmark

# FastAPI and Pydantic versions
fastapi_version = "0.90.1"
pydantic_version = "1.10.4"

# ... (database table definition as before) ...


# Database setup (using asynchronous SQLAlchemy)
engine = create_async_engine("sqlite+aiosqlite:///bookmarks.db", echo=True)
async_session = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


# Pydantic models for API requests/responses
class MediaType(StrEnum):
    PODCAST = "podcast"
    TV_SHOW = "tv_show"
    BOOK = "book"
    OTHER = "other"


class BookmarkBase(BaseModel):
    name: str
    media_type: MediaType
    bookmark: List[int]


class BookmarkCreate(BookmarkBase):
    pass


class BookmarkUpdate(BookmarkBase):
    id: int


class BookmarkOut(BookmarkBase):
    id: int

    class Config:
        from_attributes = True


async def get_db_session():
    async with async_session() as session: # type: ignore
        yield session


async def get_bookmark(bookmark_id: int, session: AsyncSession):
    bookmark = await session.get(Bookmark, bookmark_id)
    if bookmark is None:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    return bookmark

async def get_all_bookmarks(session: AsyncSession):
    async with session.begin():
        query = select(Bookmark)
        result = await session.execute(query)
        bookmarks = result.scalars().all()
        return [BookmarkOut.model_validate(b) for b in bookmarks]

app = fastapi.FastAPI()


@app.post("/bookmarks/", response_model=BookmarkOut, status_code=201)
async def create_bookmark(
    bookmark: BookmarkCreate, session: AsyncSession = Depends(get_db_session)
):
    db_bookmark = Bookmark(**bookmark.model_dump())
    session.add(db_bookmark)
    await session.commit()
    await session.refresh(db_bookmark)
    return db_bookmark


@app.get("/bookmarks/", response_model=List[BookmarkOut])
async def get_bookmarks(session: AsyncSession = Depends(get_db_session)):
    bookmarks = await get_all_bookmarks(session)
    return bookmarks


@app.get("/bookmarks/{bookmark_id}", response_model=BookmarkOut)
async def get_bookmark_by_id(bookmark_id: int, session: AsyncSession = Depends(get_db_session)):
    return await get_bookmark(bookmark_id, session)


@app.put("/bookmarks/{bookmark_id}", response_model=BookmarkOut)
async def update_bookmark(
    bookmark_id: int,
    bookmark: BookmarkUpdate,
    session: AsyncSession = Depends(get_db_session),
):
    db_bookmark = await get_bookmark(bookmark_id, session)
    update_data = bookmark.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_bookmark, key, value)
    session.add(db_bookmark)
    await session.commit()
    await session.refresh(db_bookmark)
    return db_bookmark


@app.delete("/bookmarks/{bookmark_id}", status_code=204)
async def delete_bookmark(bookmark_id: int, session: AsyncSession = Depends(get_db_session)):
    bookmark = await get_bookmark(bookmark_id, session)
    await session.delete(bookmark)
    await session.commit()

app.mount("/", StaticFiles(directory='./frontend/build'), name="frontend")
