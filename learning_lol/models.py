# we use pydantate for validation we use pydantic
from pydantic import BaseModel

class Products(BaseModel):
    id: int
    name: str
    description: str
    price: float
    quantity: int