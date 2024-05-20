from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import os
from dotenv import load_dotenv

load_dotenv()
PUSER = os.getenv('POSTGRES_USER')
PPASSWORD = os.getenv('POSTGRES_PASSWORD')

URL_DATABASE = f'postgresql://postgres:postgres@100.27.123.142:5432/microservice_testdb'


engine = create_engine(URL_DATABASE)


# instancia de la sesion
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()