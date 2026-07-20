from datetime import date, datetime
from pydantic import BaseModel, ConfigDict, Field

VALID_STATUSES = {"aguardando", "producao", "prova", "pronta", "entregue"}


class OrderBase(BaseModel):
    customer_name: str = Field(min_length=2, max_length=120)
    phone: str = Field(min_length=8, max_length=30)
    piece: str = Field(min_length=2, max_length=120)
    status: str = "aguardando"
    due_date: date | None = None
    notes: str = ""
    message_sent: bool = False


class OrderCreate(OrderBase):
    pass


class OrderUpdate(BaseModel):
    customer_name: str | None = Field(default=None, min_length=2, max_length=120)
    phone: str | None = Field(default=None, min_length=8, max_length=30)
    piece: str | None = Field(default=None, min_length=2, max_length=120)
    status: str | None = None
    due_date: date | None = None
    notes: str | None = None
    message_sent: bool | None = None


class OrderOut(OrderBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime
    updated_at: datetime


class DashboardStats(BaseModel):
    active: int
    waiting: int
    production: int
    trial: int
    ready: int
    delivered: int
