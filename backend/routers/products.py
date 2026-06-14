from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from models import Product
from schemas import ProductCreate, ProductOut, ProductListOut, ProductStatsOut, OkResponse

router = APIRouter(tags=["Products"])


@router.get("/products", response_model=ProductListOut)
def list_products(
    search:   str = Query(""),
    category: str = Query(""),
    db: Session = Depends(get_db),
):
    q = db.query(Product)

    if search:
        q = q.filter(Product.name.ilike(f"%{search}%"))

    if category and category not in ("All Categories", "all", ""):
        q = q.filter(Product.category == category)

    products = q.order_by(Product.created_at.desc()).all()

    total_stock_value = sum((p.price or 0) * (p.stock_quantity or 0) for p in products)

    return ProductListOut(
        products=[ProductOut.model_validate(p) for p in products],
        stats=ProductStatsOut(
            total_stock_value=round(total_stock_value, 2),
            catalog_items=len(products),
            out_of_stock=sum(1 for p in products if (p.stock_quantity or 0) == 0),
        ),
    )


@router.post("/products", response_model=ProductOut, status_code=201)
def create_product(body: ProductCreate, db: Session = Depends(get_db)):
    p = Product(**body.model_dump())
    db.add(p)
    db.commit()
    db.refresh(p)
    return ProductOut.model_validate(p)


@router.delete("/products/{product_id}", response_model=OkResponse)
def delete_product(product_id: str, db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(p)
    db.commit()
    return OkResponse()


@router.put("/products/{product_id}", response_model=ProductOut)
def update_product(product_id: str, body: ProductCreate, db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    for k, v in body.model_dump().items():
        setattr(p, k, v)
    db.commit()
    db.refresh(p)
    return ProductOut.model_validate(p)

