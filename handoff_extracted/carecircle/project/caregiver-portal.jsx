// CareCircle — Caregiver portal (Today · Profile · Activity)
// Editable self-profile that mirrors the user-side "Find caregiver · profile"

const cp = window.tokens;

// ─────────────────────────────────────────────────────────
// Data — assigned visits today (from POV of Priya, a PSW)
// ─────────────────────────────────────────────────────────
const cpToday = {
  date: 'Tuesday, May 12',
  visits: [
    {
      id: 'arjun',
      name: 'Arjun Sharma',
      short: 'Arjun',
      age: 78,
      tint: '#3F5D54',
      init: 'AS',
      relTo: 'Priya (daughter)',
      window: '9:00 – 11:30 AM',
      windowState: 'next', // 'next' | 'later' | 'done'
      address: '142 Donlands Ave · East York',
      allergies: ['Penicillin', 'Sulfa drugs', 'Peanuts'],
      conditions: ['Hypertension', 'Type 2 Diabetes', 'A-Fib'],
      meds: [
        { name: 'Metformin',    dose: '500 mg', note: 'with breakfast', when: '8 AM', state: 'pending' },
        { name: 'Ramipril',     dose: '5 mg',   note: '',               when: '8 AM', state: 'pending' },
        { name: 'Aspirin',      dose: '81 mg',  note: '',               when: '8 AM', state: 'pending' },
        { name: 'Atorvastatin', dose: '20 mg',  note: 'after dinner',   when: '8 PM', state: 'later' },
      ],
      vitals: [
        { kind: 'Blood pressure', why: 'Daily — flagged high yesterday (152/96)', urgent: true },
        { kind: 'Blood sugar',    why: 'Fasting, before breakfast',                urgent: false },
      ],
      notes: [
        { from: 'Priya', rel: 'Daughter', when: 'Yesterday · 9:42 PM', body: "Dad mentioned dizziness when standing up yesterday — please monitor and skip the morning walk if he seems unsteady." },
        { from: 'Dr. Chen', rel: 'Cardiologist', when: 'Mon · via app', body: "If BP reads above 160/100 twice in a row, call me before adjusting any meds." },
      ],
    },
    {
      id: 'indira',
      name: 'Indira Sharma',
      short: 'Indira',
      age: 74,
      tint: '#C66E4E',
      init: 'IS',
      relTo: 'Priya (daughter)',
      window: '3:00 – 4:30 PM',
      windowState: 'later',
      address: '142 Donlands Ave · East York',
      allergies: ['Latex'],
      conditions: ['Hypothyroidism'],
      meds: [
        { name: 'Calcium + D₃', dose: '600 mg', note: '4 hrs after Levo', when: '3 PM', state: 'pending' },
      ],
      vitals: [],
      notes: [
        { from: 'Priya', rel: 'Daughter', when: 'Today · 7:10 AM', body: "Mum is having her hair done at 2 PM — can you arrive a little after 3 to give her time to settle?" },
      ],
    },
  ],
};

// Priya's own profile (editable)
const cpSelf = {
  id: 'priya-mehta',
  name: 'Priya Mehta',
  initials: 'PM',
  photoTone: ['#C66E4E', '#B05E40'],
  title: 'Personal Support Worker',
  yearsExp: 9,
  verified: true,
  city: 'Toronto',
  region: 'East York',
  province: 'ON',
  country: 'Canada',
  rate: 28,
  rating: 4.9,
  reviewCount: 142,
  languages: ['English', 'Hindi', 'Punjabi'],
  specialties: ['Dementia', 'Post-op', 'Diabetes care'],
  available: 'Weekdays · evenings',
  bio: 'Nine years of in-home support across the GTA, with a special focus on dementia and post-surgical recovery. Calm, reliable, gentle with anxious clients.',
  visibleInSearch: true,
  acceptingClients: true,
  email: 'priya.mehta@example.ca',
  phone: '+1 (416) 555-0148',
};

// ─────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────
const CP = {
  back: (c = cp.ink) => (<svg width="9" height="16" viewBox="0 0 9 16"><path d="M8 1L1 8l7 7" stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  bell: (c = cp.ink) => (<svg width="16" height="18" viewBox="0 0 16 18" fill="none"><path d="M8 1.5v1.5M3 7a5 5 0 1110 0v3l1 2.5H2L3 10V7z" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  dots: (c = cp.ink) => (<svg width="22" height="6" viewBox="0 0 22 6"><circle cx="3" cy="3" r="2" fill={c}/><circle cx="11" cy="3" r="2" fill={c}/><circle cx="19" cy="3" r="2" fill={c}/></svg>),
  warn: (c = '#fff') => (<svg width="12" height="12" viewBox="0 0 12 12"><path d="M6 1l5 10H1L6 1z" fill={c}/></svg>),
  pill: (c = cp.forest) => (<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="4.5" width="12" height="5" rx="2.5" stroke={c} strokeWidth="1.3"/><path d="M7 4.5v5" stroke={c} strokeWidth="1.3"/></svg>),
  pulse: (c = cp.forest) => (<svg width="14" height="12" viewBox="0 0 14 12" fill="none"><path d="M1 6h2.5L5 1l3 10 1.5-5H13" stroke={c} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  note: (c = cp.forest) => (<svg width="13" height="14" viewBox="0 0 13 14" fill="none"><path d="M1.5 1h7l3.5 3.5V13h-10.5V1z" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/><path d="M4 7h5M4 10h4" stroke={c} strokeWidth="1.3" strokeLinecap="round"/></svg>),
  pin: (c = cp.muted) => (<svg width="11" height="13" viewBox="0 0 11 13" fill="none"><path d="M5.5 1a4 4 0 014 4c0 3-4 7-4 7s-4-4-4-7a4 4 0 014-4z" stroke={c} strokeWidth="1.3"/><circle cx="5.5" cy="5" r="1.5" stroke={c} strokeWidth="1.3"/></svg>),
  clock: (c = cp.muted) => (<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke={c} strokeWidth="1.3"/><path d="M6 3v3.2L8 7.5" stroke={c} strokeWidth="1.3" strokeLinecap="round"/></svg>),
  check: (c = '#fff', sw = 1.8) => (<svg width="12" height="10" viewBox="0 0 12 10"><path d="M1 5l3 3 7-7" stroke={c} strokeWidth={sw} fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  eye: (c = cp.forest) => (<svg width="14" height="10" viewBox="0 0 14 10" fill="none"><path d="M1 5s2-4 6-4 6 4 6 4-2 4-6 4S1 5 1 5z" stroke={c} strokeWidth="1.3"/><circle cx="7" cy="5" r="1.5" stroke={c} strokeWidth="1.3"/></svg>),
  pencil: (c = cp.muted) => (<svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M8 1l3 3-7 7H1v-3l7-7z" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/></svg>),
  star: (c = '#D49542', filled = true) => (<svg width="10" height="10" viewBox="0 0 11 11"><path d="M5.5 1l1.4 2.8 3.1.5-2.3 2.2.5 3.1L5.5 8.1 2.8 9.6l.5-3.1L1 4.3l3.1-.5L5.5 1z" fill={filled ? c : 'none'} stroke={c} strokeWidth="1"/></svg>),
  verified: () => (<svg width="11" height="11" viewBox="0 0 11 11"><path d="M5.5 1l1.2.8 1.4-.2.4 1.4 1.2.9-.6 1.3.4 1.4-1.3.4-.7 1.3-1.4-.4L5.5 8l-1-1-1.4.4-.7-1.3-1.3-.4.4-1.4L1 3l1.2-.9.4-1.4 1.4.2L5.5 1z" fill="#fff"/><path d="M3.5 5.5l1.5 1.5 3-3" stroke={cp.forest} strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  plus: (c = cp.muted) => (<svg width="10" height="10" viewBox="0 0 10 10"><path d="M5 1v8M1 5h8" stroke={c} strokeWidth="1.6" strokeLinecap="round"/></svg>),
  x: (c = cp.mutedSoft) => (<svg width="8" height="8" viewBox="0 0 10 10"><path d="M2 2l6 6M8 2l-6 6" stroke={c} strokeWidth="1.6" strokeLinecap="round"/></svg>),
  chev: (c = cp.muted) => (<svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1l5 5-5 5" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  home: (c = cp.muted) => (<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 7l6-5 6 5v7a1 1 0 01-1 1H3a1 1 0 01-1-1V7z" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/></svg>),
  person: (c = cp.muted) => (<svg width="14" height="16" viewBox="0 0 14 16" fill="none"><circle cx="7" cy="4.5" r="3" stroke={c} strokeWidth="1.4"/><path d="M1 15c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>),
  pulseTab: (c = cp.muted) => (<svg width="16" height="14" viewBox="0 0 16 14" fill="none"><path d="M1 7h2.5L5 1l3 12 2-7 1.5 5H15" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>),
};

// ─────────────────────────────────────────────────────────
// Shared atoms
// ─────────────────────────────────────────────────────────
function CPAvatar({ init, tint, size = 38 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 99, flexShrink: 0,
      background: tint, color: '#fff',
      fontFamily: cp.serif, fontWeight: 500, fontSize: size * 0.38,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      letterSpacing: 0.3,
    }}>{init}</div>
  );
}

function CPSectionTitle({ title, count, accent }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontFamily: cp.serif, fontSize: 16, color: cp.forestDeep, fontWeight: 500, letterSpacing: -0.3 }}>{title}</span>
        {count != null && (
          <span style={{ fontSize: 11, fontFamily: 'ui-monospace, monospace', color: cp.muted, letterSpacing: 0.4 }}>
            {String(count).padStart(2, '0')}
          </span>
        )}
      </div>
      {accent && <span style={{ fontSize: 11, color: cp.muted, letterSpacing: 0.2 }}>{accent}</span>}
    </div>
  );
}

function CPPhotoTile({ tones, initials, size = 84, radius = 20 }) {
  const [a, b] = tones;
  return (
    <div style={{
      width: size, height: size, borderRadius: radius, flexShrink: 0,
      background: `repeating-linear-gradient(135deg, ${a} 0 6px, ${b} 6px 12px)`,
      display: 'flex', alignItems: 'flex-end', padding: 6, position: 'relative', overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.15)',
    }}>
      <div style={{
        fontFamily: cp.serif, fontSize: size * 0.32, color: '#fff',
        fontWeight: 500, letterSpacing: -0.5, lineHeight: 1,
        textShadow: '0 1px 2px rgba(0,0,0,0.15)',
      }}>{initials}</div>
      <svg width={size * 0.7} height={size * 0.7} viewBox="0 0 50 50"
           style={{ position: 'absolute', right: -size * 0.15, top: -size * 0.15, opacity: 0.2 }}>
        <circle cx="25" cy="25" r="22" stroke="#fff" strokeWidth="1" fill="none"/>
        <circle cx="25" cy="25" r="14" stroke="#fff" strokeWidth="1" fill="none"/>
      </svg>
    </div>
  );
}

// =========================================================
// TAB BAR — Today / Profile / Activity
// =========================================================
function CPTabBar({ active, onChange }) {
  const items = [
    { k: 'today',    label: 'Today',    Ico: CP.home },
    { k: 'profile',  label: 'Profile',  Ico: CP.person },
    { k: 'activity', label: 'Activity', Ico: CP.pulseTab },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      paddingBottom: 22, paddingTop: 10,
      background: `linear-gradient(to top, ${cp.cream} 60%, rgba(246,241,234,0))`,
    }}>
      <div style={{
        margin: '0 16px', height: 64, borderRadius: 22,
        background: '#fff', border: `1px solid ${cp.line}`,
        boxShadow: '0 6px 24px rgba(31,61,56,0.06)',
        display: 'grid', gridTemplateColumns: `repeat(${items.length}, 1fr)`,
        alignItems: 'center',
      }}>
        {items.map(({ k, label, Ico }) => {
          const a = k === active;
          return (
            <div key={k} onClick={() => onChange && onChange(k)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              color: a ? cp.forestDeep : cp.muted, cursor: 'pointer',
            }}>
              <Ico c={a ? cp.forestDeep : cp.muted} />
              <div style={{ fontSize: 11, fontWeight: a ? 600 : 500, letterSpacing: -0.1 }}>{label}</div>
              <div style={{ width: 18, height: 2, borderRadius: 99, background: a ? cp.forestDeep : 'transparent', marginTop: -2 }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =========================================================
// SCREEN — Today (assigned visits)
// =========================================================
function CPToday({ self }) {
  return (
    <div style={{
      width: '100%', height: '100%', background: cp.cream,
      fontFamily: cp.sans, color: cp.ink,
      display: 'flex', flexDirection: 'column', paddingTop: 56,
    }}>
      {/* role mode strip */}
      <div style={{ position: 'absolute', top: 56, left: 0, right: 0, height: 4, background: cp.terracotta, opacity: 0.85 }} />

      {/* header */}
      <div style={{
        padding: '18px 24px 0', display: 'flex',
        alignItems: 'flex-start', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 10, color: cp.terracotta, letterSpacing: 0.6, textTransform: 'uppercase', fontWeight: 700 }}>
            Caregiver portal
          </div>
          <div style={{
            fontFamily: cp.serif, fontSize: 26, lineHeight: '30px',
            color: cp.forestDeep, fontWeight: 400, marginTop: 4, letterSpacing: -0.6,
          }}>Hello, {self.name.split(' ')[0]}</div>
          <div style={{ fontSize: 12.5, color: cp.muted, marginTop: 4 }}>
            {cpToday.date} · {cpToday.visits.length} visits scheduled
          </div>
        </div>
        <div style={{
          width: 36, height: 36, borderRadius: 12,
          background: '#fff', border: `1px solid ${cp.line}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{CP.bell()}</div>
      </div>

      {/* timeline summary */}
      <div style={{ padding: '16px 20px 0' }}>
        <div style={{
          background: '#fff', border: `1px solid ${cp.line}`, borderRadius: 14,
          padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: 9, background: cp.sageSoft, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{CP.clock(cp.forest)}</div>
          <div style={{ flex: 1, fontSize: 12, color: cp.muted, lineHeight: '15px' }}>
            Next visit · <b style={{ color: cp.ink, fontWeight: 600 }}>Arjun Sharma</b> at <b style={{ color: cp.ink, fontWeight: 600 }}>9:00 AM</b>
            <div style={{ fontSize: 10.5, color: cp.mutedSoft }}>3 meds to confirm · 2 vitals to log</div>
          </div>
          <div style={{
            padding: '6px 11px', borderRadius: 99,
            background: cp.forestDeep, color: '#fff',
            fontSize: 11, fontWeight: 600, letterSpacing: -0.1,
          }}>Start</div>
        </div>
      </div>

      {/* visit cards */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 20px 110px' }}>
        {cpToday.visits.map((v, i) => (
          <CPVisitCard key={v.id} v={v} idx={i} />
        ))}

        <div style={{ marginTop: 14, padding: '0 4px', fontSize: 11, color: cp.mutedSoft, lineHeight: '16px', display: 'flex', gap: 6 }}>
          <span style={{ marginTop: 1 }}>{CP.note(cp.mutedSoft)}</span>
          <span>Allergies, conditions and notes are shared by the family. Tap any card to see the full profile.</span>
        </div>
      </div>
    </div>
  );
}

function CPVisitCard({ v, idx }) {
  const isNext = v.windowState === 'next';
  return (
    <div style={{
      background: '#fff', borderRadius: 20,
      border: `1px solid ${cp.line}`,
      marginBottom: 14, overflow: 'hidden',
      position: 'relative',
    }}>
      {/* status ribbon */}
      <div style={{
        height: 5, background: isNext ? cp.forestDeep : cp.lineSoft,
      }} />

      {/* visit header */}
      <div style={{ padding: '14px 16px 0', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <CPAvatar init={v.init} tint={v.tint} size={46} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: cp.serif, fontSize: 19, color: cp.forestDeep, fontWeight: 500, letterSpacing: -0.3 }}>
              {v.name}
            </span>
            <span style={{ fontSize: 11.5, color: cp.muted }}>· {v.age}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {CP.clock(cp.muted)}
              <span style={{ fontSize: 11.5, color: cp.muted }}>{v.window}</span>
            </div>
            <span style={{ color: cp.line }}>·</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {CP.pin(cp.mutedSoft)}
              <span style={{ fontSize: 11.5, color: cp.muted }}>{v.address.split('·')[1].trim()}</span>
            </div>
          </div>
        </div>
        <div style={{
          padding: '4px 10px', borderRadius: 99,
          background: isNext ? cp.terracottaSoft : cp.cream,
          color: isNext ? '#7A3F2A' : cp.muted,
          fontSize: 9.5, fontWeight: 700, letterSpacing: 0.4,
          textTransform: 'uppercase', flexShrink: 0,
        }}>{isNext ? 'Up next' : 'Later'}</div>
      </div>

      {/* ALLERGIES — always on top */}
      <div style={{ padding: '14px 16px 0' }}>
        <div style={{
          background: '#FBE3D9', borderRadius: 12, padding: '10px 12px',
          display: 'flex', alignItems: 'flex-start', gap: 10,
          border: `1px solid #F2C9B8`,
        }}>
          <div style={{
            width: 24, height: 24, borderRadius: 7,
            background: cp.terracotta, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginTop: 1,
          }}>{CP.warn('#fff')}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 9.5, color: '#7A3F2A', letterSpacing: 0.5,
              textTransform: 'uppercase', fontWeight: 700,
            }}>Allergies</div>
            <div style={{ fontSize: 13, color: '#5C2A1F', fontWeight: 600, marginTop: 2, lineHeight: '17px', letterSpacing: -0.1 }}>
              {v.allergies.join(' · ')}
            </div>
          </div>
        </div>
      </div>

      {/* conditions chip row */}
      {v.conditions.length > 0 && (
        <div style={{ padding: '12px 16px 0', display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {v.conditions.map((c, i) => (
            <span key={i} style={{
              padding: '3px 8px', borderRadius: 99,
              background: cp.cream, border: `1px solid ${cp.lineSoft}`,
              fontSize: 10.5, color: cp.muted, fontWeight: 500, letterSpacing: 0.1,
            }}>{c}</span>
          ))}
        </div>
      )}

      {/* MEDICATIONS */}
      {v.meds.length > 0 && (
        <div style={{ padding: '16px 16px 0' }}>
          <CPSubHeader icon={CP.pill(cp.forest)} title="Medications" count={v.meds.filter(m => m.state === 'pending').length + ' to give'} />
          <div style={{ background: cp.cream, borderRadius: 12, padding: 4 }}>
            {v.meds.map((m, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 10px',
                borderBottom: i < v.meds.length - 1 ? `1px solid ${cp.lineSoft}` : 'none',
                opacity: m.state === 'later' ? 0.5 : 1,
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 99, flexShrink: 0,
                  border: `1.5px solid ${cp.line}`,
                  background: '#fff',
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: cp.ink, letterSpacing: -0.1 }}>{m.name}</span>
                    <span style={{ fontSize: 11, color: cp.muted }}>{m.dose}</span>
                  </div>
                  {(m.note || m.state === 'later') && (
                    <div style={{ fontSize: 10.5, color: cp.mutedSoft, marginTop: 1 }}>
                      {m.state === 'later' ? `Evening dose · ${m.note}` : m.note}
                    </div>
                  )}
                </div>
                <span style={{
                  padding: '2px 7px', borderRadius: 5,
                  background: '#fff', border: `1px solid ${cp.lineSoft}`,
                  fontFamily: 'ui-monospace, monospace',
                  fontSize: 10, color: cp.muted, letterSpacing: 0.2,
                }}>{m.when}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VITALS TO LOG */}
      {v.vitals.length > 0 && (
        <div style={{ padding: '14px 16px 0' }}>
          <CPSubHeader icon={CP.pulse(cp.forest)} title="Log vitals" count={v.vitals.length} />
          <div style={{ display: 'grid', gridTemplateColumns: v.vitals.length === 1 ? '1fr' : '1fr 1fr', gap: 6 }}>
            {v.vitals.map((vv, i) => (
              <div key={i} style={{
                background: vv.urgent ? '#FBE3D9' : cp.cream,
                border: `1px solid ${vv.urgent ? '#F2C9B8' : cp.lineSoft}`,
                borderRadius: 11, padding: '10px 11px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    fontSize: 12.5, fontWeight: 600, color: cp.ink, letterSpacing: -0.1,
                  }}>{vv.kind}</span>
                  {vv.urgent && (
                    <span style={{
                      padding: '1px 5px', borderRadius: 99,
                      background: cp.terracotta, color: '#fff',
                      fontSize: 8.5, fontWeight: 700, letterSpacing: 0.4,
                    }}>PRIORITY</span>
                  )}
                </div>
                <div style={{ fontSize: 10.5, color: cp.muted, marginTop: 3, lineHeight: '14px' }}>{vv.why}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NOTES FROM USER */}
      {v.notes.length > 0 && (
        <div style={{ padding: '14px 16px 0' }}>
          <CPSubHeader icon={CP.note(cp.forest)} title="Notes from family" count={v.notes.length} />
          {v.notes.map((n, i) => (
            <div key={i} style={{
              background: '#FBF7F1', borderLeft: `2.5px solid ${cp.forest}`,
              borderRadius: '4px 11px 11px 4px', padding: '9px 11px',
              marginBottom: i < v.notes.length - 1 ? 6 : 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: cp.forestDeep, letterSpacing: -0.1 }}>{n.from}</span>
                <span style={{ fontSize: 10, color: cp.mutedSoft, letterSpacing: 0.2 }}>{n.rel} · {n.when}</span>
              </div>
              <div style={{ marginTop: 4, fontSize: 12.5, color: cp.ink, lineHeight: '17px', letterSpacing: -0.05, textWrap: 'pretty' }}>
                "{n.body}"
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CTA */}
      <div style={{ padding: '14px 16px 16px', display: 'flex', gap: 8 }}>
        <button style={{
          flex: 1, height: 42, borderRadius: 12, border: 'none', cursor: 'pointer',
          background: isNext ? cp.forestDeep : '#fff',
          color: isNext ? '#fff' : cp.forestDeep,
          border: isNext ? 'none' : `1px solid ${cp.forestDeep}`,
          fontFamily: cp.sans, fontSize: 13, fontWeight: 600, letterSpacing: -0.1,
        }}>{isNext ? 'Start visit' : 'View full profile'}</button>
        <button style={{
          width: 42, height: 42, borderRadius: 12, border: `1px solid ${cp.line}`,
          background: '#fff', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{CP.dots(cp.muted)}</button>
      </div>
    </div>
  );
}

function CPSubHeader({ icon, title, count }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
      <div style={{
        width: 22, height: 22, borderRadius: 6, background: cp.sageSoft,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{icon}</div>
      <span style={{ fontSize: 11.5, fontWeight: 600, color: cp.forestDeep, letterSpacing: 0.1, textTransform: 'uppercase' }}>
        {title}
      </span>
      {count != null && (
        <span style={{ fontSize: 10.5, color: cp.mutedSoft, letterSpacing: 0.3 }}>· {count}</span>
      )}
    </div>
  );
}

// =========================================================
// SCREEN — Profile (editable self)
// =========================================================
function CPProfile({ self: initSelf, onPreview }) {
  const [self, setSelf] = React.useState(initSelf);
  const set = (k, v) => setSelf(s => ({ ...s, [k]: v }));

  return (
    <div style={{
      width: '100%', height: '100%', background: cp.cream,
      fontFamily: cp.sans, color: cp.ink,
      display: 'flex', flexDirection: 'column', paddingTop: 56,
    }}>
      <div style={{ position: 'absolute', top: 56, left: 0, right: 0, height: 4, background: cp.terracotta, opacity: 0.85 }} />

      {/* top bar */}
      <div style={{ padding: '14px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 10, color: cp.terracotta, letterSpacing: 0.6, textTransform: 'uppercase', fontWeight: 700 }}>
          Your profile
        </div>
        <div onClick={onPreview} style={{
          padding: '6px 11px', borderRadius: 99,
          background: '#fff', border: `1px solid ${cp.line}`,
          fontSize: 11.5, color: cp.forestDeep, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer',
        }}>{CP.eye()} See preview</div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', paddingBottom: 110 }}>
        {/* hero */}
        <div style={{ padding: '14px 24px 0', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <div style={{ position: 'relative' }}>
            <CPPhotoTile tones={self.photoTone} initials={self.initials} size={84} radius={20} />
            <div style={{
              position: 'absolute', bottom: -4, right: -4,
              width: 28, height: 28, borderRadius: 99,
              background: '#fff', border: `1px solid ${cp.line}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.08)', cursor: 'pointer',
            }}>{CP.pencil(cp.forestDeep)}</div>
          </div>
          <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
            <CPField
              value={self.name}
              onChange={v => set('name', v)}
              style={{
                fontFamily: cp.serif, fontSize: 22, color: cp.forestDeep,
                fontWeight: 500, letterSpacing: -0.4, lineHeight: '26px',
              }}
            />
            <CPField
              value={self.title}
              onChange={v => set('title', v)}
              style={{
                fontSize: 12.5, color: cp.muted, marginTop: 4, lineHeight: '17px',
              }}
            />
            {self.verified && (
              <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '3px 8px', borderRadius: 99, background: cp.forest, color: '#fff',
                fontSize: 9.5, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase',
              }}>{CP.verified()} Verified pro</div>
            )}
          </div>
        </div>

        {/* visibility toggles */}
        <div style={{ padding: '20px 20px 0' }}>
          <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${cp.line}`, overflow: 'hidden' }}>
            <CPToggleRow
              label="Visible in search"
              sub="Families can find you when searching for caregivers."
              on={self.visibleInSearch}
              onToggle={() => set('visibleInSearch', !self.visibleInSearch)}
            />
            <div style={{ height: 1, background: cp.lineSoft, margin: '0 14px' }} />
            <CPToggleRow
              label="Accepting new clients"
              sub="Shows a green ‘available now’ tag on your profile."
              on={self.acceptingClients}
              onToggle={() => set('acceptingClients', !self.acceptingClients)}
            />
          </div>
        </div>

        {/* stat strip */}
        <div style={{ padding: '20px 20px 0', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <CPStatEditable big={self.yearsExp} label="Years exp." onChange={v => set('yearsExp', +v || 0)} suffix="" />
          <CPStatStatic big={self.rating.toFixed(1)} label={`${self.reviewCount} reviews`} stars />
          <CPStatEditable big={self.rate} label="Rate /hr" onChange={v => set('rate', +v || 0)} prefix="$" />
        </div>

        {/* bio */}
        <div style={{ padding: '22px 24px 0' }}>
          <CPSectionTitle title="About" accent={`${self.bio.length}/500`} />
          <textarea
            value={self.bio}
            onChange={e => set('bio', e.target.value.slice(0, 500))}
            rows={5}
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: 14, borderRadius: 14,
              background: '#fff', border: `1px solid ${cp.line}`,
              fontSize: 13.5, fontFamily: cp.sans, color: cp.ink,
              lineHeight: '19px', letterSpacing: -0.05,
              outline: 'none', resize: 'none',
            }}
          />
        </div>

        {/* specialties */}
        <div style={{ padding: '20px 24px 0' }}>
          <CPSectionTitle title="Specialties" accent="add up to 6" />
          <CPChipsEditor items={self.specialties} onChange={v => set('specialties', v)} placeholder="Add specialty" />
        </div>

        {/* languages */}
        <div style={{ padding: '20px 24px 0' }}>
          <CPSectionTitle title="Languages" />
          <CPChipsEditor items={self.languages} onChange={v => set('languages', v)} placeholder="Add language" />
        </div>

        {/* location & availability */}
        <div style={{ padding: '20px 20px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <CPInfoEditable label="Region" value={self.region} onChange={v => set('region', v)} />
          <CPInfoEditable label="City" value={self.city} onChange={v => set('city', v)} />
          <CPInfoEditable label="Province" value={self.province} onChange={v => set('province', v)} />
          <CPInfoEditable label="Country" value={self.country} onChange={v => set('country', v)} />
          <div style={{ gridColumn: '1 / span 2' }}>
            <CPInfoEditable label="Available" value={self.available} onChange={v => set('available', v)} />
          </div>
        </div>

        {/* contact */}
        <div style={{ padding: '20px 20px 0' }}>
          <CPSectionTitle title="Contact" accent="never shown publicly" />
          <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${cp.line}`, overflow: 'hidden' }}>
            <CPContactRow label="Email" value={self.email} onChange={v => set('email', v)} />
            <div style={{ height: 1, background: cp.lineSoft, margin: '0 14px' }} />
            <CPContactRow label="Phone" value={self.phone} onChange={v => set('phone', v)} />
          </div>
        </div>

        {/* reviews (read-only on caregiver side) */}
        <div style={{ padding: '22px 24px 0' }}>
          <CPSectionTitle title="Reviews from families" count={self.reviewCount} accent={`★ ${self.rating.toFixed(1)} average`} />
          <div style={{
            background: '#fff', borderRadius: 14, border: `1px dashed ${cp.line}`,
            padding: 14, fontSize: 12, color: cp.muted, lineHeight: '17px',
          }}>
            Reviews are written by families you've cared for and can't be edited or removed by you. You can <span style={{ color: cp.forestDeep, fontWeight: 600 }}>reply publicly</span> to any review from the activity tab.
          </div>
        </div>

        <div style={{ padding: '20px 24px 0', fontSize: 11, color: cp.mutedSoft, lineHeight: '16px' }}>
          Last updated 3 days ago · Changes go live within 30 seconds.
        </div>
      </div>

      <CPTabBar active="profile" />
    </div>
  );
}

// — Profile atoms —
function CPField({ value, onChange, style }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        width: '100%', boxSizing: 'border-box',
        background: 'transparent', border: 'none', outline: 'none',
        padding: 0, fontFamily: cp.sans,
        ...style,
      }}
    />
  );
}

function CPToggleRow({ label, sub, on, onToggle }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: cp.ink, letterSpacing: -0.1 }}>{label}</div>
        <div style={{ fontSize: 11, color: cp.muted, marginTop: 1, lineHeight: '15px' }}>{sub}</div>
      </div>
      <div onClick={onToggle} style={{
        width: 36, height: 22, borderRadius: 99, flexShrink: 0,
        background: on ? cp.forestDeep : '#E5DDD0',
        position: 'relative', cursor: 'pointer', transition: 'background 0.18s',
      }}>
        <div style={{
          position: 'absolute', top: 2, left: on ? 16 : 2,
          width: 18, height: 18, borderRadius: 99,
          background: '#fff', transition: 'left 0.18s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
        }} />
      </div>
    </div>
  );
}

function CPStatEditable({ big, label, onChange, prefix = '', suffix = '' }) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${cp.line}`, padding: '10px 12px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
        {prefix && (
          <span style={{ fontFamily: cp.serif, fontSize: 16, color: cp.muted, fontWeight: 500 }}>{prefix}</span>
        )}
        <input
          value={big}
          onChange={e => onChange(e.target.value.replace(/[^\d.]/g, ''))}
          style={{
            width: '100%', minWidth: 0, boxSizing: 'border-box',
            background: 'transparent', border: 'none', outline: 'none',
            padding: 0, fontFamily: cp.serif, fontSize: 22, color: cp.forestDeep,
            fontWeight: 500, letterSpacing: -0.4, lineHeight: 1,
          }}
        />
      </div>
      <div style={{ fontSize: 10, color: cp.muted, letterSpacing: 0.4, textTransform: 'uppercase', marginTop: 4 }}>{label}{suffix}</div>
    </div>
  );
}

function CPStatStatic({ big, label, stars }) {
  return (
    <div style={{ background: cp.cream, borderRadius: 14, border: `1px solid ${cp.lineSoft}`, padding: '10px 12px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ fontFamily: cp.serif, fontSize: 22, color: cp.forestDeep, fontWeight: 500, letterSpacing: -0.4, lineHeight: 1 }}>{big}</span>
        {stars && CP.star()}
      </div>
      <div style={{ fontSize: 10, color: cp.muted, letterSpacing: 0.4, textTransform: 'uppercase', marginTop: 4 }}>{label}</div>
    </div>
  );
}

function CPInfoEditable({ label, value, onChange }) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${cp.line}`, padding: '10px 12px' }}>
      <div style={{ fontSize: 10, color: cp.muted, letterSpacing: 0.4, textTransform: 'uppercase', fontWeight: 700 }}>{label}</div>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', boxSizing: 'border-box',
          background: 'transparent', border: 'none', outline: 'none',
          padding: 0, marginTop: 4,
          fontFamily: cp.sans, fontSize: 13.5, fontWeight: 500, color: cp.ink, letterSpacing: -0.1,
        }}
      />
    </div>
  );
}

function CPContactRow({ label, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '12px 14px', gap: 12 }}>
      <div style={{ width: 60, fontSize: 11, color: cp.muted, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', flexShrink: 0 }}>{label}</div>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none',
          padding: 0, fontFamily: cp.sans, fontSize: 13.5, color: cp.ink, letterSpacing: -0.1,
        }}
      />
      {CP.pencil(cp.mutedSoft)}
    </div>
  );
}

function CPChipsEditor({ items, onChange, placeholder }) {
  const [draft, setDraft] = React.useState('');
  const add = () => {
    const t = draft.trim();
    if (t && !items.includes(t)) onChange([...items, t]);
    setDraft('');
  };
  const remove = i => onChange(items.filter((_, j) => j !== i));
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
      {items.map((it, i) => (
        <span key={i} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '5px 5px 5px 11px', borderRadius: 99,
          background: '#fff', border: `1px solid ${cp.line}`,
          fontSize: 12, color: cp.ink, fontWeight: 500, letterSpacing: -0.1,
        }}>
          {it}
          <button onClick={() => remove(i)} style={{
            width: 18, height: 18, borderRadius: 99,
            border: 'none', background: cp.cream,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', padding: 0,
          }}>{CP.x(cp.muted)}</button>
        </span>
      ))}
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '5px 11px', borderRadius: 99,
        background: cp.cream, border: `1px dashed ${cp.line}`,
        fontSize: 12, color: cp.muted, fontWeight: 500,
      }}>
        {CP.plus(cp.muted)}
        <input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { add(); e.preventDefault(); } }}
          onBlur={add}
          placeholder={placeholder}
          style={{
            background: 'transparent', border: 'none', outline: 'none',
            fontFamily: cp.sans, fontSize: 12, color: cp.ink, width: 100, padding: 0,
          }}
        />
      </span>
    </div>
  );
}

// =========================================================
// SCREEN — Activity (caregiver's own contributions)
// =========================================================
function CPActivity() {
  const items = [
    { id: 'p1', who: 'You', tint: '#C66E4E', init: 'PM', time: 'today · 9:42 AM', kind: 'meds',   summary: 'Confirmed morning meds for Arjun', detail: 'Metformin · Ramipril · Aspirin — given with breakfast.' },
    { id: 'p2', who: 'You', tint: '#C66E4E', init: 'PM', time: 'today · 9:28 AM', kind: 'vitals', summary: 'Logged BP for Arjun', detail: '148 / 92 mmHg · seated. Slightly improved from yesterday.' },
    { id: 'p3', who: 'You', tint: '#C66E4E', init: 'PM', time: 'today · 9:08 AM', kind: 'visit',  summary: 'Started morning visit · Arjun', detail: 'Arrived on time. Pt in good spirits.' },
    { id: 'p4', who: 'Priya', tint: '#3F5D54', init: 'P', time: 'today · 7:10 AM', kind: 'note', summary: 'Priya added a note', detail: '“Mum is having her hair done at 2 PM — can you arrive a little after 3 to give her time to settle?”', family: true },
    { id: 'p5', who: 'You', tint: '#C66E4E', init: 'PM', time: 'Yesterday · 4:18 PM', kind: 'visit', summary: 'Ended afternoon visit · Indira', detail: 'Calcium + D₃ given. Brief walk to the garden, no fatigue.' },
    { id: 'p6', who: 'You', tint: '#C66E4E', init: 'PM', time: 'Yesterday · 9:12 AM', kind: 'vitals', summary: 'Logged BP for Arjun', detail: '152 / 96 · stage 2 high. Flagged for Priya.', flag: true },
  ];
  const kindMeta = {
    visit:  { i: CP.note(cp.forest),  bg: cp.terracottaSoft, label: 'Visit' },
    vitals: { i: CP.pulse(cp.forest), bg: cp.sageSoft,        label: 'Vital' },
    meds:   { i: CP.pill(cp.forest),  bg: '#E9DEC4',          label: 'Meds' },
    note:   { i: CP.note(cp.forest),  bg: '#FBF7F1',          label: 'Note' },
  };

  const [filter, setFilter] = React.useState('All');
  const filters = ['All', 'Arjun', 'Indira', 'Vitals', 'Meds'];

  return (
    <div style={{
      width: '100%', height: '100%', background: cp.cream,
      fontFamily: cp.sans, color: cp.ink,
      display: 'flex', flexDirection: 'column', paddingTop: 56,
    }}>
      <div style={{ position: 'absolute', top: 56, left: 0, right: 0, height: 4, background: cp.terracotta, opacity: 0.85 }} />

      {/* header */}
      <div style={{ padding: '18px 24px 0' }}>
        <div style={{ fontSize: 10, color: cp.terracotta, letterSpacing: 0.6, textTransform: 'uppercase', fontWeight: 700 }}>
          Your activity
        </div>
        <div style={{
          fontFamily: cp.serif, fontSize: 26, lineHeight: '30px',
          color: cp.forestDeep, fontWeight: 400, marginTop: 4, letterSpacing: -0.6,
        }}>What you've logged</div>
        <div style={{ fontSize: 12.5, color: cp.muted, marginTop: 4 }}>
          Visible to the families you care for.
        </div>
      </div>

      {/* week strip */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{
          background: '#fff', border: `1px solid ${cp.line}`, borderRadius: 14,
          padding: '10px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0,
        }}>
          {[
            { v: '12', l: 'Visits / wk' },
            { v: '38', l: 'Logs' },
            { v: '4', l: 'Vitals flagged' },
          ].map((s, i, arr) => (
            <div key={i} style={{
              padding: '2px 8px',
              borderRight: i < arr.length - 1 ? `1px solid ${cp.lineSoft}` : 'none',
            }}>
              <div style={{ fontFamily: cp.serif, fontSize: 20, color: cp.forestDeep, fontWeight: 500, letterSpacing: -0.3, lineHeight: 1 }}>{s.v}</div>
              <div style={{ fontSize: 10, color: cp.muted, letterSpacing: 0.4, textTransform: 'uppercase', marginTop: 4 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* filter chips */}
      <div style={{ padding: '14px 20px 0', display: 'flex', gap: 6, overflowX: 'auto' }}>
        {filters.map(f => {
          const a = filter === f;
          return (
            <button key={f} onClick={() => setFilter(f)} style={{
              flexShrink: 0, height: 30, padding: '0 12px', borderRadius: 99,
              cursor: 'pointer',
              border: `1px solid ${a ? cp.forestDeep : cp.line}`,
              background: a ? cp.forestDeep : '#fff',
              color: a ? '#fff' : cp.ink,
              fontFamily: cp.sans, fontSize: 12, fontWeight: 500, letterSpacing: -0.1,
            }}>{f}</button>
          );
        })}
      </div>

      {/* timeline */}
      <div style={{ flex: 1, overflow: 'auto', padding: '18px 20px 110px' }}>
        <CPDateLabel d="Today · May 12" />
        {items.filter(a => a.time.startsWith('today')).map((a, i, arr) => (
          <CPFeedItem key={a.id} a={a} kindMeta={kindMeta} isLast={i === arr.length - 1} />
        ))}
        <div style={{ height: 12 }} />
        <CPDateLabel d="Yesterday · May 11" />
        {items.filter(a => a.time.startsWith('Yesterday')).map((a, i, arr) => (
          <CPFeedItem key={a.id} a={a} kindMeta={kindMeta} isLast={i === arr.length - 1} />
        ))}
      </div>
    </div>
  );
}

function CPDateLabel({ d }) {
  return (
    <div style={{
      fontSize: 10.5, color: cp.muted, letterSpacing: 0.5, textTransform: 'uppercase',
      fontWeight: 600, marginBottom: 8, paddingLeft: 2,
    }}>{d}</div>
  );
}

function CPFeedItem({ a, kindMeta, isLast }) {
  const k = kindMeta[a.kind];
  return (
    <div style={{ display: 'flex', gap: 10, paddingBottom: isLast ? 0 : 10, position: 'relative' }}>
      <div style={{ width: 32, flexShrink: 0, position: 'relative', display: 'flex', justifyContent: 'center' }}>
        <CPAvatar init={a.init} tint={a.tint} size={30} />
        {!isLast && (
          <div style={{ position: 'absolute', top: 32, bottom: -10, width: 1.5, background: cp.line }} />
        )}
      </div>
      <div style={{ flex: 1, background: '#fff', borderRadius: 14, border: `1px solid ${cp.line}`, padding: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 20, height: 20, borderRadius: 6, background: k.bg, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{k.i}</div>
          <span style={{ fontSize: 11.5, color: cp.muted }}>
            <b style={{ color: cp.ink, fontWeight: 600 }}>{a.who}</b> · {a.time.replace('today · ', '').replace('Yesterday · ', '')}
          </span>
          {a.flag && (
            <span style={{ marginLeft: 'auto', padding: '1px 6px', borderRadius: 99,
              background: '#FBE3D9', color: cp.terracotta,
              fontSize: 9, fontWeight: 700, letterSpacing: 0.4 }}>FLAGGED</span>
          )}
          {a.family && (
            <span style={{ marginLeft: 'auto', padding: '1px 6px', borderRadius: 99,
              background: cp.sageSoft, color: '#2E4942',
              fontSize: 9, fontWeight: 700, letterSpacing: 0.4 }}>FAMILY</span>
          )}
        </div>
        <div style={{ marginTop: 6, fontSize: 13, fontWeight: 600, color: cp.ink, letterSpacing: -0.1 }}>{a.summary}</div>
        <div style={{ marginTop: 3, fontSize: 12, color: cp.muted, lineHeight: '16px', textWrap: 'pretty' }}>{a.detail}</div>
      </div>
    </div>
  );
}

// =========================================================
// PORTAL WRAPPER — Today / Profile / Activity
// =========================================================
function CaregiverPortal({ initialTab = 'today' }) {
  const [tab, setTab] = React.useState(initialTab);

  let body;
  if (tab === 'profile')       body = <CPProfile self={cpSelf} />;
  else if (tab === 'activity') body = <CPActivity />;
  else                         body = <CPToday self={cpSelf} />;

  return (
    <React.Fragment>
      {body}
      <CPTabBar active={tab} onChange={setTab} />
    </React.Fragment>
  );
}

Object.assign(window, {
  CaregiverPortal, CPToday, CPProfile, CPActivity, cpSelf, cpToday,
});
