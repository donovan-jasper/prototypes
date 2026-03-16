from sqlalchemy import Column, Integer, String, DateTime, Text, Float
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class CallLog(Base):
    __tablename__ = "call_logs"
    
    id = Column(Integer, primary_key=True)
    call_id = Column(String(100), unique=True)
    caller_number = Column(String(50))
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    duration = Column(Float, nullable=True)
    transcript = Column(Text, nullable=True) # Added transcript field
    status = Column(String(20))

class Configuration(Base):
    __tablename__ = "configuration"
    
    id = Column(Integer, primary_key=True)
    key = Column(String(100), unique=True)
    value = Column(Text)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
