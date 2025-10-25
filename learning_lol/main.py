# uvicorn main:app --reload

from fastapi import FastAPI 
from models import Products
from database import session

app = FastAPI()

@app.get("/")
def greet():
    return "hiii"

products = [
    Products(id=1, name="Phone", description="A smartphone", price=699.99, quantity=50),
    Products(id=2, name="Laptop", description="A powerful laptop", price=999.99, quantity=30),
    Products(id=3, name="Pen", description="A blue ink pen", price=1.99, quantity=100),
    Products(id=4, name="Table", description="A wooden table", price=199.99, quantity=20),
]


@app.get("/products")
def get_all_products():
    db = session()
    db.query()
    return products


@app.get("/products/{id}")
def get_products_by_id(id:int):
    for i in products:
        if i.id == id:
            return i
    
    return "out of bounce"

@app.post("/products")
def add_product(product: Products):
    products.append(product)

@app.put("/products")
def update_products(id: int,product:Products):
    for i in products:
        if i.id == id:
            products = product 
            return "sucess"
    return "out of bounce"

@app.delete("/products")
def update_products(id:int):
    for i in range(len(products)):
        if products[i].id == id:
            del products[i]
            return "deleted"
    return "failure" 