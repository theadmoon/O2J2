import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { Bell, AlertCircle, ArrowRight } from 'lucide-react';

const POLL_INTERVAL_MS = 20000;

export default function NotificationBell() {
  const [data, setData] = useState({ count_total: 0, count_action_required: 0, count_stage_changed: 0, items: [] });
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const load = async () => {
    try {
      const { data } = await api.get('/notifications');
      setData(data);
    } catch {}
  };

  useEffect(() => {
    load();
    const t = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(t);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const totalCount = data.count_total;
  const hasAction = data.count_action_required > 0;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 text-gray-600 hover:text-sky-600 hover:bg-gray-100 rounded-full transition"
        aria-label="Notifications"
        data-testid="navbar-notifications-button"
      >
        <Bell className="w-5 h-5" />
        {totalCount > 0 && (
          <span
            className={`absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center ${
              hasAction ? 'bg-red-500' : 'bg-sky-500'
            }`}
            data-testid="navbar-notifications-count"
          >
            {totalCount > 9 ? '9+' : totalCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50"
          data-testid="notifications-dropdown"
        >
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">Notifications</p>
            {totalCount > 0 && (
              <p className="text-[11px] text-gray-500">
                {data.count_action_required > 0 && <span className="text-red-500 mr-2">● {data.count_action_required} action</span>}
                {data.count_stage_changed > 0 && <span className="text-sky-500">● {data.count_stage_changed} updates</span>}
              </p>
            )}
          </div>
          <div className="max-h-[380px] overflow-y-auto">
            {data.items.length === 0 ? (
              <p className="text-sm text-gray-400 italic text-center py-10 px-4">
                You're all caught up.
              </p>
            ) : (
              <ul>
                {data.items.map((it) => (
                  <li key={it.project_id}>
                    <Link
                      to={`/projects/${it.project_id}`}
                      onClick={() => setOpen(false)}
                      className="block px-4 py-3 border-t border-gray-100 first:border-t-0 hover:bg-gray-50 transition"
                      data-testid={`notification-item-${it.project_id}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${it.action_required ? 'bg-red-500' : 'bg-sky-500'}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium text-gray-900 truncate">{it.project_title}</p>
                            <ArrowRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                          </div>
                          <p className="text-[11px] text-gray-400 font-mono truncate">{it.project_number}</p>
                          {it.action_required ? (
                            <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 shrink-0" />
                              <span className="font-medium">
                                Action required
                                {it.user_name ? ` from ${it.user_name}` : ''}
                                {it.action_hint ? `: ${it.action_hint}` : ''}
                              </span>
                            </p>
                          ) : (
                            <p className="text-xs text-sky-600 mt-1">
                              Stage changed{it.previous_status_label ? ` from “${it.previous_status_label}”` : ''} to <strong>{it.status_label}</strong>
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
