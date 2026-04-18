from datetime import datetime, timezone


def format_date_utc(dt: datetime) -> str:
    if dt is None:
        return ""
    if isinstance(dt, str):
        dt = datetime.fromisoformat(dt)
    return dt.strftime("%d %b %Y")


def format_currency(amount: float) -> str:
    return f"${amount:,.2f} USD"


def format_date_short(dt: datetime) -> str:
    if dt is None:
        return ""
    if isinstance(dt, str):
        dt = datetime.fromisoformat(dt)
    return dt.strftime("%d/%m/%Y")
