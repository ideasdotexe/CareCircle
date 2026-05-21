// CareCircle — Reminders dashboard (no hero card)
// A lighter, more actionable home: today's medications to take + appointments + recent activity.

const rd = window.tokens;

// ─── Sample data ───────────────────────────────────────
const remPeople = [
  { k: 'Arjun',  rel: 'Father', tint: '#3F5D54', init: 'A' },
  { k: 'Indira', rel: 'Mother', tint: '#C66E4E', init: 'I' },
];

const reminders = {
  Arjun: {
    meds: [
      { id: 'm1', name: 'Metformin',    dose: '500 mg',  when: '8:00 AM', window: 'morning', status: 'done',    by: { name: 'Anika', tone: '#C66E4E', role: 'Caregiver' } },
      { id: 'm2', name: 'Ramipril',     dose: '5 mg',    when: '8:00 AM', window: 'morning', status: 'done',    by: { name: 'Anika', tone: '#C66E4E', role: 'Caregiver' } },
      { id: 'm3', name: 'Aspirin',      dose: '81 mg',   when: '8:00 AM', window: 'morning', status: 'done',    by: { name: 'Anika', tone: '#C66E4E', role: 'Caregiver' } },
      { id: 'm4', name: 'Metformin',    dose: '500 mg',  when: '7:00 PM', window: 'evening', status: 'due',     due: 'Due in 2h' },
      { id: 'm5', name: 'Warfarin',     dose: '3 mg',    when: '8:00 PM', window: 'evening', status: 'upcoming' },
      { id: 'm6', name: 'Atorvastatin', dose: '20 mg',   when: '9:00 PM', window: 'evening', status: 'upcoming' },
    ],
    appointments: [
      { kind: 'visit', dayShort: 'TODAY', date: 'May 9',  time: '4:30 PM', what: 'Cardiology follow-up', who: 'Dr. Mei Chen',  where: 'St. Michael\'s · Rm 412', soon: true,  in: 'in 5h' },
      { kind: 'lab',   dayShort: 'TUE',   date: 'May 12', time: '7:30 AM', what: 'INR + lipid panel',    who: 'LifeLabs',      where: 'Yonge & Eg · fasting' },
      { kind: 'tele',  dayShort: 'MON',   date: 'May 25', time: '2:00 PM', what: 'Family physician',     who: 'Dr. Patel',     where: 'Telehealth call' },
    ],
    recent: [
      { type: 'vital', t: '9:15 AM',  title: 'Blood pressure logged',  note: '152 / 96 mmHg', flagged: true, by: { name: 'Anika', tone: '#C66E4E', role: 'Caregiver' } },
      { type: 'note',  t: '10:20 AM', title: 'Anika added a note',     note: '"Walked to the porch, a little short of breath."', by: { name: 'Anika', tone: '#C66E4E', role: 'Caregiver' } },
      { type: 'vital', t: '12:30 PM', title: 'Blood sugar logged',     note: '7.1 mmol/L · post-meal', by: { name: 'Anika', tone: '#C66E4E', role: 'Caregiver' } },
    ],
  },
  Indira: {
    meds: [
      { id: 'i1', name: 'Levothyroxine', dose: '75 mcg', when: '7:00 AM', window: 'morning', status: 'done',     by: { name: 'You', tone: '#1F3D38', role: 'Family' } },
      { id: 'i2', name: 'Calcium + D₃',  dose: '600 mg', when: '9:00 AM', window: 'morning', status: 'done',     by: { name: 'You', tone: '#1F3D38', role: 'Family' } },
      { id: 'i3', name: 'Calcium + D₃',  dose: '600 mg', when: '8:00 PM', window: 'evening', status: 'upcoming' },
    ],
    appointments: [
      { kind: 'visit', dayShort: 'WED', date: 'May 13', time: '9:00 AM',  what: 'Endocrinology · annual', who: 'Dr. Ng',      where: 'Mount Sinai' },
      { kind: 'lab',   dayShort: 'THU', date: 'May 21', time: '11:00 AM', what: 'Bone density (DEXA)',     who: 'Imaging',     where: 'Women\'s College' },
    ],
    recent: [
      { type: 'vital', t: '8:00 AM', title: 'Blood pressure logged', note: '124 / 78 mmHg', by: { name: 'You', tone: '#1F3D38', role: 'Family' } },
    ],
  },
};

// ─── Icons ─────────────────────────────────────────────
const RDI = {
  bell: (c = rd.ink) => (<svg width="18" height="20" viewBox="0 0 18 20" fill="none"><path d="M9 2v1.5M3 8a6 6 0 1112 0v3l1.5 3h-15L3 11V8z" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 17a2 2 0 004 0" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></svg>),
  plus: (c = rd.muted) => (<svg width="14" height="14" viewBox="0 0 14 14"><path d="M7 1v12M1 7h12" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></svg>),
  check: (c = '#fff') => (<svg width="12" height="10" viewBox="0 0 12 10" fill="none"><path d="M1 5l3 3 7-7" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  pill: (c = rd.forest) => (<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="5" width="14" height="6" rx="3" stroke={c} strokeWidth="1.4"/><path d="M8 5v6" stroke={c} strokeWidth="1.4"/></svg>),
  pulse: (c = rd.forest) => (<svg width="16" height="14" viewBox="0 0 16 14" fill="none"><path d="M1 7h3l2-5 4 10 2-5h3" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  note: (c = rd.forest) => (<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2h10v8l-3 3H2V2z" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/><path d="M9 13v-3h3" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/></svg>),
  steth: (c) => (<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 2v4a3 3 0 003 3 3 3 0 003-3V2" stroke={c} strokeWidth="1.4" strokeLinecap="round"/><path d="M6 9v2a3 3 0 003 3h1a3 3 0 003-3v-1" stroke={c} strokeWidth="1.4" strokeLinecap="round"/><circle cx="13" cy="7" r="1.5" stroke={c} strokeWidth="1.4"/></svg>),
  flask: (c) => (<svg width="12" height="14" viewBox="0 0 14 16" fill="none"><path d="M5 1v5L1 14a1 1 0 001 1h10a1 1 0 001-1L9 6V1" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 1h6" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>),
  video: (c) => (<svg width="14" height="11" viewBox="0 0 16 12" fill="none"><rect x="1" y="1" width="10" height="10" rx="2" stroke={c} strokeWidth="1.4"/><path d="M11 4l4-2v8l-4-2" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/></svg>),
  clock: (c = rd.mutedSoft) => (<svg width="11" height="11" viewBox="0 0 11 11" fill="none"><circle cx="5.5" cy="5.5" r="4.5" stroke={c} strokeWidth="1.2"/><path d="M5.5 3v2.5L7 7" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></svg>),
  arrow: (c = rd.forest) => (<svg width="14" height="12" viewBox="0 0 14 12" fill="none"><path d="M1 6h12m0 0L8 1m5 5L8 11" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  warn: (c = '#fff') => (<svg width="11" height="11" viewBox="0 0 11 11"><path d="M5.5 1l4.5 9H1L5.5 1z" fill={c}/></svg>),
};

function appIcon(kind, c) {
  if (kind === 'lab')  return RDI.flask(c);
  if (kind === 'tele') return RDI.video(c);
  return RDI.steth(c);
}

// ─── Med reminder row ──────────────────────────────────
function MedReminderRow({ m, isLast, onToggle }) {
  const done = m.status === 'done';
  const due  = m.status === 'due';
  return (
    <div style={{
      padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12,
      borderBottom: isLast ? 'none' : `1px solid ${rd.lineSoft}`,
      background: due ? '#FFF8F2' : '#fff',
    }}>
      <button onClick={onToggle} style={{
        width: 28, height: 28, borderRadius: 99, flexShrink: 0,
        border: `1.5px solid ${done ? rd.forest : (due ? rd.terracotta : rd.line)}`,
        background: done ? rd.forest : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', padding: 0,
      }}>
        {done && RDI.check('#fff')}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{
            fontSize: 14, fontWeight: 600, color: rd.ink, letterSpacing: -0.1,
            textDecoration: done ? 'line-through' : 'none', opacity: done ? 0.55 : 1,
          }}>{m.name}</span>
          <span style={{ fontSize: 11.5, color: rd.muted, opacity: done ? 0.6 : 1 }}>{m.dose}</span>
        </div>
        <div style={{
          marginTop: 2, fontSize: 11, color: rd.muted, display: 'flex', alignItems: 'center', gap: 4,
        }}>
          {RDI.clock(rd.mutedSoft)} {m.when}
          {done && m.by && (
            <React.Fragment>
              <span style={{ color: rd.mutedSoft }}>·</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span style={{
                  width: 14, height: 14, borderRadius: 99, background: m.by.tone,
                  color: '#fff', fontFamily: rd.serif, fontSize: 8, fontWeight: 500,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}>{m.by.name[0]}</span>
                <span style={{ color: rd.ink, fontWeight: 500 }}>{m.by.name}</span>
              </span>
            </React.Fragment>
          )}
        </div>
      </div>
      {due && (
        <div style={{
          padding: '3px 8px', borderRadius: 99,
          background: rd.terracotta, color: '#fff',
          fontSize: 9.5, fontWeight: 700, letterSpacing: 0.4, flexShrink: 0,
        }}>{m.due}</div>
      )}
    </div>
  );
}

// ─── Med reminders block ───────────────────────────────
function MedReminders({ meds, onToggle }) {
  const grouped = {
    morning: meds.filter(m => m.window === 'morning'),
    evening: meds.filter(m => m.window === 'evening'),
  };
  const done = meds.filter(m => m.status === 'done').length;
  const total = meds.length;
  const dueCount = meds.filter(m => m.status === 'due').length;

  return (
    <div>
      {/* progress strip */}
      <div style={{
        background: '#fff', borderRadius: 16, border: `1px solid ${rd.line}`,
        padding: '12px 14px', marginBottom: 10,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: rd.serif, fontSize: 17, color: rd.forestDeep,
            fontWeight: 500, letterSpacing: -0.3, lineHeight: 1.1,
          }}>
            {done} of {total} taken
          </div>
          <div style={{ marginTop: 6, height: 5, background: rd.line, borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${(done/total)*100}%`,
              background: rd.forest, borderRadius: 99,
              transition: 'width .4s',
            }} />
          </div>
        </div>
        {dueCount > 0 ? (
          <div style={{
            padding: '6px 10px', borderRadius: 99,
            background: rd.terracottaSoft, color: rd.terracotta,
            fontSize: 10.5, fontWeight: 700, letterSpacing: 0.4,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>{RDI.warn(rd.terracotta)} {dueCount} due</div>
        ) : (
          <div style={{
            padding: '6px 10px', borderRadius: 99,
            background: rd.sageSoft, color: rd.forest,
            fontSize: 10.5, fontWeight: 700, letterSpacing: 0.4,
          }}>ON TRACK</div>
        )}
      </div>

      {/* morning */}
      {grouped.morning.length > 0 && (
        <WindowGroup label="Morning" meds={grouped.morning} onToggle={onToggle} />
      )}
      {grouped.evening.length > 0 && (
        <WindowGroup label="Evening" meds={grouped.evening} onToggle={onToggle} />
      )}
    </div>
  );
}

function WindowGroup({ label, meds, onToggle }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{
        fontSize: 10.5, fontWeight: 700, color: rd.muted,
        letterSpacing: 0.5, textTransform: 'uppercase',
        padding: '4px 4px 8px',
        display: 'flex', alignItems: 'baseline', gap: 6,
      }}>
        <span>{label}</span>
        <span style={{ color: rd.mutedSoft, fontWeight: 500, fontFamily: 'ui-monospace, monospace', fontSize: 10 }}>
          {meds.filter(m => m.status === 'done').length}/{meds.length}
        </span>
      </div>
      <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${rd.line}`, overflow: 'hidden' }}>
        {meds.map((m, i) => (
          <MedReminderRow key={m.id} m={m} isLast={i === meds.length - 1} onToggle={() => onToggle(m.id)} />
        ))}
      </div>
    </div>
  );
}

// ─── Appointment card ──────────────────────────────────
function AppointmentCard({ a }) {
  const isSoon = a.soon;
  const tint =
    a.kind === 'lab'  ? { bg: '#F5E4C9', icon: '#C7973A' } :
    a.kind === 'tele' ? { bg: rd.sageSoft, icon: rd.forest } :
                        { bg: rd.terracottaSoft, icon: rd.terracotta };
  return (
    <div style={{
      flexShrink: 0, width: 236, scrollSnapAlign: 'start',
      background: isSoon ? rd.forestDeep : '#fff',
      color: isSoon ? '#fff' : rd.ink,
      border: isSoon ? 'none' : `1px solid ${rd.line}`,
      borderRadius: 18, padding: 14,
      display: 'flex', flexDirection: 'column', gap: 10,
      minHeight: 132,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          padding: '3px 8px', borderRadius: 99,
          background: isSoon ? 'rgba(255,255,255,0.18)' : rd.cream,
          color: isSoon ? '#fff' : rd.muted,
          fontSize: 9.5, fontWeight: 700, letterSpacing: 0.5,
        }}>{a.dayShort} · {a.date}</div>
        <div style={{
          width: 28, height: 28, borderRadius: 9, flexShrink: 0,
          background: isSoon ? 'rgba(255,255,255,0.12)' : tint.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{appIcon(a.kind, isSoon ? '#fff' : tint.icon)}</div>
      </div>
      <div style={{
        fontFamily: rd.serif, fontSize: 16.5, lineHeight: '20px',
        fontWeight: 500, letterSpacing: -0.3,
        color: isSoon ? '#fff' : rd.forestDeep, textWrap: 'pretty',
      }}>{a.what}</div>
      <div style={{ flex: 1 }} />
      <div style={{
        fontSize: 11, lineHeight: '15px',
        color: isSoon ? 'rgba(255,255,255,0.75)' : rd.muted,
      }}>
        <span style={{ fontWeight: 600 }}>{a.time}{a.in ? ` · ${a.in}` : ''}</span><br />
        {a.who} · {a.where}
      </div>
    </div>
  );
}

// ─── Recent activity row ───────────────────────────────
function RecentRow({ it, isLast }) {
  const flagged = it.flagged;
  const Icon = it.type === 'vital' ? RDI.pulse : it.type === 'note' ? RDI.note : RDI.pill;
  return (
    <div style={{
      padding: '12px 14px', display: 'flex', gap: 12, alignItems: 'flex-start',
      borderBottom: isLast ? 'none' : `1px solid ${rd.lineSoft}`,
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: 9, flexShrink: 0,
        background: flagged ? '#FBE3D9' : rd.sageSoft,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginTop: 1,
      }}>
        <Icon color={flagged ? rd.terracotta : rd.forest} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: rd.ink, letterSpacing: -0.1 }}>{it.title}</span>
          <span style={{ fontSize: 10.5, color: rd.mutedSoft, fontFamily: 'ui-monospace, monospace' }}>{it.t}</span>
        </div>
        <div style={{ marginTop: 2, fontSize: 11.5, color: flagged ? rd.terracotta : rd.muted, lineHeight: '15px' }}>
          {it.note}
        </div>
        {it.by && (
          <div style={{ marginTop: 5, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <span style={{
              width: 16, height: 16, borderRadius: 99, background: it.by.tone,
              color: '#fff', fontFamily: rd.serif, fontSize: 9, fontWeight: 500,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>{it.by.name[0]}</span>
            <span style={{ fontSize: 10.5, color: rd.muted }}>
              <b style={{ color: rd.ink, fontWeight: 600 }}>{it.by.name}</b> · {it.by.role}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Section heading ──────────────────────────────────
function SecHead({ title, accent, action, onAction }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
      marginBottom: 12,
    }}>
      <span style={{
        fontFamily: rd.serif, fontSize: 19, color: rd.forestDeep,
        fontWeight: 500, letterSpacing: -0.3,
      }}>{title}</span>
      {(accent || action) && (
        <div onClick={onAction} style={{
          display: 'flex', alignItems: 'center', gap: 4,
          fontSize: 12, color: rd.forest, fontWeight: 500,
          cursor: onAction ? 'pointer' : 'default',
        }}>
          {action || accent}
          {action && (
            <svg width="6" height="10" viewBox="0 0 6 10"><path d="M1 1l4 4-4 4" stroke={rd.forest} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────
function RemindersDashboard({ onAddPerson } = {}) {
  const [who, setWho] = React.useState('Arjun');
  const [data, setData] = React.useState(reminders);

  const toggle = (medId) => {
    setData(prev => ({
      ...prev,
      [who]: {
        ...prev[who],
        meds: prev[who].meds.map(m => {
          if (m.id !== medId) return m;
          const next = m.status === 'done' ? 'upcoming' : 'done';
          return {
            ...m,
            status: next,
            by: next === 'done' ? { name: 'You', tone: '#1F3D38', role: 'Family' } : undefined,
          };
        }),
      },
    }));
  };

  const personData = data[who];
  const totalDue = personData.meds.filter(m => m.status === 'due').length;
  const next = personData.appointments[0];

  return (
    <div style={{
      width: '100%', height: '100%', background: rd.cream,
      fontFamily: rd.sans, color: rd.ink,
      display: 'flex', flexDirection: 'column', paddingTop: 56,
      position: 'relative',
    }}>
      {/* top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 24px 0',
      }}>
        <div>
          <div style={{ fontSize: 12.5, color: rd.muted, letterSpacing: 0.1 }}>Saturday, May 9</div>
          <div style={{
            fontFamily: rd.serif, fontSize: 26, lineHeight: '30px',
            letterSpacing: -0.6, color: rd.forestDeep, fontWeight: 400, marginTop: 2,
          }}>Hello, Priya</div>
        </div>
        <div style={{
          width: 40, height: 40, borderRadius: 12, background: '#fff',
          border: `1px solid ${rd.line}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}>
          {RDI.bell()}
          {totalDue > 0 && (
            <div style={{
              position: 'absolute', top: 9, right: 10,
              width: 7, height: 7, borderRadius: 99, background: rd.terracotta,
              border: '1.5px solid #fff',
            }} />
          )}
        </div>
      </div>

      {/* tiny status line — replaces big card */}
      <div style={{ padding: '12px 24px 0' }}>
        <div style={{ fontSize: 13.5, color: rd.muted, lineHeight: '18px', maxWidth: 340 }}>
          {totalDue > 0
            ? <React.Fragment><b style={{ color: rd.terracotta, fontWeight: 600 }}>{totalDue} medication{totalDue > 1 ? 's' : ''} due</b> · next visit <b style={{ color: rd.ink, fontWeight: 600 }}>{next.what.toLowerCase()}</b> {next.in ? `in ${next.in.replace('in ', '')}` : `${next.dayShort.toLowerCase()} ${next.date}`}.</React.Fragment>
            : <React.Fragment>All caught up on doses today. Next visit <b style={{ color: rd.ink, fontWeight: 600 }}>{next.what.toLowerCase()}</b>.</React.Fragment>}
        </div>
      </div>

      {/* scroll body */}
      <div style={{ flex: 1, overflow: 'auto', paddingBottom: 110 }}>
        {/* person chips */}
        <div style={{ padding: '18px 24px 0', display: 'flex', gap: 8 }}>
          {remPeople.map(p => {
            const active = who === p.k;
            return (
              <button key={p.k} onClick={() => setWho(p.k)} style={{
                flexShrink: 0, height: 38, padding: '0 14px 0 4px', borderRadius: 99,
                border: `1px solid ${active ? rd.forestDeep : rd.line}`,
                background: active ? rd.forestDeep : '#fff',
                color: active ? '#fff' : rd.ink,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
                fontFamily: rd.sans, fontSize: 13, fontWeight: 500,
              }}>
                <span style={{
                  width: 28, height: 28, borderRadius: 99, flexShrink: 0,
                  background: p.tint, color: '#fff',
                  fontFamily: rd.serif, fontSize: 12, fontWeight: 500,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{p.init}</span>
                <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.1 }}>
                  <span>{p.k}</span>
                  <span style={{ fontSize: 9, opacity: active ? 0.65 : 0.5, fontWeight: 500, letterSpacing: 0.2, marginTop: 1 }}>{p.rel}</span>
                </span>
              </button>
            );
          })}
          <button onClick={onAddPerson} style={{
            height: 38, width: 38, borderRadius: 99,
            border: `1px dashed ${rd.mutedSoft}`,
            background: 'transparent', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{RDI.plus(rd.muted)}</button>
        </div>

        {/* medications */}
        <div style={{ padding: '22px 20px 0' }}>
          <SecHead title="Today's medications" action="All meds" onAction={() => {}} />
          <MedReminders meds={personData.meds} onToggle={toggle} />
        </div>

        {/* appointments */}
        <div style={{ padding: '24px 0 0' }}>
          <div style={{ padding: '0 20px' }}>
            <SecHead title="Coming up" action="Calendar" onAction={() => {}} />
          </div>
          <div style={{
            display: 'flex', gap: 10, overflowX: 'auto',
            padding: '0 20px', scrollSnapType: 'x mandatory',
          }}>
            {personData.appointments.map((a, i) => <AppointmentCard key={i} a={a} />)}
          </div>
        </div>

        {/* recent activity */}
        <div style={{ padding: '24px 20px 0' }}>
          <SecHead title="Recent activity" action="Full feed" onAction={() => {}} />
          <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${rd.line}`, overflow: 'hidden' }}>
            {personData.recent.length === 0 ? (
              <div style={{ padding: 22, textAlign: 'center', fontSize: 12.5, color: rd.muted }}>
                Nothing logged in the last few hours.
              </div>
            ) : personData.recent.map((it, i) => (
              <RecentRow key={i} it={it} isLast={i === personData.recent.length - 1} />
            ))}
          </div>
        </div>

        {/* footer link */}
        <div style={{ padding: '22px 24px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1, height: 1, background: rd.line }} />
          <span style={{ fontSize: 11, color: rd.mutedSoft, letterSpacing: 0.3, textTransform: 'uppercase' }}>That's everything for now</span>
          <div style={{ flex: 1, height: 1, background: rd.line }} />
        </div>
      </div>

      {/* tab bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        paddingBottom: 24, paddingTop: 10,
        background: `linear-gradient(to top, ${rd.cream} 60%, rgba(246,241,234,0))`,
      }}>
        <div style={{
          margin: '0 16px', height: 60, borderRadius: 22,
          background: '#fff', border: `1px solid ${rd.line}`,
          boxShadow: '0 6px 24px rgba(31,61,56,0.06)',
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr',
          alignItems: 'center',
        }}>
          {[
            { l: 'Home',   a: true,  c: rd.forestDeep },
            { l: 'People', a: false, c: rd.muted },
            { l: 'Care',   a: false, c: rd.muted },
            { l: 'You',    a: false, c: rd.muted },
          ].map((t, i) => (
            <div key={i} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              color: t.c,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: 99, background: t.a ? rd.forestDeep : 'transparent' }} />
              <div style={{ fontSize: 11, fontWeight: t.a ? 600 : 500 }}>{t.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { RemindersDashboard });
