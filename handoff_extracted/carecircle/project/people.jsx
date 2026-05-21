// CareCircle — People page
// Swappable profile cards (fan/carousel) + critical details + flags

const pp = window.tokens;

const ppl = [
  {
    id: 'arjun',
    name: 'Arjun Sharma',
    short: 'Arjun',
    rel: 'Father',
    age: 78,
    height: '172 cm',
    weight: '71.2 kg',
    blood: 'B+',
    tone: 'sage',
    initials: 'AS',
    conditionList: ['Hypertension', 'Type 2 Diabetes', 'A-Fib'],
    allergies: ['Penicillin', 'Sulfa'],
    vitals: [
      { label: 'Blood pressure', value: '152 / 96', unit: 'mmHg', flag: 'high', detail: '2h ago · stage 2' },
      { label: 'Blood sugar', value: '6.2', unit: 'mmol/L · fasting', flag: 'normal', detail: 'this morning' },
      { label: 'Heart rate', value: '74', unit: 'bpm · resting', flag: 'normal', detail: 'today' },
      { label: 'SpO₂', value: '92', unit: '%', flag: 'low', detail: 'last night · watch' },
    ],
    meds: [
      { name: 'Atorvastatin', dose: '20 mg', freq: 'Once daily · evening', times: ['9:00 PM'], color: '#C66E4E' },
      { name: 'Metformin', dose: '500 mg', freq: 'Twice daily · with meals', times: ['8:00 AM', '7:00 PM'], color: '#1F3D38' },
      { name: 'Ramipril', dose: '5 mg', freq: 'Once daily · morning', times: ['8:00 AM'], color: '#A8B5A0' },
      { name: 'Warfarin', dose: '3 mg', freq: 'Once daily · evening', times: ['8:00 PM'], color: '#7A5A3F' },
      { name: 'Aspirin', dose: '81 mg', freq: 'Once daily · morning', times: ['8:00 AM'], color: '#C66E4E' },
    ],
    interactions: [
      {
        severity: 'major',
        a: 'Warfarin',
        b: 'Aspirin',
        why: 'Combined use sharply increases bleeding risk. Dr. Chen flagged this on May 2 — confirm before next dose.',
      },
      {
        severity: 'moderate',
        a: 'Atorvastatin',
        b: 'Grapefruit',
        why: 'Avoid grapefruit juice; raises atorvastatin levels and muscle-pain risk.',
      },
    ],
    appointments: [
      { day: 'TUE', date: 'May 12', time: '10:30 AM', who: 'Dr. Mei Chen', what: 'Cardiology follow-up', where: 'St. Michael\'s · Rm 412', kind: 'visit' },
      { day: 'FRI', date: 'May 15', time: '7:30 AM', who: 'LifeLabs', what: 'INR + lipid panel', where: 'Fasting · Yonge & Eg', kind: 'lab' },
      { day: 'MON', date: 'May 25', time: '2:00 PM', who: 'Dr. Patel', what: 'Family physician', where: 'Telehealth', kind: 'tele' },
    ],
  },
  {
    id: 'indira',
    name: 'Indira Sharma',
    short: 'Indira',
    rel: 'Mother',
    age: 74,
    height: '158 cm',
    weight: '62.4 kg',
    blood: 'O+',
    tone: 'terra',
    initials: 'IS',
    conditionList: ['Hypothyroidism'],
    allergies: ['Latex'],
    vitals: [
      { label: 'Blood pressure', value: '124 / 78', unit: 'mmHg', flag: 'normal', detail: '8h ago' },
      { label: 'Blood sugar', value: '5.4', unit: 'mmol/L · fasting', flag: 'normal', detail: 'this morning' },
      { label: 'Heart rate', value: '68', unit: 'bpm · resting', flag: 'normal', detail: 'today' },
      { label: 'SpO₂', value: '97', unit: '%', flag: 'normal', detail: 'yesterday' },
    ],
    meds: [
      { name: 'Levothyroxine', dose: '75 mcg', freq: 'Once daily · before breakfast', times: ['7:00 AM'], color: '#1F3D38' },
      { name: 'Calcium + D₃', dose: '600 mg', freq: 'Twice daily', times: ['9:00 AM', '8:00 PM'], color: '#A8B5A0' },
      { name: 'Alendronate', dose: '70 mg', freq: 'Weekly · Mondays', times: ['7:00 AM Mon'], color: '#C66E4E' },
    ],
    interactions: [
      {
        severity: 'minor',
        a: 'Levothyroxine',
        b: 'Calcium + D₃',
        why: 'Space these at least 4 hours apart. Calcium reduces thyroid absorption.',
      },
    ],
    appointments: [
      { day: 'WED', date: 'May 13', time: '9:00 AM', who: 'Dr. Ng', what: 'Endocrinology · annual', where: 'Mount Sinai', kind: 'visit' },
      { day: 'THU', date: 'May 21', time: '11:00 AM', who: 'Imaging', what: 'Bone density (DEXA)', where: 'Women\'s College', kind: 'lab' },
    ],
  },
];

// ─── Icons ─────────────────────────────────────────────
const PIcon = {
  back: (c = pp.ink) => (<svg width="9" height="16" viewBox="0 0 9 16"><path d="M8 1L1 8l7 7" stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  dots: (c = pp.ink) => (<svg width="22" height="6" viewBox="0 0 22 6"><circle cx="3" cy="3" r="2" fill={c}/><circle cx="11" cy="3" r="2" fill={c}/><circle cx="19" cy="3" r="2" fill={c}/></svg>),
  up: (c) => (<svg width="10" height="10" viewBox="0 0 10 10"><path d="M5 1l4 5H1l4-5z" fill={c}/></svg>),
  down: (c) => (<svg width="10" height="10" viewBox="0 0 10 10"><path d="M5 9L1 4h8L5 9z" fill={c}/></svg>),
  warn: (c = '#fff') => (<svg width="14" height="14" viewBox="0 0 14 14"><path d="M7 1l6 11H1L7 1z" fill={c}/><rect x="6.4" y="5" width="1.2" height="4" fill={pp.terracotta}/><circle cx="7" cy="10.5" r="0.7" fill={pp.terracotta}/></svg>),
  clock: (c) => (<svg width="11" height="11" viewBox="0 0 11 11" fill="none"><circle cx="5.5" cy="5.5" r="4.5" stroke={c} strokeWidth="1.2"/><path d="M5.5 3v2.5L7 7" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></svg>),
  pill: (c = pp.forest) => (<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1" y="5.5" width="16" height="7" rx="3.5" stroke={c} strokeWidth="1.4"/><path d="M9 5.5v7" stroke={c} strokeWidth="1.4"/></svg>),
  flask: (c = pp.forest) => (<svg width="14" height="16" viewBox="0 0 14 16" fill="none"><path d="M5 1v5L1 14a1 1 0 001 1h10a1 1 0 001-1L9 6V1" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 1h6" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>),
  steth: (c = pp.forest) => (<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 2v4a3 3 0 003 3 3 3 0 003-3V2" stroke={c} strokeWidth="1.4" strokeLinecap="round"/><path d="M6 9v2a3 3 0 003 3h1a3 3 0 003-3v-1" stroke={c} strokeWidth="1.4" strokeLinecap="round"/><circle cx="13" cy="7" r="1.5" stroke={c} strokeWidth="1.4"/></svg>),
  video: (c = pp.forest) => (<svg width="16" height="12" viewBox="0 0 16 12" fill="none"><rect x="1" y="1" width="10" height="10" rx="2" stroke={c} strokeWidth="1.4"/><path d="M11 4l4-2v8l-4-2" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/></svg>),
  chevR: (c = pp.muted) => (<svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1l5 5-5 5" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>),
};

// ─── Profile card (the fanned hero card) ──────────────
function ProfileCard({ person, state = 'center', onClick, idx, total }) {
  // state: 'center' | 'left' | 'right'
  const isCenter = state === 'center';
  const stripeA = person.tone === 'terra' ? '#C66E4E' : '#3F5D54';
  const stripeB = person.tone === 'terra' ? '#B05E40' : '#2E4942';
  const cardW = 210;
  const cardH = 304;

  // base transform
  let tx = 0, ty = 0, rot = 0, scale = 1, opacity = 1, z = 2;
  if (state === 'left')  { tx = -118; ty = 14; rot = -10; scale = 0.92; opacity = 0.55; z = 1; }
  if (state === 'right') { tx = 118;  ty = 14; rot = 10;  scale = 0.92; opacity = 0.55; z = 1; }

  return (
    <div onClick={onClick} style={{
      position: 'absolute', top: 0, left: '50%',
      width: cardW, height: cardH,
      marginLeft: -cardW / 2,
      transform: `translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(${scale})`,
      transformOrigin: '50% 80%',
      transition: 'transform 0.5s cubic-bezier(.2,.7,.2,1), opacity 0.4s',
      opacity, zIndex: z,
      cursor: isCenter ? 'default' : 'pointer',
    }}>
      <div style={{
        width: '100%', height: '100%', borderRadius: 18,
        background: '#fff', border: `1px solid ${pp.line}`,
        boxShadow: isCenter
          ? '0 16px 36px rgba(31,61,56,0.16), 0 3px 10px rgba(31,61,56,0.06)'
          : '0 6px 16px rgba(31,61,56,0.08)',
        padding: 12, display: 'flex', flexDirection: 'column',
        overflow: 'hidden', position: 'relative',
      }}>
        {/* top row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 10, color: pp.mutedSoft, letterSpacing: 0.5, textTransform: 'uppercase', fontFamily: 'ui-monospace, monospace' }}>
            {String(idx + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </div>
          <div style={{ fontSize: 10, color: pp.muted, letterSpacing: 0.4, textTransform: 'uppercase' }}>
            {person.rel}
          </div>
        </div>

        {/* portrait */}
        <div style={{
          flex: 1, marginTop: 10, borderRadius: 12,
          background: `repeating-linear-gradient(135deg, ${stripeA} 0 8px, ${stripeB} 8px 16px)`,
          position: 'relative', overflow: 'hidden',
          display: 'flex', alignItems: 'flex-end', padding: 10,
          minHeight: 76,
        }}>
          <div style={{
            fontFamily: pp.serif, fontSize: 30, color: '#fff',
            fontWeight: 400, letterSpacing: -1, lineHeight: 1,
            textShadow: '0 1px 2px rgba(0,0,0,0.15)',
          }}>{person.initials}</div>
          {/* faint rings deco */}
          <svg width="80" height="80" viewBox="0 0 80 80" style={{ position: 'absolute', right: -16, top: -16, opacity: 0.18 }}>
            <circle cx="40" cy="40" r="38" stroke="#fff" strokeWidth="1" fill="none"/>
            <circle cx="40" cy="40" r="24" stroke="#fff" strokeWidth="1" fill="none"/>
          </svg>
        </div>

        {/* name & stats */}
        <div style={{ marginTop: 8 }}>
          <div style={{
            fontFamily: pp.serif, fontSize: 15.5, lineHeight: '18px',
            color: pp.forestDeep, fontWeight: 500, letterSpacing: -0.3,
          }}>{person.name}</div>
          <div style={{
            marginTop: 3, display: 'flex', gap: 6,
            fontSize: 9.5, color: pp.muted, letterSpacing: 0.2,
          }}>
            <span>{person.age} yrs</span>
            <span style={{ color: pp.line }}>·</span>
            <span>{person.blood}</span>
            <span style={{ color: pp.line }}>·</span>
            <span>{person.weight}</span>
          </div>
        </div>

        {/* conditions + allergies */}
        <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {person.conditionList && person.conditionList.length > 0 && (
            <ProfileChipRow
              label="Cond"
              items={person.conditionList}
              bg={pp.sageSoft}
              border={pp.sageSoft}
              fg="#2E4942"
            />
          )}
          {person.allergies && person.allergies.length > 0 && (
            <ProfileChipRow
              label="Allg"
              items={person.allergies}
              bg="#FBE3D9"
              border="#FBE3D9"
              fg={pp.terracotta}
              warning
            />
          )}
        </div>
      </div>
    </div>
  );
}

// chip row inside the profile card
function ProfileChipRow({ label, items, bg, fg, warning }) {
  const visible = items.slice(0, 2);
  const extra = items.length - visible.length;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 4,
      minHeight: 18,
    }}>
      <span style={{
        flexShrink: 0,
        fontSize: 8.5, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase',
        color: warning ? pp.terracotta : pp.muted,
        fontFamily: 'ui-monospace, monospace',
        width: 24,
      }}>{label}</span>
      <div style={{ display: 'flex', gap: 3, flexWrap: 'nowrap', overflow: 'hidden', flex: 1, minWidth: 0 }}>
        {visible.map((it, i) => (
          <span key={i} style={{
            flexShrink: 0,
            padding: '1px 6px', borderRadius: 99,
            background: bg, color: fg,
            fontSize: 9.5, fontWeight: 600, letterSpacing: 0.1,
            maxWidth: 88, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{it}</span>
        ))}
        {extra > 0 && (
          <span style={{
            flexShrink: 0,
            fontSize: 9.5, fontWeight: 600, color: pp.muted,
            padding: '1px 4px',
          }}>+{extra}</span>
        )}
      </div>
    </div>
  );
}

// ─── Vital chip with hi/lo flag ─────────────────────────
function VitalChip({ vital }) {
  const tone =
    vital.flag === 'high' ? { bg: '#FBE3D9', stripe: pp.terracotta, label: 'HIGH', glyph: PIcon.up(pp.terracotta) } :
    vital.flag === 'low'  ? { bg: '#FBE7D0', stripe: '#D49542',     label: 'LOW',  glyph: PIcon.down('#D49542') } :
                            { bg: pp.sageSoft, stripe: pp.sage,     label: 'OK',   glyph: null };

  return (
    <div style={{
      background: '#fff', border: `1px solid ${pp.line}`,
      borderRadius: 16, padding: 14, position: 'relative',
      overflow: 'hidden',
    }}>
      {/* left rail color */}
      <div style={{
        position: 'absolute', left: 0, top: 14, bottom: 14, width: 3,
        background: tone.stripe, borderRadius: 99,
      }} />
      <div style={{ paddingLeft: 8 }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ fontSize: 10.5, color: pp.muted, letterSpacing: 0.4, textTransform: 'uppercase' }}>{vital.label}</div>
          {vital.flag !== 'normal' && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 3,
              padding: '2px 6px', borderRadius: 99,
              background: tone.bg, color: tone.stripe,
              fontSize: 9.5, fontWeight: 700, letterSpacing: 0.4,
            }}>
              {tone.glyph}{tone.label}
            </div>
          )}
        </div>
        <div style={{ marginTop: 4, display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{
            fontFamily: pp.serif, fontSize: 22, fontWeight: 500,
            color: pp.forestDeep, letterSpacing: -0.4, lineHeight: 1,
          }}>{vital.value}</span>
          <span style={{ fontSize: 10, color: pp.muted }}>{vital.unit}</span>
        </div>
        <div style={{ marginTop: 4, fontSize: 10.5, color: pp.mutedSoft }}>{vital.detail}</div>
      </div>
    </div>
  );
}

// ─── Interaction warning ────────────────────────────────
function InteractionRow({ ix, isLast }) {
  const sev =
    ix.severity === 'major'    ? { bg: '#FBE3D9', dot: pp.terracotta, label: 'MAJOR' } :
    ix.severity === 'moderate' ? { bg: '#F5E4C9', dot: '#C7973A', label: 'MODERATE' } :
                                  { bg: pp.sageSoft, dot: pp.sage, label: 'MINOR' };
  return (
    <div style={{
      padding: '14px 16px',
      borderBottom: isLast ? 'none' : `1px solid ${pp.lineSoft}`,
      display: 'flex', gap: 12, alignItems: 'flex-start',
    }}>
      <div style={{
        width: 26, height: 26, borderRadius: 8, flexShrink: 0,
        background: sev.dot,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{PIcon.warn('#fff')}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: pp.ink, letterSpacing: -0.1 }}>
            {ix.a}
          </span>
          <span style={{ fontSize: 11, color: pp.mutedSoft }}>×</span>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: pp.ink, letterSpacing: -0.1 }}>
            {ix.b}
          </span>
          <span style={{
            padding: '2px 6px', borderRadius: 99,
            background: sev.bg, color: sev.dot,
            fontSize: 9, fontWeight: 700, letterSpacing: 0.5,
          }}>{sev.label}</span>
        </div>
        <div style={{
          marginTop: 4, fontSize: 12, color: pp.muted, lineHeight: '17px',
          textWrap: 'pretty',
        }}>{ix.why}</div>
      </div>
    </div>
  );
}

// ─── Medication row ─────────────────────────────────────
function MedRow({ med, isLast }) {
  return (
    <div style={{
      padding: '14px 16px',
      borderBottom: isLast ? 'none' : `1px solid ${pp.lineSoft}`,
      display: 'flex', gap: 12, alignItems: 'center',
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 10, flexShrink: 0,
        background: med.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, transparent 0%, transparent 50%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0.35) 100%)',
        }} />
        <span style={{
          fontFamily: pp.serif, fontSize: 13, color: '#fff', fontWeight: 500,
          position: 'relative',
        }}>{med.name[0]}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: pp.ink, letterSpacing: -0.1 }}>{med.name}</span>
          <span style={{ fontSize: 11.5, color: pp.muted }}>{med.dose}</span>
        </div>
        <div style={{ fontSize: 11.5, color: pp.muted, marginTop: 1 }}>{med.freq}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 3,
          fontSize: 11, fontFamily: 'ui-monospace, monospace',
          color: pp.forest, fontWeight: 600,
        }}>
          {med.times.length}× <span style={{ color: pp.muted, fontWeight: 400 }}>day</span>
        </div>
        <div style={{ display: 'flex', gap: 3 }}>
          {med.times.map((t, i) => (
            <div key={i} style={{
              padding: '1px 5px', borderRadius: 4,
              background: pp.cream, fontSize: 9,
              fontFamily: 'ui-monospace, monospace', color: pp.muted,
              letterSpacing: 0.2,
            }}>{t}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Appointment row ────────────────────────────────────
function ApptRow({ a, isLast }) {
  const icon =
    a.kind === 'lab'  ? PIcon.flask(pp.forest) :
    a.kind === 'tele' ? PIcon.video(pp.forest) :
                        PIcon.steth(pp.forest);
  const bg =
    a.kind === 'lab'  ? '#F5E4C9' :
    a.kind === 'tele' ? pp.sageSoft :
                        pp.terracottaSoft;
  return (
    <div style={{
      padding: '14px 16px',
      borderBottom: isLast ? 'none' : `1px solid ${pp.lineSoft}`,
      display: 'flex', gap: 12, alignItems: 'center',
    }}>
      <div style={{
        width: 46, flexShrink: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '4px 0', borderRadius: 10, background: pp.cream,
        border: `1px solid ${pp.lineSoft}`,
      }}>
        <div style={{ fontSize: 9.5, color: pp.muted, letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: 600 }}>{a.day}</div>
        <div style={{ fontFamily: pp.serif, fontSize: 15, color: pp.forestDeep, fontWeight: 500, lineHeight: 1, marginTop: 1 }}>{a.date.split(' ')[1]}</div>
        <div style={{ fontSize: 8.5, color: pp.mutedSoft, letterSpacing: 0.3, textTransform: 'uppercase', marginTop: 1 }}>{a.date.split(' ')[0]}</div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 22, height: 22, borderRadius: 7,
            background: bg, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{icon}</div>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: pp.ink, letterSpacing: -0.1 }}>{a.what}</span>
        </div>
        <div style={{ marginTop: 4, fontSize: 11.5, color: pp.muted, lineHeight: '15px' }}>
          {a.who} · {a.where}
        </div>
        <div style={{ marginTop: 2, fontSize: 11, color: pp.mutedSoft, display: 'flex', alignItems: 'center', gap: 4 }}>
          {PIcon.clock(pp.mutedSoft)} {a.time}
        </div>
      </div>
    </div>
  );
}

// ─── Section heading ────────────────────────────────────
function Section({ title, count, accent, onAction }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
      marginBottom: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{
          fontFamily: pp.serif, fontSize: 18, color: pp.forestDeep,
          fontWeight: 500, letterSpacing: -0.3,
        }}>{title}</span>
        {count != null && (
          <span style={{
            fontSize: 11, fontFamily: 'ui-monospace, monospace',
            color: pp.muted, letterSpacing: 0.4,
          }}>{String(count).padStart(2, '0')}</span>
        )}
      </div>
      {accent && (
        <span onClick={onAction} style={{
          fontSize: 12, color: pp.forest, fontWeight: 500,
          cursor: onAction ? 'pointer' : 'default',
        }}>{accent}</span>
      )}
    </div>
  );
}

// ─── Section icons (for the quick-access grid) ──────────
const SecIcon = {
  vitals:    (c) => (<svg width="22" height="20" viewBox="0 0 22 20" fill="none"><path d="M1 10h4l2-7 4 14 3-9 2 3h5" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  meds:      (c) => (<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="1" y="7" width="20" height="8" rx="4" stroke={c} strokeWidth="1.8"/><path d="M11 7v8" stroke={c} strokeWidth="1.8"/></svg>),
  appts:     (c) => (<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="1" y="3.5" width="18" height="15" rx="2" stroke={c} strokeWidth="1.8"/><path d="M1 8h18M6 1v3M14 1v3" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></svg>),
  docs:      (c) => (<svg width="18" height="22" viewBox="0 0 18 22" fill="none"><path d="M2 1h10l5 5v15H2V1z" stroke={c} strokeWidth="1.8" strokeLinejoin="round"/><path d="M12 1v5h5" stroke={c} strokeWidth="1.8" strokeLinejoin="round"/></svg>),
  activity:  (c) => (<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="9" stroke={c} strokeWidth="1.8"/><path d="M11 5v6l4 2.5" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></svg>),
  team:      (c) => (<svg width="22" height="18" viewBox="0 0 22 18" fill="none"><circle cx="7" cy="6" r="3.5" stroke={c} strokeWidth="1.7"/><path d="M1 17c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke={c} strokeWidth="1.7" strokeLinecap="round"/><circle cx="16" cy="7" r="3" stroke={c} strokeWidth="1.7"/><path d="M13 17c0-2.5 1.5-4 3-4s3 1.5 3 4" stroke={c} strokeWidth="1.7" strokeLinecap="round"/></svg>),
};

// ─── Quick-access tile ──────────────────────────────────
function QuickTile({ icon, label, sub, onClick, accent, badge }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, minWidth: 0, height: 92, padding: 14, borderRadius: 16,
      background: '#fff', border: `1px solid ${pp.line}`,
      display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
      justifyContent: 'space-between', position: 'relative',
      cursor: 'pointer', textAlign: 'left',
      fontFamily: pp.sans,
      boxShadow: '0 1px 0 rgba(31,61,56,0.02)',
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 10,
        background: accent ? '#FBE3D9' : pp.cream,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icon(accent ? pp.terracotta : pp.forest)}
      </div>
      <div style={{ width: '100%' }}>
        <div style={{
          fontSize: 13, fontWeight: 600, color: pp.ink, letterSpacing: -0.1,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          {label}
          {badge && (
            <span style={{
              width: 6, height: 6, borderRadius: 99, background: pp.terracotta,
            }} />
          )}
        </div>
        <div style={{ fontSize: 10.5, color: pp.muted, marginTop: 2, letterSpacing: 0.1 }}>{sub}</div>
      </div>
    </button>
  );
}

// ─── Sub-page top bar ───────────────────────────────────
function SubPageBar({ title, onBack, person }) {
  return (
    <div style={{
      padding: '14px 20px 0',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div onClick={onBack} style={{
        width: 36, height: 36, borderRadius: 12,
        background: '#fff', border: `1px solid ${pp.line}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
      }}>{PIcon.back()}</div>
      <div style={{ flex: 1, textAlign: 'center', minWidth: 0 }}>
        <div style={{
          fontFamily: pp.serif, fontSize: 16, color: pp.forestDeep,
          fontWeight: 500, letterSpacing: -0.2, lineHeight: 1.1,
        }}>{title}</div>
        {person && (
          <div style={{ fontSize: 10.5, color: pp.muted, letterSpacing: 0.4, textTransform: 'uppercase', marginTop: 2 }}>
            {person.short} · {person.rel}
          </div>
        )}
      </div>
      <div style={{
        width: 36, height: 36, borderRadius: 12,
        background: '#fff', border: `1px solid ${pp.line}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{PIcon.dots()}</div>
    </div>
  );
}

// ─── Sub-page: Vitals ───────────────────────────────────
function VitalsSubPage({ person, onBack }) {
  const [showLog, setShowLog] = React.useState(false);
  if (showLog) {
    return <window.LogReadingPage
      person={person.short}
      onBack={() => setShowLog(false)}
      onSave={() => setShowLog(false)}
    />;
  }
  return (
    <div style={{ width: '100%', height: '100%', background: pp.cream, fontFamily: pp.sans, color: pp.ink, display: 'flex', flexDirection: 'column', paddingTop: 56 }}>
      <SubPageBar title="Vitals" onBack={onBack} person={person} />
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 20px 120px' }}>
        <div style={{
          padding: '14px 16px', borderRadius: 14, background: '#fff',
          border: `1px solid ${pp.line}`, marginBottom: 14,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: pp.muted, letterSpacing: 0.4, textTransform: 'uppercase' }}>Last reading</div>
            <div style={{ fontFamily: pp.serif, fontSize: 15, color: pp.forestDeep, fontWeight: 500, marginTop: 2 }}>{person.vitals[0].detail}</div>
          </div>
          <button onClick={() => setShowLog(true)} style={{
            height: 36, padding: '0 14px', borderRadius: 99, border: 'none',
            background: pp.forestDeep, color: '#fff',
            fontSize: 12.5, fontWeight: 600, letterSpacing: -0.1, cursor: 'pointer',
            fontFamily: pp.sans,
          }}>+ Log reading</button>
        </div>

        <Section title="Current" accent="Last 30 days →" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {person.vitals.map((v, i) => <VitalChip key={i} vital={v} />)}
        </div>

        <div style={{ marginTop: 22 }}>
          <Section title="Trends" accent="Open chart →" />
          <div style={{ background: '#fff', border: `1px solid ${pp.line}`, borderRadius: 16, padding: 16 }}>
            <div style={{ fontSize: 11, color: pp.muted, letterSpacing: 0.4, textTransform: 'uppercase' }}>Blood pressure · 14 days</div>
            <Sparkline data={[124,128,131,127,135,142,138,145,148,140,144,150,152,152]} threshold={140} />
            <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 10, color: pp.mutedSoft, fontFamily: 'ui-monospace, monospace' }}>
              <span>Apr 26</span><span>May 9</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Sparkline({ data, threshold }) {
  const w = 320, h = 80;
  const min = Math.min(...data) - 5;
  const max = Math.max(...data) + 5;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min)) * h;
    return `${x},${y}`;
  }).join(' ');
  const thresholdY = h - ((threshold - min) / (max - min)) * h;
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} style={{ marginTop: 10, overflow: 'visible' }}>
      <line x1="0" y1={thresholdY} x2={w} y2={thresholdY} stroke={pp.terracotta} strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
      <polyline points={pts} fill="none" stroke={pp.forest} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((v, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - ((v - min) / (max - min)) * h;
        const flagged = v >= threshold;
        return <circle key={i} cx={x} cy={y} r={flagged ? 3 : 2.2} fill={flagged ? pp.terracotta : pp.forest} />;
      })}
    </svg>
  );
}

// ─── Sub-page: Medications ──────────────────────────────
function MedsSubPage({ person, onBack }) {
  const [showAdd, setShowAdd] = React.useState(false);
  if (showAdd) {
    return <window.AddMedicationPage
      person={person.short}
      onBack={() => setShowAdd(false)}
      onSave={() => setShowAdd(false)}
    />;
  }
  return (
    <div style={{ width: '100%', height: '100%', background: pp.cream, fontFamily: pp.sans, color: pp.ink, display: 'flex', flexDirection: 'column', paddingTop: 56 }}>
      <SubPageBar title="Medications" onBack={onBack} person={person} />
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 20px 120px' }}>
        <div style={{
          padding: '14px 16px', borderRadius: 14, background: '#fff',
          border: `1px solid ${pp.line}`, marginBottom: 14,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: pp.muted, letterSpacing: 0.4, textTransform: 'uppercase' }}>Schedule</div>
            <div style={{ fontFamily: pp.serif, fontSize: 15, color: pp.forestDeep, fontWeight: 500, marginTop: 2 }}>
              {person.meds.reduce((acc, m) => acc + m.times.length, 0)} doses across {person.meds.length} medications
            </div>
          </div>
          <button onClick={() => setShowAdd(true)} style={{
            height: 36, padding: '0 14px', borderRadius: 99, border: 'none',
            background: pp.forestDeep, color: '#fff', fontSize: 12.5, fontWeight: 600,
            letterSpacing: -0.1, cursor: 'pointer', fontFamily: pp.sans,
          }}>+ Add med</button>
        </div>

        {person.interactions.length > 0 && (
          <div style={{ marginBottom: 22 }}>
            <Section title="Interaction watch" count={person.interactions.length} />
            <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${pp.line}`, overflow: 'hidden' }}>
              {person.interactions.map((ix, i) => (
                <InteractionRow key={i} ix={ix} isLast={i === person.interactions.length - 1} />
              ))}
            </div>
          </div>
        )}

        <Section title="Active" count={person.meds.length} />
        <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${pp.line}`, overflow: 'hidden' }}>
          {person.meds.map((m, i) => (
            <MedRow key={i} med={m} isLast={i === person.meds.length - 1} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-page: Appointments ─────────────────────────────
function ApptsSubPage({ person, onBack }) {
  const [showAdd, setShowAdd] = React.useState(false);
  if (showAdd) {
    return <window.AddAppointmentPage
      person={person.short}
      onBack={() => setShowAdd(false)}
      onSave={() => setShowAdd(false)}
    />;
  }
  return (
    <div style={{ width: '100%', height: '100%', background: pp.cream, fontFamily: pp.sans, color: pp.ink, display: 'flex', flexDirection: 'column', paddingTop: 56 }}>
      <SubPageBar title="Appointments" onBack={onBack} person={person} />
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 20px 120px' }}>
        {/* hero: next appt */}
        {person.appointments[0] && (
          <div style={{
            background: pp.forestDeep, color: '#fff', borderRadius: 18,
            padding: 16, marginBottom: 18, position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ fontSize: 10.5, letterSpacing: 0.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)' }}>Next visit</div>
            <div style={{ fontFamily: pp.serif, fontSize: 22, fontWeight: 400, letterSpacing: -0.4, marginTop: 4, lineHeight: '24px' }}>
              {person.appointments[0].what}
            </div>
            <div style={{ marginTop: 8, fontSize: 12, color: 'rgba(255,255,255,0.75)', lineHeight: '17px' }}>
              {person.appointments[0].day} {person.appointments[0].date} · {person.appointments[0].time}<br />
              {person.appointments[0].who} · {person.appointments[0].where}
            </div>
            <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
              <button style={{ flex: 1, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: pp.sans }}>Add to calendar</button>
              <button style={{ flex: 1, height: 36, borderRadius: 10, background: '#fff', color: pp.forestDeep, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: pp.sans }}>Get directions</button>
            </div>
          </div>
        )}

        <Section title="Coming up" count={person.appointments.length} accent="+ Add" onAction={() => setShowAdd(true)} />
        <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${pp.line}`, overflow: 'hidden' }}>
          {person.appointments.map((a, i) => (
            <ApptRow key={i} a={a} isLast={i === person.appointments.length - 1} />
          ))}
        </div>

        <div style={{ marginTop: 22 }}>
          <Section title="Past" accent="History →" />
          <div style={{ background: '#fff', borderRadius: 16, border: `1px dashed ${pp.line}`, padding: 18, fontSize: 12.5, color: pp.muted, textAlign: 'center' }}>
            2 past visits this month — pull to view
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-page: Documents (mini list, links out) ─────────
function DocsSubPage({ person, onBack }) {
  const sample = [
    { t: 'INR + lipid panel · LifeLabs',    d: 'May 4',  flagged: true },
    { t: 'Cardiology Rx · Dr. Mei Chen',     d: 'May 2' },
    { t: 'Echocardiogram report',            d: 'Mar 2' },
    { t: 'HbA1c · quarterly',                d: 'Mar 25' },
  ];
  return (
    <div style={{ width: '100%', height: '100%', background: pp.cream, fontFamily: pp.sans, color: pp.ink, display: 'flex', flexDirection: 'column', paddingTop: 56 }}>
      <SubPageBar title="Documents" onBack={onBack} person={person} />
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 20px 120px' }}>
        <div style={{
          padding: '14px 16px', borderRadius: 14, background: '#fff',
          border: `1px solid ${pp.line}`, marginBottom: 14,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: pp.muted, letterSpacing: 0.4, textTransform: 'uppercase' }}>Filed for {person.short}</div>
            <div style={{ fontFamily: pp.serif, fontSize: 15, color: pp.forestDeep, fontWeight: 500, marginTop: 2 }}>{sample.length} recent · auto-segregated</div>
          </div>
          <button style={{
            height: 36, padding: '0 14px', borderRadius: 99, border: 'none',
            background: pp.forestDeep, color: '#fff', fontSize: 12.5, fontWeight: 600,
            letterSpacing: -0.1, cursor: 'pointer', fontFamily: pp.sans,
          }}>+ Scan</button>
        </div>

        <Section title="Recent" accent="Open library →" />
        <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${pp.line}`, overflow: 'hidden' }}>
          {sample.map((d, i) => (
            <div key={i} style={{
              padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
              borderBottom: i < sample.length - 1 ? `1px solid ${pp.lineSoft}` : 'none',
            }}>
              <div style={{
                width: 32, height: 38, borderRadius: 6,
                background: d.flagged ? '#FBE3D9' : pp.cream,
                border: `1px solid ${pp.line}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <svg width="14" height="16" viewBox="0 0 14 16" fill="none"><path d="M2 1h7l4 4v10H2V1z" stroke={d.flagged ? pp.terracotta : pp.forest} strokeWidth="1.4" strokeLinejoin="round"/><path d="M9 1v4h4" stroke={d.flagged ? pp.terracotta : pp.forest} strokeWidth="1.4"/></svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: pp.ink, letterSpacing: -0.1 }}>{d.t}</div>
                <div style={{ fontSize: 11, color: pp.muted, marginTop: 2 }}>
                  {d.d}{d.flagged ? ' · contains flagged values' : ''}
                </div>
              </div>
              {PIcon.chevR()}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-page: Activity (mini view, points to full page) ─
function ActivitySubPage({ person, onBack }) {
  const today = [
    { t: '8:00 AM',  what: 'Metformin 500 mg',  by: 'Anika', tone: '#C66E4E', done: true },
    { t: '9:15 AM',  what: 'BP · 152/96 mmHg',  by: 'Anika', tone: '#C66E4E', done: true, flagged: true },
    { t: '7:00 PM',  what: 'Metformin 500 mg',  by: '',      tone: '',         done: false },
    { t: '9:00 PM',  what: 'Atorvastatin 20 mg', by: '',     tone: '',         done: false },
  ];
  return (
    <div style={{ width: '100%', height: '100%', background: pp.cream, fontFamily: pp.sans, color: pp.ink, display: 'flex', flexDirection: 'column', paddingTop: 56 }}>
      <SubPageBar title="Activity" onBack={onBack} person={person} />
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 20px 120px' }}>
        <div style={{
          padding: '14px 16px', borderRadius: 14, background: pp.forestDeep,
          color: '#fff', marginBottom: 14,
        }}>
          <div style={{ fontSize: 10.5, letterSpacing: 0.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)' }}>Today</div>
          <div style={{ fontFamily: pp.serif, fontSize: 17, fontWeight: 500, marginTop: 2, letterSpacing: -0.3 }}>
            2 of 4 logged · 1 flagged
          </div>
        </div>

        <Section title="Today" accent="Full feed →" />
        <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${pp.line}`, overflow: 'hidden' }}>
          {today.map((it, i) => (
            <div key={i} style={{
              padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
              borderBottom: i < today.length - 1 ? `1px solid ${pp.lineSoft}` : 'none',
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: 99, flexShrink: 0,
                border: `1.5px solid ${it.done ? pp.forest : pp.line}`,
                background: it.done ? pp.forest : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {it.done && <svg width="11" height="9" viewBox="0 0 11 9"><path d="M1 4.5L4 7.5L10 1.5" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: it.flagged ? pp.terracotta : pp.ink, letterSpacing: -0.1 }}>{it.what}</div>
                <div style={{ fontSize: 10.5, color: pp.muted, marginTop: 2 }}>
                  {it.t}{it.by ? ` · ${it.by}` : ' · pending'}
                </div>
              </div>
              {it.by && (
                <div style={{
                  width: 22, height: 22, borderRadius: 99, flexShrink: 0,
                  background: it.tone, color: '#fff',
                  fontFamily: pp.serif, fontSize: 10.5, fontWeight: 500,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{it.by[0]}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-page: Care team ────────────────────────────────
function TeamSubPage({ person, onBack }) {
  const team = [
    { init: 'MC', name: 'Dr. Mei Chen',    role: 'Cardiology',        phone: '(416) 864-5000', tone: pp.forest, primary: true },
    { init: 'RP', name: 'Dr. Raj Patel',   role: 'Family physician',  phone: '(416) 555-1240', tone: pp.terracotta },
    { init: 'LN', name: 'Lisa Ng',         role: 'Pharmacist',        phone: '(416) 555-9034', tone: pp.sage },
    { init: 'AS', name: 'Anika Sharma',    role: 'Caregiver · PSW',   phone: '(416) 555-2210', tone: '#7A5A3F' },
  ];
  return (
    <div style={{ width: '100%', height: '100%', background: pp.cream, fontFamily: pp.sans, color: pp.ink, display: 'flex', flexDirection: 'column', paddingTop: 56 }}>
      <SubPageBar title="Care team" onBack={onBack} person={person} />
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 20px 120px' }}>
        <Section title="Specialists" count={team.length} accent="+ Add" />
        <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${pp.line}`, overflow: 'hidden' }}>
          {team.map((t, i) => (
            <div key={i} style={{
              padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
              borderBottom: i < team.length - 1 ? `1px solid ${pp.lineSoft}` : 'none',
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: 99, flexShrink: 0,
                background: t.tone, color: '#fff',
                fontFamily: pp.serif, fontSize: 13, fontWeight: 500,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{t.init}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: pp.ink, letterSpacing: -0.1 }}>{t.name}</span>
                  {t.primary && (
                    <span style={{ padding: '1px 6px', borderRadius: 99, background: pp.sageSoft, color: pp.forest, fontSize: 9, fontWeight: 700, letterSpacing: 0.4 }}>PRIMARY</span>
                  )}
                </div>
                <div style={{ fontSize: 11.5, color: pp.muted, marginTop: 2 }}>{t.role} · {t.phone}</div>
              </div>
              {PIcon.chevR()}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main page ──────────────────────────────────────────
function PeoplePage({ initialIdx = 0, initialView = 'main' } = {}) {
  const [idx, setIdx] = React.useState(initialIdx);
  const [view, setView] = React.useState(initialView); // 'main' | 'vitals' | 'meds' | 'appts' | 'docs' | 'activity' | 'team'
  const person = ppl[idx];
  const left  = ppl[(idx - 1 + ppl.length) % ppl.length];
  const right = ppl[(idx + 1) % ppl.length];

  const highFlags = person.vitals.filter(v => v.flag !== 'normal').length;
  const majorIx = person.interactions.filter(i => i.severity === 'major').length;
  const back = () => setView('main');

  // Sub-page renderer
  if (view !== 'main') {
    const Page = {
      vitals:   VitalsSubPage,
      meds:     MedsSubPage,
      appts:    ApptsSubPage,
      docs:     DocsSubPage,
      activity: ActivitySubPage,
      team:     TeamSubPage,
    }[view];
    return (
      <div style={{ width: '100%', height: '100%', background: pp.cream, position: 'relative' }}>
        <Page person={person} onBack={back} />
        <PeopleTabBar />
      </div>
    );
  }

  return (
    <div style={{
      width: '100%', height: '100%', background: pp.cream,
      fontFamily: pp.sans, color: pp.ink,
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
          background: '#fff', border: `1px solid ${pp.line}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{PIcon.back()}</div>
        <div style={{
          fontFamily: pp.serif, fontSize: 17, color: pp.forestDeep,
          fontWeight: 500, letterSpacing: -0.2,
        }}>People</div>
        <div style={{
          width: 36, height: 36, borderRadius: 12,
          background: '#fff', border: `1px solid ${pp.line}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{PIcon.dots()}</div>
      </div>

      {/* scroll body */}
      <div style={{ flex: 1, overflow: 'auto', paddingBottom: 110 }}>
        {/* person chips */}
        <div style={{ padding: '18px 20px 0', display: 'flex', gap: 8 }}>
          {ppl.map((p, i) => {
            const active = i === idx;
            return (
              <button key={p.id} onClick={() => setIdx(i)} style={{
                flexShrink: 0, height: 40, padding: '0 14px 0 4px', borderRadius: 99,
                cursor: 'pointer',
                border: `1px solid ${active ? pp.forestDeep : pp.line}`,
                background: active ? pp.forestDeep : '#fff',
                color: active ? '#fff' : pp.ink,
                display: 'flex', alignItems: 'center', gap: 8,
                fontFamily: pp.sans, fontSize: 13, fontWeight: 500, letterSpacing: -0.1,
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 99, flexShrink: 0,
                  background: p.tone === 'terra' ? '#C66E4E' : '#3F5D54',
                  color: '#fff', fontFamily: pp.serif, fontSize: 13, fontWeight: 500,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{p.initials[0]}</div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.1 }}>
                  <span>{p.short}</span>
                  <span style={{ fontSize: 9.5, opacity: active ? 0.65 : 0.5, fontWeight: 500, letterSpacing: 0.2, marginTop: 2 }}>{p.rel}</span>
                </div>
              </button>
            );
          })}
          <button style={{
            height: 40, width: 40, borderRadius: 99,
            border: `1px dashed ${pp.mutedSoft}`,
            background: 'transparent', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14"><path d="M7 1v12M1 7h12" stroke={pp.muted} strokeWidth="1.8" strokeLinecap="round"/></svg>
          </button>
        </div>

        {/* recipient hero card (same as dashboard 2) */}
        <div style={{ padding: '16px 20px 0' }}>
          <window.RecipientCard
            person={{
              name: person.short,
              full: person.name,
              rel: person.rel,
              age: person.age,
              tone: person.tone,
              portrait: `${person.rel.toLowerCase()} · ${person.age}`,
              meds: person.meds.length,
              conditions: (person.conditionList || []).length,
              alerts: person.vitals.filter(v => v.flag !== 'normal').length,
              conditionList: person.conditionList || [],
              allergies: person.allergies || [],
            }}
            variant="established"
          />
        </div>

        {/* at-a-glance banner */}
        {(highFlags > 0 || majorIx > 0) && (
          <div style={{ padding: '20px 20px 0' }}>
            <div style={{
              background: pp.forestDeep, color: '#fff',
              borderRadius: 16, padding: '12px 14px',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: 9,
                background: pp.terracotta,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>{PIcon.warn('#fff')}</div>
              <div style={{ flex: 1, fontSize: 12.5, lineHeight: '17px' }}>
                <span style={{ color: 'rgba(255,255,255,0.95)', fontWeight: 600 }}>{person.short} needs attention.</span>
                <span style={{ color: 'rgba(255,255,255,0.65)' }}> {highFlags} flagged {highFlags === 1 ? 'reading' : 'readings'}{majorIx > 0 ? `, ${majorIx} major interaction` : ''}.</span>
              </div>
            </div>
          </div>
        )}

        {/* quick-access grid */}
        <div style={{ padding: '22px 20px 0' }}>
          <Section title="Care details" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <QuickTile
              icon={SecIcon.vitals}
              label="Vitals"
              sub={highFlags > 0 ? `${highFlags} flagged` : 'All normal'}
              accent={highFlags > 0}
              badge={highFlags > 0}
              onClick={() => setView('vitals')}
            />
            <QuickTile
              icon={SecIcon.meds}
              label="Medications"
              sub={`${person.meds.length} active`}
              badge={majorIx > 0}
              onClick={() => setView('meds')}
            />
            <QuickTile
              icon={SecIcon.appts}
              label="Appointments"
              sub={`${person.appointments.length} upcoming`}
              onClick={() => setView('appts')}
            />
            <QuickTile
              icon={SecIcon.docs}
              label="Documents"
              sub="12 filed"
              onClick={() => setView('docs')}
            />
            <QuickTile
              icon={SecIcon.activity}
              label="Activity"
              sub="2 of 4 today"
              onClick={() => setView('activity')}
            />
            <QuickTile
              icon={SecIcon.team}
              label="Care team"
              sub="4 contacts"
              onClick={() => setView('team')}
            />
          </div>
        </div>

        {/* Interaction watch — keep visible as it's safety-critical */}
        {person.interactions.length > 0 && (
          <div style={{ padding: '22px 20px 0' }}>
            <Section title="Interaction watch" count={person.interactions.length} />
            <div style={{
              background: '#fff', borderRadius: 16, border: `1px solid ${pp.line}`,
              overflow: 'hidden',
            }}>
              {person.interactions.map((ix, i) => (
                <InteractionRow key={i} ix={ix} isLast={i === person.interactions.length - 1} />
              ))}
            </div>
          </div>
        )}
      </div>

      <PeopleTabBar />
    </div>
  );
}

function PeopleTabBar() {
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      paddingBottom: 24, paddingTop: 10,
      background: `linear-gradient(to top, ${pp.cream} 60%, rgba(246,241,234,0))`,
    }}>
      <div style={{
        margin: '0 16px', height: 60, borderRadius: 22,
        background: '#fff', border: `1px solid ${pp.line}`,
        boxShadow: '0 6px 24px rgba(31,61,56,0.06)',
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr',
        alignItems: 'center',
      }}>
        {[
          { l: 'Home', a: false, c: pp.muted },
          { l: 'People', a: true, c: pp.forestDeep },
          { l: 'Care', a: false, c: pp.muted },
          { l: 'You', a: false, c: pp.muted },
        ].map((t, i) => (
          <div key={i} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            color: t.c,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: 99, background: t.a ? pp.forestDeep : 'transparent' }} />
            <div style={{ fontSize: 11, fontWeight: t.a ? 600 : 500 }}>{t.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { PeoplePage, ppl });
