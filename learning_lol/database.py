from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

db_url = "postgresql://postgres:Rohit1234@localhost:5432/telusko"
engine = create_engine(db_url)
SessionLocal = sessionmaker(autocommit = False, autoflusk = False, bind = engine)