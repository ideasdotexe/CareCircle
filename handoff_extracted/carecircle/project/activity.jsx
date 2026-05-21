// CareCircle — Activity page
// Dedicated page showing the shared activity log between family and caregivers.

const ap = window.tokens;

const ApIcon = {
  back: (c = ap.ink) => (<svg width="9" height="16" viewBox="0 0 9 16"><path d="M8 1L1 8l7 7" stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  search: (c = ap.muted) => (<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke={c} strokeWidth="1.4"/><path d="M9.5 9.5L13 13" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>),
  filter: (c = '#fff') => (<svg width="14" height="12" viewBox="0 0 14 12" fill="none"><path d="M1 2h12M3 6h8M5 10h4" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></svg>),
  check: (c = '#fff') => (<svg width="12" height="10" viewBox="0 0 12 10" fill="none"><path d="M1 5l3 3 7-7" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  pill: (c = ap.forest) => (<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="5" width="14" height="6" rx="3" stroke={c} strokeWidth="1.4"/><path d="M8 5v6" stroke={c} strokeWidth="1.4"/></svg>),
  pulse: (c = ap.forest) => (<svg width="16" height="14" viewBox="0 0 16 14" fill="none"><path d="M1 7h3l2-5 4 10 2-5h3" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  note: (c = ap.forest) => (<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2h10v8l-3 3H2V2z" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/><path d="M9 13v-3h3" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/></svg>),
  doc: (c = ap.forest) => (<svg width="14" height="16" viewBox="0 0 14 16" fill="none"><path d="M2 1h7l4 4v10H2V1z" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/><path d="M9 1v4h4" stroke={c} strokeWidth="1.4"/></svg>),
  appt: (c = ap.forest) => (<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="2.5" width="12" height="10.5" rx="1.5" stroke={c} strokeWidth="1.4"/><path d="M1 5.5h12M4 1v2.5M10 1v2.5" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>),
};

// ─── Activity dataset (richer than the dashboard preview) ─
const apActivity = [
  {
    bucket: 'Today',
    dateLabel: 'Fri · May 9',
    items: [
      { type: 'med',   t: '8:00 AM', title: 'Metformin · 500 mg',  note: 'With breakfast', done: true,  by: { name: 'Anika', role: 'Caregiver', tone: '#C66E4E' } },
      { type: 'med',   t: '8:00 AM', title: 'Ramipril · 5 mg',     note: 'Morning dose',   done: true,  by: { name: 'Anika', role: 'Caregiver', tone: '#C66E4E' } },
      { type: 'med',   t: '8:00 AM', title: 'Aspirin · 81 mg',     note: 'With food',      done: true,  by: { name: 'Anika', role: 'Caregiver', tone: '#C66E4E' } },
      { type: 'vital', t: '9:15 AM', title: 'Blood pressure',      note: '152 / 96 mmHg', done: true, flagged: 'high', by: { name: 'Anika', role: 'Caregiver', tone: '#C66E4E' } },
      { type: 'note',  t: '10:20 AM', title: 'Anika added a note', note: '"Walked to the porch and back. A little short of breath."', done: true, by: { name: 'Anika', role: 'Caregiver', tone: '#C66E4E' } },
      { type: 'vital', t: '12:30 PM', title: 'Blood sugar',        note: '7.1 mmol/L · post-meal', done: true, by: { name: 'Anika', role: 'Caregiver', tone: '#C66E4E' } },
      { type: 'appt',  t: '4:30 PM',  title: 'Cardiology follow-up', note: 'Dr. Mei Chen · St. Michael\'s · Rm 412', done: false, due: 'In 5h' },
      { type: 'med',   t: '7:00 PM', title: 'Metformin · 500 mg',  note: 'With dinner',    done: false, due: 'Due in 2h' },
      { type: 'vital', t: '8:00 PM', title: 'Blood sugar',         note: 'Evening reading', done: false, due: 'Due tonight' },
      { type: 'med',   t: '8:00 PM', title: 'Warfarin · 3 mg',     note: 'Evening',        done: false, due: 'Due tonight' },
      { type: 'med',   t: '9:00 PM', title: 'Atorvastatin · 20 mg', note: 'Evening',       done: false, due: 'Due tonight' },
    ],
  },
  {
    bucket: 'Yesterday',
    dateLabel: 'Thu · May 8',
    items: [
      { type: 'med',   t: '8:00 AM', title: 'Metformin · 500 mg',  note: 'Breakfast dose', done: true,  by: { name: 'You',   role: 'Family',    tone: '#1F3D38' } },
      { type: 'med',   t: '8:00 AM', title: 'Ramipril · 5 mg',     note: 'Morning dose',   done: true,  by: { name: 'You',   role: 'Family',    tone: '#1F3D38' } },
      { type: 'vital', t: '9:00 AM', title: 'Blood pressure',      note: '134 / 84 mmHg',  done: true,  by: { name: 'You',   role: 'Family',    tone: '#1F3D38' } },
      { type: 'med',   t: '1:00 PM', title: 'Metformin · 500 mg',  note: 'Lunch dose',     done: true,  by: { name: 'Anika', role: 'Caregiver', tone: '#C66E4E' } },
      { type: 'vital', t: '6:30 PM', title: 'Blood pressure',      note: '128 / 82 mmHg',  done: true,  by: { name: 'Anika', role: 'Caregiver', tone: '#C66E4E' } },
      { type: 'note',  t: '7:10 PM', title: 'Anika left a note',   note: '"Walked 15 min after dinner, felt steady."', done: true, by: { name: 'Anika', role: 'Caregiver', tone: '#C66E4E' } },
      { type: 'med',   t: '9:00 PM', title: 'Warfarin · 3 mg',     note: 'Evening',        done: true,  by: { name: 'Anika', role: 'Caregiver', tone: '#C66E4E' } },
      { type: 'med',   t: '9:00 PM', title: 'Atorvastatin · 20 mg', note: 'Evening',       done: true,  by: { name: 'Anika', role: 'Caregiver', tone: '#C66E4E' } },
    ],
  },
  {
    bucket: 'Wed · May 7',
    items: [
      { type: 'doc',   t: '11:20 AM', title: 'Lab report uploaded', note: 'INR + lipid panel · LifeLabs', done: true,  by: { name: 'You', role: 'Family', tone: '#1F3D38' } },
      { type: 'vital', t: '8:00 PM',  title: 'Blood sugar',         note: '6.2 mmol/L',     done: true,  by: { name: 'Anika', role: 'Caregiver', tone: '#C66E4E' } },
      { type: 'note',  t: '8:30 PM',  title: 'Dr. Chen replied',    note: '"INR is on target. Continue current dose."', done: true, by: { name: 'Dr. Chen', role: 'Cardiology', tone: '#3F5D54' } },
    ],
  },
  {
    bucket: 'Tue · May 6',
    items: [
      { type: 'vital', t: '8:30 AM',  title: 'Weight',              note: '71.2 kg',        done: true,  by: { name: 'You',   role: 'Family',    tone: '#1F3D38' } },
      { type: 'med',   t: '9:00 PM',  title: 'Warfarin · 3 mg',     note: 'Evening',        done: true,  by: { name: 'Anika', role: 'Caregiver', tone: '#C66E4E' } },
      { type: 'note',  t: '9:45 PM',  title: 'You added a note',    note: '"Slept poorly, restless leg again."', done: true, by: { name: 'You', role: 'Family', tone: '#1F3D38' } },
    ],
  },
  {
    bucket: 'Mon · May 5',
    items: [
      { type: 'doc',   t: '2:15 PM',  title: 'Prescription added',  note: 'Atorvastatin 20 mg · Dr. Chen', done: true,  by: { name: 'You',   role: 'Family',    tone: '#1F3D38' } },
      { type: 'vital', t: '7:00 PM',  title: 'Blood pressure',      note: '142 / 90 mmHg', done: true, flagged: 'high', by: { name: 'Anika', role: 'Caregiver', tone: '#C66E4E' } },
    ],
  },
];

// ─── Type meta ────────────────────────────────────────
const apTypeMeta = {
  all:   { label: 'All',          icon: null },
  med:   { label: 'Meds',         icon: ApIcon.pill },
  vital: { label: 'Vitals',       icon: ApIcon.pulse },
  note:  { label: 'Notes',        icon: ApIcon.note },
  doc:   { label: 'Documents',    icon: ApIcon.doc },
  appt:  { label: 'Appointments', icon: ApIcon.appt },
};

function ApIconFor({ type, color }) {
  const m = apTypeMeta[type];
  if (!m || !m.icon) return null;
  return m.icon(color);
}

// ─── Activity row ─────────────────────────────────────
function ApRow({ item, isLast }) {
  const done = item.done;
  const flagged = item.flagged;
  const iconBg = flagged ? '#FBE3D9' : done ? ap.sageSoft : ap.cream;
  const iconColor = flagged ? ap.terracotta : done ? ap.forest : ap.muted;
  return (
    <div style={{
      display: 'flex', gap: 12, padding: '14px 14px',
      borderBottom: isLast ? 'none' : `1px solid ${ap.lineSoft}`,
      alignItems: 'flex-start',
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
        background: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginTop: 1,
      }}>
        <ApIconFor type={item.type} color={iconColor} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8,
        }}>
          <div style={{
            fontSize: 14, fontWeight: 600, color: ap.ink, letterSpacing: -0.1,
          }}>{item.title}</div>
          <div style={{
            fontSize: 11, color: ap.mutedSoft,
            fontFamily: 'ui-monospace, monospace', letterSpacing: 0.2, flexShrink: 0,
          }}>{item.t}</div>
        </div>
        <div style={{
          marginTop: 3, fontSize: 12, color: flagged ? ap.terracotta : ap.muted,
          lineHeight: '16px',
        }}>{item.note}</div>
        {/* footer */}
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          {done && item.by ? (
            <React.Fragment>
              <div style={{
                width: 20, height: 20, borderRadius: 99,
                background: item.by.tone, color: '#fff',
                fontFamily: ap.serif, fontSize: 10, fontWeight: 500,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{item.by.name[0]}</div>
              <div style={{ fontSize: 11, color: ap.muted }}>
                <span style={{ fontWeight: 600, color: ap.ink }}>{item.by.name}</span>
                <span style={{ color: ap.mutedSoft }}> · {item.by.role}</span>
              </div>
              {flagged && (
                <div style={{
                  marginLeft: 4, padding: '2px 7px', borderRadius: 99,
                  background: '#FBE3D9', color: ap.terracotta,
                  fontSize: 9.5, fontWeight: 700, letterSpacing: 0.4,
                }}>FLAGGED · {flagged.toUpperCase()}</div>
              )}
            </React.Fragment>
          ) : (
            <div style={{
              padding: '3px 9px', borderRadius: 99,
              background: ap.cream, border: `1px solid ${ap.line}`,
              fontSize: 10.5, color: ap.muted, fontWeight: 600, letterSpacing: 0.2,
            }}>{item.due || 'Pending'}</div>
          )}
        </div>
      </div>
      <div style={{
        width: 22, height: 22, borderRadius: 99, flexShrink: 0,
        border: `1.5px solid ${done ? ap.forest : ap.line}`,
        background: done ? ap.forest : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginTop: 8,
      }}>
        {done && ApIcon.check('#fff')}
      </div>
    </div>
  );
}

// ─── Daily summary card (top of each bucket) ──────────
function ApDaySummary({ bucket, items }) {
  const total = items.length;
  const done = items.filter(i => i.done).length;
  const pct = Math.round((done / total) * 100);
  const flagged = items.filter(i => i.flagged).length;
  const contributors = Array.from(new Map(items.filter(i => i.by).map(i => [i.by.name, i.by])).values());

  return (
    <div style={{
      padding: '12px 14px',
      background: bucket === 'Today' ? ap.forestDeep : '#fff',
      color: bucket === 'Today' ? '#fff' : ap.ink,
      border: bucket === 'Today' ? 'none' : `1px solid ${ap.line}`,
      borderRadius: 14,
      display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase',
          color: bucket === 'Today' ? 'rgba(255,255,255,0.7)' : ap.muted,
        }}>{bucket}</div>
        <div style={{
          fontFamily: ap.serif, fontSize: 15, fontWeight: 500, letterSpacing: -0.2,
          marginTop: 2,
        }}>
          {done} of {total} completed
          {flagged > 0 && (
            <span style={{
              marginLeft: 8, fontSize: 11, fontFamily: ap.sans,
              color: ap.terracottaSoft, fontWeight: 600, letterSpacing: 0.3,
            }}>· {flagged} flagged</span>
          )}
        </div>
      </div>
      {/* contributor avatars */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {contributors.slice(0, 3).map((p, i) => (
          <div key={i} style={{
            width: 24, height: 24, borderRadius: 99,
            background: p.tone, color: '#fff',
            fontFamily: ap.serif, fontSize: 11, fontWeight: 500,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: bucket === 'Today' ? '2px solid #15302C' : '2px solid #fff',
            marginLeft: i === 0 ? 0 : -8,
          }}>{p.name[0]}</div>
        ))}
      </div>
      {/* mini progress */}
      <div style={{
        width: 36, height: 36, borderRadius: 99, flexShrink: 0,
        position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="36" height="36" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
          <circle cx="18" cy="18" r="15" fill="none"
            stroke={bucket === 'Today' ? 'rgba(255,255,255,0.2)' : ap.line} strokeWidth="3" />
          <circle cx="18" cy="18" r="15" fill="none"
            stroke={bucket === 'Today' ? '#fff' : ap.forest} strokeWidth="3" strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 15}
            strokeDashoffset={2 * Math.PI * 15 * (1 - pct / 100)} />
        </svg>
        <span style={{
          fontFamily: 'ui-monospace, monospace', fontSize: 9.5, fontWeight: 700,
          letterSpacing: 0.3, position: 'relative',
        }}>{pct}%</span>
      </div>
    </div>
  );
}

// ─── Activity page ────────────────────────────────────
function ActivityPage({ initialFilter = 'all' } = {}) {
  const [filter, setFilter] = React.useState(initialFilter); // 'all' | 'med' | 'vital' | 'note' | 'doc' | 'appt'
  const [who, setWho] = React.useState('Arjun'); // person scope

  // filter buckets by type
  const filtered = apActivity.map(g => ({
    ...g,
    items: filter === 'all' ? g.items : g.items.filter(i => i.type === filter),
  })).filter(g => g.items.length > 0);

  const todayCount = (apActivity[0]?.items || []).length;
  const todayDone = (apActivity[0]?.items || []).filter(i => i.done).length;

  return (
    <div style={{
      width: '100%', height: '100%', background: ap.cream,
      fontFamily: ap.sans, color: ap.ink,
      display: 'flex', flexDirection: 'column', paddingTop: 56,
      position: 'relative',
    }}>
      {/* top bar */}
      <div style={{
        padding: '14px 24px 0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 12,
          background: '#fff', border: `1px solid ${ap.line}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{ApIcon.back()}</div>
        <div style={{
          fontFamily: ap.serif, fontSize: 17, color: ap.forestDeep,
          fontWeight: 500, letterSpacing: -0.2,
        }}>Activity</div>
        <div style={{
          width: 36, height: 36, borderRadius: 12,
          background: '#fff', border: `1px solid ${ap.line}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{ApIcon.search()}</div>
      </div>

      {/* header line */}
      <div style={{ padding: '20px 24px 0' }}>
        <div style={{
          fontFamily: ap.serif, fontSize: 28, lineHeight: '32px',
          letterSpacing: -0.7, color: ap.forestDeep, fontWeight: 400,
        }}>The shared log<br />of {who}'s care.</div>
        <div style={{ marginTop: 8, fontSize: 13, color: ap.muted, lineHeight: '18px' }}>
          Every dose, vital, and note left by family or caregiver — grouped by day, with who logged it.
        </div>
      </div>

      {/* person + filter row */}
      <div style={{ padding: '18px 20px 0', display: 'flex', gap: 8 }}>
        {[
          { k: 'Arjun',  rel: 'Father', tone: '#3F5D54', init: 'A' },
          { k: 'Indira', rel: 'Mother', tone: '#C66E4E', init: 'I' },
        ].map(p => {
          const active = who === p.k;
          return (
            <button key={p.k} onClick={() => setWho(p.k)} style={{
              flexShrink: 0, height: 40, padding: '0 14px 0 4px', borderRadius: 99,
              cursor: 'pointer',
              border: `1px solid ${active ? ap.forestDeep : ap.line}`,
              background: active ? ap.forestDeep : '#fff',
              color: active ? '#fff' : ap.ink,
              display: 'flex', alignItems: 'center', gap: 8,
              fontFamily: ap.sans, fontSize: 13, fontWeight: 500,
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: 99, flexShrink: 0,
                background: p.tone, color: '#fff',
                fontFamily: ap.serif, fontSize: 13, fontWeight: 500,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{p.init}</div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.1 }}>
                <span>{p.k}</span>
                <span style={{ fontSize: 9.5, opacity: active ? 0.65 : 0.5, fontWeight: 500, letterSpacing: 0.2, marginTop: 2 }}>{p.rel}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* type filter strip */}
      <div style={{
        padding: '12px 20px 0',
        display: 'flex', gap: 7, overflowX: 'auto',
      }}>
        {Object.entries(apTypeMeta).map(([k, m]) => {
          const active = filter === k;
          return (
            <button key={k} onClick={() => setFilter(k)} style={{
              flexShrink: 0, height: 32, padding: m.icon ? '0 12px 0 6px' : '0 12px',
              borderRadius: 99, cursor: 'pointer',
              border: `1px solid ${active ? ap.forestDeep : ap.line}`,
              background: active ? ap.forestDeep : '#fff',
              color: active ? '#fff' : ap.ink,
              display: 'flex', alignItems: 'center', gap: 6,
              fontFamily: ap.sans, fontSize: 12.5, fontWeight: 500,
              letterSpacing: -0.1,
            }}>
              {m.icon && (
                <div style={{
                  width: 22, height: 22, borderRadius: 99,
                  background: active ? 'rgba(255,255,255,0.15)' : ap.cream,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{m.icon(active ? '#fff' : ap.forest)}</div>
              )}
              {m.label}
            </button>
          );
        })}
      </div>

      {/* body */}
      <div style={{ flex: 1, overflow: 'auto', paddingBottom: 110, paddingTop: 16 }}>
        {filtered.map((group, gi) => (
          <div key={gi} style={{ padding: '0 20px 18px' }}>
            <ApDaySummary bucket={group.bucket} items={group.items} />
            <div style={{
              background: '#fff', borderRadius: 16, border: `1px solid ${ap.line}`,
              overflow: 'hidden',
            }}>
              {group.items.map((it, i) => (
                <ApRow key={i} item={it} isLast={i === group.items.length - 1} />
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: ap.muted, fontSize: 13 }}>
            Nothing logged of this kind yet.
          </div>
        )}
      </div>

      {/* tab bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        paddingBottom: 24, paddingTop: 10,
        background: `linear-gradient(to top, ${ap.cream} 60%, rgba(246,241,234,0))`,
      }}>
        <div style={{
          margin: '0 16px', height: 60, borderRadius: 22,
          background: '#fff', border: `1px solid ${ap.line}`,
          boxShadow: '0 6px 24px rgba(31,61,56,0.06)',
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr',
          alignItems: 'center',
        }}>
          {[
            { l: 'Home',   a: true,  c: ap.forestDeep },
            { l: 'People', a: false, c: ap.muted },
            { l: 'Care',   a: false, c: ap.muted },
            { l: 'You',    a: false, c: ap.muted },
          ].map((t, i) => (
            <div key={i} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              color: t.c,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: 99, background: t.a ? ap.forestDeep : 'transparent' }} />
              <div style={{ fontSize: 11, fontWeight: t.a ? 600 : 500 }}>{t.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ActivityPage });
