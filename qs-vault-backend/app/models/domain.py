from sqlalchemy import Column, Integer, String, DateTime, LargeBinary, ForeignKey
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
    """
    Stores metadata. 
    CRITICAL: The Cloud gets the 'cloud_path', but NEVER the 'pqc_secret_key'.
    The Gateway acts as the trusted key custodian.
    """
    __tablename__ = "files"
    
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    filesize = Column(Integer, nullable=False)
    upload_date = Column(DateTime, default=datetime.utcnow)
    
    # Storage Reference
    cloud_path = Column(String, unique=True, nullable=False)
    
    # Cryptographic Metadata (Required for Decryption)
    # In a real HSM setup, 'pqc_secret_key' would be encrypted at rest.
    pqc_secret_key = Column(LargeBinary, nullable=False)  # The Kyber-512 Private Key
    aes_nonce = Column(LargeBinary, nullable=False)       # AES-GCM Nonce
    pqc_ciphertext_cap = Column(LargeBinary, nullable=False) # The KEM Encapsulation
    encryption_tag = Column(LargeBinary, nullable=False)  # GCM Integrity Tag

    owner = relationship("User", back_populates="files")