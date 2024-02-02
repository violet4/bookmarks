from engine import engine
from sqlalchemy.orm import sessionmaker

from models import Bookmark, MediaType


DB = sessionmaker(bind=engine)
with DB() as sess:
    bm = Bookmark(name="Blacklist", media_type=MediaType.TV_SHOW, bookmark=[2,2,3,25,38])
    sess.add(bm)
    sess.commit()
    sess.refresh(bm)
    print(bm)
