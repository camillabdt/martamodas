import os
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

DEFAULT_SQLITE_URL = "sqlite:///./data/marta_modas.db"
DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_SQLITE_URL).strip()

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg://", 1)
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)

connect_args: dict = {}
engine_options: dict = {
    "pool_pre_ping": True,
    "pool_recycle": 300,
}

if DATABASE_URL.startswith("sqlite"):
    Path("data").mkdir(exist_ok=True)
    connect_args["check_same_thread"] = False
else:
    # O pooler transacional do Supabase (porta 6543) não aceita prepared statements.
    if ":6543/" in DATABASE_URL:
        connect_args["prepare_threshold"] = None
    engine_options.update({"pool_size": 5, "max_overflow": 5})

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    **engine_options,
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
