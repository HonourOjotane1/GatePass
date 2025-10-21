from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy import text
from dotenv import load_dotenv
import os
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

# SQLALCHEMY_DATABASE_URL = 'sqlite:///./gatepass.db' #  for sqlite.
# SQLALCHEMY_DATABASE_URL = (
#     "postgresql://postgres:Ayokuninu_1OJ@localhost/gatepass_db"
# )  # for postgresql
if not DATABASE_URL:
    raise ValueError("DATABASE_URL variable is not set.")
engine = create_engine(
    DATABASE_URL, echo=False  # , connect_args={"check_same_threads": False}
)  # connect_args... is only used for sqlite.
sessionlocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)



Base = declarative_base()
def get_db():
    db = sessionlocal()
    try:
        yield db
    finally:
        db.close()

# db = sessionlocal()
# db.execute(text('SELECT 1'))
# db.close()
