from sqlalchemy import Column, Integer, String, DateTime, LargeBinary, ForeignKey, Float
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    files = relationship("FileMetadata", back_populates="owner")

class FileMetadata(Base):
    __tablename__ = "files"
    
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    filesize = Column(Integer, nullable=False)
    upload_date = Column(DateTime, default=datetime.utcnow)
    cloud_path = Column(String, unique=True, nullable=False)
    
    algo_mode = Column(String, default="hybrid")
    
    # Crypto Fields
    pqc_secret_key = Column(LargeBinary, nullable=True) 
    pqc_ciphertext_cap = Column(LargeBinary, nullable=True)
    aes_nonce = Column(LargeBinary, nullable=False)
    encryption_tag = Column(LargeBinary, nullable=False)
    kdf_salt = Column(LargeBinary, nullable=False) 

    # Metrics
    time_pqc = Column(Float, default=0.0)
    time_aes = Column(Float, default=0.0)
    time_total = Column(Float, default=0.0)

    owner = relationship("User", back_populates="files")