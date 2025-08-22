from pydantic import BaseModel

class AppSettings(BaseModel):
    """
    Defines the structure for application settings.
    """
    ai_model_name: str
