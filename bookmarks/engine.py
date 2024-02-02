import sqlalchemy as sa

from models import Bookmark

# Database setup (assuming SQLite, adjust for other databases)
engine = sa.create_engine("sqlite:///bookmarks.db")
try:
    Bookmark.__table__.create(bind=engine)
except:
    pass

