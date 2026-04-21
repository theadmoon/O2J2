"""Async, fire-and-forget email notifications to the O2J2 admin inbox.

Uses Resend for transactional delivery. All functions are safe: if Resend is
misconfigured, unreachable, or returns an error, we log and return — we never
propagate the exception back into the request handler that triggered us.
"""
import asyncio
import logging
import os

import resend

logger = logging.getLogger(__name__)

EVENT_META = {
    # stage_key: (subject_verb, action_text)
    "project_submitted":   ("New project submitted", "submitted a new project request"),
    "invoice_signed":      ("Invoice signed",        "signed the Invoice and committed to the order"),
    "delivery_confirmed":  ("Delivery confirmed",    "confirmed receipt of the deliverables"),
    "work_accepted":       ("Work accepted",         "uploaded a signed Acceptance Act — the work has been accepted"),
    "payment_sent":        ("Payment claimed",       "reported the payment (Transaction ID and/or screenshot attached)"),
}


def _frontend_url() -> str:
    return (os.environ.get("FRONTEND_URL") or "").rstrip("/")


def _money(project: dict) -> str:
    amt = project.get("quote_amount") or 0
    try:
        amt = float(amt)
    except (TypeError, ValueError):
        amt = 0
    return f"${amt:,.2f}" if amt else "—"


def _render_html(project: dict, event_key: str, action_text: str) -> str:
    link = f"{_frontend_url()}/projects/{project.get('id', '')}"
    project_number = project.get("project_number") or "—"
    title = project.get("project_title") or "—"
    client_name = project.get("user_name") or "—"
    client_email = project.get("user_email") or "—"
    payment_method = (project.get("payment_method") or "—").replace("_", " ").title()
    amount = _money(project)

    return f"""\
<!doctype html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background:#f3f4f6; margin:0; padding:24px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:10px;">
    <tr>
      <td style="padding:22px 24px 14px 24px;border-bottom:1px solid #f1f5f9;">
        <p style="margin:0;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#0ea5e9;font-weight:600;">Ocean2Joy · Admin alert</p>
        <h2 style="margin:6px 0 0 0;font-size:20px;color:#0f172a;">Client {action_text}.</h2>
      </td>
    </tr>
    <tr>
      <td style="padding:18px 24px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#334155;">
          <tr><td style="padding:4px 0;color:#64748b;width:140px;">Project</td><td style="padding:4px 0;"><strong style="color:#0f172a;">{project_number}</strong></td></tr>
          <tr><td style="padding:4px 0;color:#64748b;">Title</td><td style="padding:4px 0;">{title}</td></tr>
          <tr><td style="padding:4px 0;color:#64748b;">Client</td><td style="padding:4px 0;">{client_name} &lt;{client_email}&gt;</td></tr>
          <tr><td style="padding:4px 0;color:#64748b;">Amount</td><td style="padding:4px 0;">{amount}</td></tr>
          <tr><td style="padding:4px 0;color:#64748b;">Payment method</td><td style="padding:4px 0;">{payment_method}</td></tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:8px 24px 24px 24px;">
        <a href="{link}" style="display:inline-block;background:#0ea5e9;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:10px 18px;border-radius:6px;">Open project in admin panel</a>
      </td>
    </tr>
    <tr>
      <td style="padding:12px 24px 18px 24px;border-top:1px solid #f1f5f9;font-size:11px;color:#94a3b8;">
        Automated notification from the Ocean2Joy operational chain. Event: <code>{event_key}</code>.
      </td>
    </tr>
  </table>
</body>
</html>
"""


def _send_sync(api_key: str, sender: str, recipient: str, subject: str, html: str):
    resend.api_key = api_key
    return resend.Emails.send({
        "from": sender,
        "to": [recipient],
        "subject": subject,
        "html": html,
    })


async def notify_admin_stage_event(project: dict, event_key: str) -> None:
    """Send an email alert to the admin. Never raises."""
    api_key = os.environ.get("RESEND_API_KEY")
    sender = os.environ.get("SENDER_EMAIL") or "onboarding@resend.dev"
    recipient = os.environ.get("ADMIN_NOTIFY_EMAIL")

    if not api_key or not recipient:
        logger.info("Admin notification skipped (missing RESEND_API_KEY or ADMIN_NOTIFY_EMAIL): %s", event_key)
        return

    meta = EVENT_META.get(event_key)
    if not meta:
        logger.warning("Unknown admin notification event: %s", event_key)
        return
    subject_verb, action_text = meta

    project_number = project.get("project_number") or "—"
    client_name = project.get("user_name") or project.get("user_email") or "client"
    amount = _money(project)
    subject = f"[O2J2] {subject_verb} — {project_number} · {amount} · {client_name}"
    html = _render_html(project, event_key, action_text)

    try:
        result = await asyncio.to_thread(
            _send_sync, api_key, sender, recipient, subject, html,
        )
        logger.info("Admin notification sent (%s): id=%s", event_key, (result or {}).get("id"))
    except Exception as exc:  # noqa: BLE001 — never propagate
        logger.error("Failed to send admin notification (%s): %s", event_key, exc)
