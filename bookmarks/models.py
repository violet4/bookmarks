from enum import StrEnum

import sqlalchemy as sa
from sqlalchemy.orm import declarative_base
from sqlalchemy_addons.array_column import JSONEncodedList
from sqlalchemy.ext.mutable import MutableList

Base = declarative_base()


class MediaType(StrEnum):
    PODCAST = "podcast"
    TV_SHOW = "tv_show"
    BOOK = "book"
    OTHER = "other"


class Bookmark(Base):
    __tablename__ = "bookmarks"
    id = sa.Column(sa.Integer, primary_key=True)
    name = sa.Column(sa.String, nullable=False)
    media_type = sa.Column(sa.Enum(MediaType), nullable=False)
    bookmark = sa.Column(MutableList.as_mutable(JSONEncodedList), nullable=False)
    def __str__(self):
        return f"Bookmark(id={self.id}, name={self.name}, media_type={self.media_type}, bookmark={self.bookmark})"
