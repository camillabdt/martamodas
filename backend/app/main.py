from pathlib import Path
from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session
from .database import Base, SessionLocal, engine, get_db
from .models import Order
from .schemas import DashboardStats, OrderCreate, OrderOut, OrderUpdate, VALID_STATUSES

Path("data").mkdir(exist_ok=True)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Marta Modas API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def validate_status(status: str) -> str:
    if status not in VALID_STATUSES:
        raise HTTPException(status_code=422, detail="Status inválido")
    return status


@app.on_event("startup")
def seed_demo_data():
    with SessionLocal() as db:
        if db.scalar(select(func.count()).select_from(Order)) == 0:
            demo = [
                Order(customer_name="Maria Silva", phone="55999991111", piece="Vestido de festa", status="producao"),
                Order(customer_name="Joana Souza", phone="55999992222", piece="Saia midi", status="prova"),
                Order(customer_name="Ana Paula", phone="55999993333", piece="Calça alfaiataria", status="pronta"),
            ]
            db.add_all(demo)
            db.commit()


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/orders", response_model=list[OrderOut])
def list_orders(
    search: str | None = Query(default=None),
    status: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    stmt = select(Order).order_by(Order.updated_at.desc())
    if search:
        like = f"%{search.strip()}%"
        stmt = stmt.where(or_(Order.customer_name.ilike(like), Order.phone.ilike(like), Order.piece.ilike(like)))
    if status:
        stmt = stmt.where(Order.status == validate_status(status))
    return list(db.scalars(stmt).all())


@app.get("/orders/{order_id}", response_model=OrderOut)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    return order


@app.post("/orders", response_model=OrderOut, status_code=201)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    validate_status(payload.status)
    order = Order(**payload.model_dump())
    db.add(order)
    db.commit()
    db.refresh(order)
    return order


@app.patch("/orders/{order_id}", response_model=OrderOut)
def update_order(order_id: int, payload: OrderUpdate, db: Session = Depends(get_db)):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    data = payload.model_dump(exclude_unset=True)
    if "status" in data and data["status"] is not None:
        validate_status(data["status"])
    for key, value in data.items():
        setattr(order, key, value)
    db.commit()
    db.refresh(order)
    return order


@app.delete("/orders/{order_id}", status_code=204)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    db.delete(order)
    db.commit()


@app.get("/dashboard", response_model=DashboardStats)
def dashboard(db: Session = Depends(get_db)):
    rows = dict(db.execute(select(Order.status, func.count(Order.id)).group_by(Order.status)).all())
    active = sum(count for status, count in rows.items() if status != "entregue")
    return DashboardStats(
        active=active,
        waiting=rows.get("aguardando", 0),
        production=rows.get("producao", 0),
        trial=rows.get("prova", 0),
        ready=rows.get("pronta", 0),
        delivered=rows.get("entregue", 0),
    )
