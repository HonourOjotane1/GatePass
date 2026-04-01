from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
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
engine = create_async_engine(
    DATABASE_URL, echo=True)
#     connect_args={"check_same_threads": False}
# )  # connect_args... is only used for sqlite, echo=false isused for postgres
AsyncSessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=engine, class_=AsyncSession, expire_on_commit=False)


Base = declarative_base()


async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


# db = sessionlocal()
# db.execute(text('SELECT 1'))
# db.close()
