// CareCircle — Add appointment

const ap = window.tokens;

const AAI = {
  back: (c = ap.ink) => (<svg width="9" height="16" viewBox="0 0 9 16"><path d="M8 1L1 8l7 7" stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  caret:(c = ap.muted) => (<svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  steth:(c = '#fff') => (<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 2v4a3 3 0 003 3 3 3 0 003-3V2" stroke={c} strokeWidth="1.5" strokeLinecap="round"/><path d="M6 9v2a3 3 0 003 3h1a3 3 0 003-3v-1" stroke={c} strokeWidth="1.5" strokeLinecap="round"/><circle cx="13" cy="7" r="1.5" stroke={c} strokeWidth="1.5"/></svg>),
  flask:(c = '#fff') => (<svg width="13" height="16" viewBox="0 0 14 16" fill="none"><path d="M5 1v5L1 14a1 1 0 001 1h10a1 1 0 001-1L9 6V1" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 1h6" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></svg>),
  imaging:(c = '#fff') => (<svg width="16" height="14" viewBox="0 0 16 14" fill="none"><rect x="1" y="1" width="14" height="12" rx="2" stroke={c} strokeWidth="1.4"/><path d="M1 9l3-3 3 3 2-2 6 6" stroke={c} strokeWidth="1.4" strokeLinejoin="round" fill="none"/><circle cx="11" cy="4" r="1.2" fill={c}/></svg>),
  video:(c = '#fff') => (<svg width="16" height="12" viewBox="0 0 16 12" fill="none"><rect x="1" y="1" width="10" height="10" rx="2" stroke={c} strokeWidth="1.5"/><path d="M11 4l4-2v8l-4-2" stroke={c} strokeWidth="1.5" strokeLinejoin="round"/></svg>),
  rx: (c = '#fff') => (<svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 1h4a3 3 0 010 6H3v6m0-6h3l4 6M3 1v6" stroke={c} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  pin:  (c = '#fff') => (<svg width="11" height="13" viewBox="0 0 11 13" fill="none"><path d="M5.5 1a4 4 0 014 4c0 3-4 7-4 7s-4-4-4-7a4 4 0 014-4z" stroke={c} strokeWidth="1.3"/><circle cx="5.5" cy="5" r="1.5" stroke={c} strokeWidth="1.3"/></svg>),
  clock:(c = ap.muted) => (<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke={c} strokeWidth="1.4"/><path d="M7 4v3.2L9 9" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>),
  bell: (c = ap.muted) => (<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v1M3 6.5a4 4 0 018 0V9l1 2H2l1-2V6.5z" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M5.5 12a1.5 1.5 0 003 0" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>),
  share:(c = ap.muted) => (<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="3" cy="7" r="2" stroke={c} strokeWidth="1.4"/><circle cx="11" cy="3" r="2" stroke={c} strokeWidth="1.4"/><circle cx="11" cy="11" r="2" stroke={c} strokeWidth="1.4"/><path d="M5 6l5-2.5M5 8l5 2.5" stroke={c} strokeWidth="1.4"/></svg>),
};

const apptKinds = [
  { k: 'visit',   l: 'In-person',  icon: AAI.steth,   tone: '#C66E4E' },
  { k: 'lab',     l: 'Lab test',   icon: AAI.flask,   tone: '#C7973A' },
  { k: 'imaging', l: 'Imaging',    icon: AAI.imaging, tone: '#7A5A3F' },
  { k: 'tele',    l: 'Telehealth', icon: AAI.video,   tone: '#3F5D54' },
  { k: 'rx',      l: 'Pharmacy',   icon: AAI.rx,      tone: '#1F3D38' },
];

function AALabel({ label, optional }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
      marginBottom: 8,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: ap.muted, letterSpacing: 0.5, textTransform: 'uppercase' }}>{label}</div>
      {optional && <div style={{ fontSize: 10.5, color: ap.mutedSoft }}>Optional</div>}
    </div>
  );
}

function AAText({ value, onChange, placeholder, leading }) {
  return (
    <div style={{
      height: 50, borderRadius: 13, background: '#fff',
      border: `1px solid ${ap.line}`, padding: '0 14px',
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      {leading}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          flex: 1, border: 'none', outline: 'none', background: 'transparent',
          fontFamily: ap.sans, fontSize: 15, color: ap.ink, letterSpacing: -0.15,
        }}
      />
    </div>
  );
}

function AASelect({ value, placeholder, onClick, leading }) {
  return (
    <div onClick={onClick} style={{
      height: 50, borderRadius: 13, background: '#fff',
      border: `1px solid ${ap.line}`, padding: '0 14px',
      display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
    }}>
      {leading}
      <span style={{ flex: 1, fontSize: 15, color: value ? ap.ink : ap.mutedSoft, letterSpacing: -0.15 }}>{value || placeholder}</span>
      {AAI.caret()}
    </div>
  );
}

// ─── Mini calendar (current month, picks one day) ─────
function MiniCalendar({ value, onChange }) {
  const today = new Date('2026-05-17');
  const [view, setView] = React.useState({ y: today.getFullYear(), m: today.getMonth() });
  const first = new Date(view.y, view.m, 1);
  const last  = new Date(view.y, view.m + 1, 0).getDate();
  const leading = (first.getDay() + 6) % 7; // start Monday
  const monthLabel = first.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const days = [];
  for (let i = 0; i < leading; i++) days.push(null);
  for (let d = 1; d <= last; d++) days.push(d);

  const shift = (delta) => {
    let m = view.m + delta, y = view.y;
    if (m < 0)  { m = 11; y--; }
    if (m > 11) { m = 0;  y++; }
    setView({ y, m });
  };

  const fmt = (d) => `${first.toLocaleString('en-US', { month: 'short' })} ${d}, ${view.y}`;

  return (
    <div style={{
      background: '#fff', borderRadius: 16, border: `1px solid ${ap.line}`,
      padding: 14,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 10,
      }}>
        <div onClick={() => shift(-1)} style={{ width: 28, height: 28, borderRadius: 99, background: ap.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <svg width="6" height="10" viewBox="0 0 6 10"><path d="M5 1L1 5l4 4" stroke={ap.ink} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <div style={{ fontFamily: ap.serif, fontSize: 15, color: ap.forestDeep, fontWeight: 500, letterSpacing: -0.2 }}>{monthLabel}</div>
        <div onClick={() => shift(1)} style={{ width: 28, height: 28, borderRadius: 99, background: ap.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <svg width="6" height="10" viewBox="0 0 6 10"><path d="M1 1l4 4-4 4" stroke={ap.ink} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, fontSize: 10, color: ap.mutedSoft, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 6, textAlign: 'center', fontWeight: 600 }}>
        {['M','T','W','T','F','S','S'].map((d, i) => <span key={i}>{d}</span>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {days.map((d, i) => {
          if (!d) return <span key={i} />;
          const isToday = d === today.getDate() && view.m === today.getMonth() && view.y === today.getFullYear();
          const selected = value === fmt(d);
          const past = (view.y < today.getFullYear()) ||
                       (view.y === today.getFullYear() && view.m < today.getMonth()) ||
                       (view.y === today.getFullYear() && view.m === today.getMonth() && d < today.getDate());
          return (
            <button key={i} onClick={() => !past && onChange(fmt(d))} style={{
              height: 36, borderRadius: 10, border: 'none',
              background: selected ? ap.forestDeep : (isToday ? ap.terracottaSoft : 'transparent'),
              color: selected ? '#fff' : (past ? ap.mutedSoft : ap.ink),
              fontFamily: 'ui-monospace, SF Mono, monospace', fontSize: 13,
              fontWeight: selected ? 700 : 500,
              cursor: past ? 'not-allowed' : 'pointer',
              opacity: past ? 0.4 : 1,
            }}>{d}</button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────
function AddAppointmentPage({ onBack, onSave, person }) {
  const [kind, setKind] = React.useState('visit');
  const [title, setTitle] = React.useState('');
  const [who, setWho] = React.useState('');
  const [where, setWhere] = React.useState('');
  const [date, setDate] = React.useState('');
  const [time, setTime] = React.useState('');
  const [duration, setDuration] = React.useState('30 min');
  const [remind, setRemind] = React.useState('1d');
  const [notes, setNotes] = React.useState('');
  const [share, setShare] = React.useState(true);

  const kindMeta = apptKinds.find(k => k.k === kind);
  const titlePlaceholder = {
    visit:   'Cardiology follow-up',
    lab:     'INR + lipid panel',
    imaging: 'Chest X-ray',
    tele:    'Family physician check-in',
    rx:      'Prescription pickup',
  }[kind];
  const whoPlaceholder = {
    visit:   'Dr. Mei Chen',
    lab:     'LifeLabs',
    imaging: 'Sunnybrook · Imaging',
    tele:    'Dr. Patel',
    rx:      'Shoppers Drug Mart',
  }[kind];
  const wherePlaceholder = {
    visit:   "St. Michael's · Rm 412",
    lab:     'Yonge & Eglinton · fasting',
    imaging: '2075 Bayview Ave',
    tele:    'Telehealth call',
    rx:      'Yonge & Bloor',
  }[kind];

  const times = ['7:30 AM', '8:00 AM', '9:00 AM', '10:30 AM', '11:00 AM', '12:00 PM', '1:30 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:30 PM'];
  const durations = ['15 min', '30 min', '45 min', '1 hr', '2 hr'];
  const reminds = [
    { k: '15m', l: '15 min before' },
    { k: '1h',  l: '1 hour before' },
    { k: '1d',  l: '1 day before' },
    { k: '2d',  l: '2 days before' },
    { k: 'none',l: 'No reminder' },
  ];

  const canSave = (title || titlePlaceholder) && date && time;

  return (
    <div style={{
      width: '100%', height: '100%', background: ap.cream,
      fontFamily: ap.sans, color: ap.ink,
      display: 'flex', flexDirection: 'column', paddingTop: 56, position: 'relative',
    }}>
      {/* top bar */}
      <div style={{
        padding: '14px 20px 0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div onClick={onBack} style={{
          width: 36, height: 36, borderRadius: 12,
          background: '#fff', border: `1px solid ${ap.line}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>{AAI.back()}</div>
        <div style={{
          fontFamily: ap.serif, fontSize: 16, color: ap.forestDeep,
          fontWeight: 500, letterSpacing: -0.2,
        }}>Add appointment</div>
        <div onClick={onBack} style={{
          height: 36, padding: '0 12px', borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontSize: 13, color: ap.muted, fontWeight: 500,
        }}>Cancel</div>
      </div>

      {/* hero */}
      <div style={{ padding: '20px 24px 0' }}>
        <div style={{ fontSize: 11, color: ap.muted, letterSpacing: 0.4, textTransform: 'uppercase', fontWeight: 600 }}>
          {person ? `For ${person}` : 'Care recipient'}
        </div>
        <div style={{
          marginTop: 4, fontFamily: ap.serif, fontSize: 26, lineHeight: '30px',
          letterSpacing: -0.6, color: ap.forestDeep, fontWeight: 400,
        }}>Plan the next visit.</div>
      </div>

      {/* kind picker */}
      <div style={{ marginTop: 18, padding: '0 20px', display: 'flex', gap: 7, overflowX: 'auto' }}>
        {apptKinds.map(k => {
          const active = kind === k.k;
          return (
            <button key={k.k} onClick={() => setKind(k.k)} style={{
              flexShrink: 0, padding: '10px 14px 10px 8px', borderRadius: 14,
              cursor: 'pointer',
              border: active ? 'none' : `1px solid ${ap.line}`,
              background: active ? ap.forestDeep : '#fff',
              color: active ? '#fff' : ap.ink,
              display: 'flex', alignItems: 'center', gap: 8,
              fontFamily: ap.sans, fontSize: 13, fontWeight: 600, letterSpacing: -0.1,
            }}>
              <span style={{
                width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                background: k.tone, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{k.icon('#fff')}</span>
              <span>{k.l}</span>
            </button>
          );
        })}
      </div>

      {/* body */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 20px 130px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <AALabel label="What" />
            <AAText value={title} onChange={setTitle} placeholder={titlePlaceholder} />
          </div>
          <div>
            <AALabel label={kind === 'lab' || kind === 'imaging' || kind === 'rx' ? 'Provider' : 'Doctor or clinic'} />
            <AAText value={who} onChange={setWho} placeholder={whoPlaceholder} />
          </div>
          <div>
            <AALabel label="Location" optional={kind === 'tele'} />
            <AAText value={where} onChange={setWhere} placeholder={wherePlaceholder} leading={kind === 'tele' ? AAI.video(ap.muted) : AAI.pin(ap.muted)} />
          </div>
        </div>

        {/* Date */}
        <div style={{ marginTop: 22 }}>
          <AALabel label="Date" />
          <MiniCalendar value={date} onChange={setDate} />
        </div>

        {/* Time */}
        <div style={{ marginTop: 22 }}>
          <AALabel label="Time" />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {times.map(t => {
              const active = time === t;
              return (
                <button key={t} onClick={() => setTime(t)} style={{
                  height: 38, padding: '0 14px', borderRadius: 12, cursor: 'pointer',
                  border: active ? 'none' : `1px solid ${ap.line}`,
                  background: active ? ap.forestDeep : '#fff',
                  color: active ? '#fff' : ap.ink,
                  fontFamily: 'ui-monospace, SF Mono, monospace',
                  fontSize: 12.5, fontWeight: 600, letterSpacing: 0.2,
                }}>{t}</button>
              );
            })}
            <button style={{
              height: 38, padding: '0 14px', borderRadius: 12,
              border: `1px dashed ${ap.mutedSoft}`,
              background: 'transparent', cursor: 'pointer',
              fontFamily: ap.sans, fontSize: 12, color: ap.muted, fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>{AAI.clock(ap.muted)} Custom</button>
          </div>
        </div>

        {/* Duration */}
        <div style={{ marginTop: 22 }}>
          <AALabel label="Duration" optional />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {durations.map(d => {
              const active = duration === d;
              return (
                <button key={d} onClick={() => setDuration(d)} style={{
                  height: 36, padding: '0 14px', borderRadius: 99, cursor: 'pointer',
                  border: active ? 'none' : `1px solid ${ap.line}`,
                  background: active ? ap.sageSoft : '#fff',
                  color: active ? '#2E4942' : ap.ink,
                  fontFamily: ap.sans, fontSize: 12.5, fontWeight: 600, letterSpacing: -0.1,
                }}>{d}</button>
              );
            })}
          </div>
        </div>

        {/* Reminder */}
        <div style={{ marginTop: 22 }}>
          <AALabel label="Reminder" />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {reminds.map(r => {
              const active = remind === r.k;
              return (
                <button key={r.k} onClick={() => setRemind(r.k)} style={{
                  height: 36, padding: '0 14px', borderRadius: 99, cursor: 'pointer',
                  border: active ? 'none' : `1px solid ${ap.line}`,
                  background: active ? ap.forestDeep : '#fff',
                  color: active ? '#fff' : ap.ink,
                  fontFamily: ap.sans, fontSize: 12.5, fontWeight: 600, letterSpacing: -0.1,
                  display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  {AAI.bell(active ? '#fff' : ap.muted)} {r.l}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes */}
        <div style={{ marginTop: 22 }}>
          <AALabel label="Notes" optional />
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={kind === 'lab' ? 'e.g. fasting — water only' : 'Anything to remember, prep, or bring…'}
            rows={3}
            style={{
              width: '100%', boxSizing: 'border-box',
              borderRadius: 13, border: `1px solid ${ap.line}`,
              background: '#fff', padding: '12px 14px',
              fontFamily: ap.sans, fontSize: 14, color: ap.ink,
              resize: 'none', outline: 'none', letterSpacing: -0.1,
            }}
          />
        </div>

        {/* Share with care team */}
        <div style={{
          marginTop: 22, padding: '12px 14px', borderRadius: 14,
          background: '#fff', border: `1px solid ${ap.line}`,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: ap.sageSoft, display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>{AAI.share(ap.forest)}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: ap.ink, letterSpacing: -0.1 }}>Share with care team</div>
            <div style={{ fontSize: 11, color: ap.muted, marginTop: 2 }}>
              Visible to Maya · Anika · Dr. Chen
            </div>
          </div>
          <div onClick={() => setShare(s => !s)} style={{
            width: 42, height: 26, borderRadius: 99, padding: 3,
            background: share ? ap.forestDeep : ap.line, cursor: 'pointer',
            transition: 'background .2s',
            display: 'flex', alignItems: 'center',
            justifyContent: share ? 'flex-end' : 'flex-start',
          }}>
            <div style={{ width: 20, height: 20, borderRadius: 99, background: '#fff', boxShadow: '0 1px 3px rgba(31,61,56,0.2)' }} />
          </div>
        </div>
      </div>

      {/* sticky save */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '14px 20px 26px',
        background: `linear-gradient(to top, ${ap.cream} 60%, rgba(246,241,234,0))`,
      }}>
        <button
          onClick={() => canSave && onSave && onSave({ kind, title: title || titlePlaceholder, who, where, date, time, duration, remind, notes, share })}
          disabled={!canSave}
          style={{
            width: '100%', height: 54, borderRadius: 16, border: 'none',
            background: canSave ? ap.forestDeep : '#cdc5b6',
            color: '#fff', cursor: canSave ? 'pointer' : 'not-allowed',
            fontFamily: ap.sans, fontSize: 15.5, fontWeight: 600, letterSpacing: -0.1,
          }}>
          Save appointment
        </button>
        {!canSave && (
          <div style={{ marginTop: 8, textAlign: 'center', fontSize: 11, color: ap.mutedSoft }}>
            Pick a date and time to save.
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { AddAppointmentPage });
