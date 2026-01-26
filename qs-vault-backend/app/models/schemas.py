from pydantic import BaseModel


class UploadResponse(BaseModel):
    file_id: str
    filename: str
    warning: str | None = None
