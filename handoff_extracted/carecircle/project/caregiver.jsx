// CareCircle — Caregiver portal screens
// Owner-side: Share & Caregivers · Invite · Activity feed
// Caregiver-side: Dashboard · Today's shift · Log visit

const cg = window.tokens;

// ─── Data ────────────────────────────────────────────────
const caregivers = [
  {
    id: 'maya',
    name: 'Maya Sharma',
    short: 'Maya',
    rel: 'Sister',
    role: 'Family',
    tint: '#C66E4E',
    initials: 'MS',
    status: 'active',
    lastActive: '4h ago',
    contributesPerWeek: 12,
    sections: {
      Medications: { v: true, c: true },
      Vitals:      { v: true, c: true },
      'Visit notes': { v: true, c: true },
      Conditions:  { v: true, c: false },
      Allergies:   { v: true, c: false },
      Documents:   { v: true, c: true },
      'Care team': { v: true, c: false },
    },
  },
  {
    id: 'james',
    name: 'James Okoye',
    short: 'James',
    rel: 'Professional PSW',
    role: 'PSW',
    tint: '#3F5D54',
    initials: 'JO',
    status: 'active',
    lastActive: 'today · 9:14 AM',
    contributesPerWeek: 28,
    sections: {
      Medications: { v: true,  c: false },
      Vitals:      { v: true,  c: true  },
      'Visit notes': { v: true, c: true },
      Allergies:   { v: true,  c: false },
      Conditions:  { v: false, c: false },
      Documents:   { v: false, c: false },
      'Care team': { v: false, c: false },
    },
  },
  {
    id: 'dr-chen',
    name: 'Dr. Mei Chen',
    short: 'Dr. Chen',
    rel: 'Cardiologist',
    role: 'Specialist',
    tint: '#A8B5A0',
    initials: 'MC',
    status: 'pending',
    lastActive: 'Sent yesterday',
    contributesPerWeek: 0,
    sections: {
      Medications: { v: true, c: false },
      Vitals:      { v: true, c: false },
      Documents:   { v: true, c: false },
    },
  },
];

const activity = [
  { id: 'a1', who: 'James',  init: 'JO', tint: '#3F5D54', time: 'today · 9:14 AM', kind: 'meds', summary: 'Confirmed morning medications', detail: 'Metformin · Ramipril · Aspirin · all given. Atorvastatin skipped — pt asked to take after dinner.' },
  { id: 'a2', who: 'James',  init: 'JO', tint: '#3F5D54', time: 'today · 9:08 AM', kind: 'vitals', summary: 'Logged blood pressure', detail: '152 / 96 mmHg · seated · stage 2 high', flag: true },
  { id: 'a3', who: 'James',  init: 'JO', tint: '#3F5D54', time: 'today · 9:02 AM', kind: 'visit', summary: 'Started morning shift', detail: 'Pt slept well, light breakfast (oats + tea). Slight fatigue noted. Wheelchair in living room.' },
  { id: 'a4', who: 'Maya',   init: 'MS', tint: '#C66E4E', time: 'Yesterday · 8:42 PM', kind: 'visit', summary: 'Logged a visit note', detail: 'Dad ate a full dinner. Took all evening medications. Seemed a bit tired but in good spirits.' },
  { id: 'a5', who: 'Maya',   init: 'MS', tint: '#C66E4E', time: 'Yesterday · 8:45 PM', kind: 'vitals', summary: 'Logged blood pressure', detail: '136 / 84 mmHg · seated' },
  { id: 'a6', who: 'Maya',   init: 'MS', tint: '#C66E4E', time: 'Mon · 3:21 PM', kind: 'doc', summary: 'Uploaded a prescription', detail: 'New script from Dr. Chen — Furosemide 20 mg. Awaiting your review.', awaiting: true },
];

// ─── Icons ────────────────────────────────────────────────
const CI = {
  back: (c = cg.ink) => (<svg width="9" height="16" viewBox="0 0 9 16"><path d="M8 1L1 8l7 7" stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  close: (c = cg.ink) => (<svg width="14" height="14" viewBox="0 0 14 14"><path d="M2 2l10 10M12 2L2 12" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></svg>),
  dots: (c = cg.ink) => (<svg width="22" height="6" viewBox="0 0 22 6"><circle cx="3" cy="3" r="2" fill={c}/><circle cx="11" cy="3" r="2" fill={c}/><circle cx="19" cy="3" r="2" fill={c}/></svg>),
  plus: (c = '#fff') => (<svg width="14" height="14" viewBox="0 0 14 14"><path d="M7 1v12M1 7h12" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></svg>),
  check: (c = '#fff', sw = 1.8) => (<svg width="12" height="10" viewBox="0 0 12 10"><path d="M1 5l3 3 7-7" stroke={c} strokeWidth={sw} fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  x: (c = cg.muted) => (<svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 2l6 6M8 2l-6 6" stroke={c} strokeWidth="1.6" strokeLinecap="round"/></svg>),
  pencil: (c = cg.muted) => (<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8 1l3 3-7 7H1v-3l7-7z" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/></svg>),
  shield: (c = cg.muted) => (<svg width="11" height="13" viewBox="0 0 11 13" fill="none"><path d="M5.5.5L1 2.5v4c0 2.8 1.8 5.2 4.5 6 2.7-.8 4.5-3.2 4.5-6v-4L5.5.5z" stroke={c} strokeWidth="1.2" strokeLinejoin="round"/></svg>),
  pill: (c = cg.forest) => (<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="4.5" width="12" height="5" rx="2.5" stroke={c} strokeWidth="1.3"/><path d="M7 4.5v5" stroke={c} strokeWidth="1.3"/></svg>),
  pulse: (c = cg.forest) => (<svg width="14" height="12" viewBox="0 0 14 12" fill="none"><path d="M1 6h2.5L5 1l3 10 1.5-5H13" stroke={c} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>),
  note: (c = cg.forest) => (<svg width="13" height="14" viewBox="0 0 13 14" fill="none"><path d="M1.5 1h7l3.5 3.5V13h-10.5V1z" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/><path d="M4 7h5M4 10h4" stroke={c} strokeWidth="1.3" strokeLinecap="round"/></svg>),
  doc: (c = cg.forest) => (<svg width="13" height="14" viewBox="0 0 13 14" fill="none"><path d="M1.5 1h6.5l3.5 3.5V13h-10V1z" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/></svg>),
  send: (c = '#fff') => (<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 7h12m0 0L8 2m5 5L8 12" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  chevR: (c = cg.muted) => (<svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1l5 5-5 5" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  warn: (c = '#fff') => (<svg width="11" height="11" viewBox="0 0 11 11"><path d="M5.5 1l4.5 9H1L5.5 1z" fill={c}/></svg>),
  bell: (c = cg.ink) => (<svg width="16" height="18" viewBox="0 0 16 18" fill="none"><path d="M8 1.5v1.5M3 7a5 5 0 1110 0v3l1 2.5H2L3 10V7z" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  swap: (c = cg.muted) => (<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 4h11m0 0L9 1m3 3L9 7M13 10H2m0 0l3-3m-3 3l3 3" stroke={c} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>),
};

// ─── Small atoms ─────────────────────────────────────────
function Avatar({ init, tint, size = 38, ring }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 99, flexShrink: 0,
      background: tint, color: '#fff',
      fontFamily: cg.serif, fontWeight: 500, fontSize: size * 0.4,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      letterSpacing: 0.3,
      boxShadow: ring ? `0 0 0 2px #fff, 0 0 0 3.5px ${ring}` : 'none',
    }}>{init}</div>
  );
}

function TopBar({ left = 'back', title, right }) {
  const renderLeft = left === 'back'
    ? <Pill>{CI.back()}</Pill>
    : left === 'close'
      ? <Pill>{CI.close()}</Pill>
      : (left || <div style={{ width: 36 }} />);
  return (
    <div style={{
      padding: '14px 24px 0',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      {renderLeft}
      <div style={{
        fontFamily: cg.serif, fontSize: 16, color: cg.forestDeep,
        fontWeight: 500, letterSpacing: -0.2,
      }}>{title}</div>
      {right || <div style={{ width: 36 }} />}
    </div>
  );
}

function Pill({ children, dark, onClick }) {
  return (
    <div onClick={onClick} style={{
      width: 36, height: 36, borderRadius: 12,
      background: dark ? cg.forestDeep : '#fff',
      border: dark ? 'none' : `1px solid ${cg.line}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer',
    }}>{children}</div>
  );
}

function SectionTitle({ title, accent, count }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
      marginBottom: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{
          fontFamily: cg.serif, fontSize: 17, color: cg.forestDeep,
          fontWeight: 500, letterSpacing: -0.3,
        }}>{title}</span>
        {count != null && (
          <span style={{
            fontSize: 11, fontFamily: 'ui-monospace, monospace',
            color: cg.muted, letterSpacing: 0.4,
          }}>{String(count).padStart(2, '0')}</span>
        )}
      </div>
      {accent && (
        <span style={{ fontSize: 11, color: cg.muted, letterSpacing: 0.3 }}>{accent}</span>
      )}
    </div>
  );
}

function RoleBadge({ role }) {
  const tone =
    role === 'PSW'        ? { bg: '#E5DCC9', fg: '#5C4A2A' } :
    role === 'Specialist' ? { bg: cg.sageSoft, fg: '#2E4942' } :
                            { bg: cg.terracottaSoft, fg: '#7A3F2A' };
  return (
    <span style={{
      padding: '2px 7px', borderRadius: 99,
      background: tone.bg, color: tone.fg,
      fontSize: 9.5, fontWeight: 700, letterSpacing: 0.4,
      textTransform: 'uppercase',
    }}>{role === 'PSW' ? 'Pro · PSW' : role === 'Specialist' ? 'Specialist' : 'Family'}</span>
  );
}

// =========================================================
// SCREEN 1 — Share & Caregivers (owner view)
// =========================================================
function ShareCaregivers({ onInvite, onFind }) {
  const active = caregivers.filter(c => c.status === 'active');
  const pending = caregivers.filter(c => c.status === 'pending');

  return (
    <div style={{
      width: '100%', height: '100%', background: cg.cream,
      fontFamily: cg.sans, color: cg.ink,
      display: 'flex', flexDirection: 'column', paddingTop: 56,
      position: 'relative',
    }}>
      <TopBar title="Share & Caregivers" right={<Pill>{CI.dots()}</Pill>} />

      <div style={{ flex: 1, overflow: 'auto', paddingBottom: 30 }}>
        {/* hero */}
        <div style={{ padding: '18px 24px 0' }}>
          <div style={{ fontSize: 10.5, color: cg.muted, letterSpacing: 0.4, textTransform: 'uppercase', fontWeight: 600 }}>
            Arjun Sharma · Father
          </div>
          <div style={{
            fontFamily: cg.serif, fontSize: 26, lineHeight: '30px',
            letterSpacing: -0.6, color: cg.forestDeep, fontWeight: 400, marginTop: 4,
          }}>The people who help</div>
          <div style={{ marginTop: 6, fontSize: 13, color: cg.muted, lineHeight: '18px', maxWidth: 300 }}>
            You decide what each person sees and what they can add. Change or revoke anytime.
          </div>
        </div>

        {/* stat strip */}
        <div style={{ padding: '20px 20px 0', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[
            { v: active.length, l: 'Active' },
            { v: pending.length, l: 'Pending' },
            { v: 40, l: 'Logged this wk' },
          ].map((s, i) => (
            <div key={i} style={{
              background: '#fff', borderRadius: 14, border: `1px solid ${cg.line}`,
              padding: '10px 12px',
            }}>
              <div style={{
                fontFamily: cg.serif, fontSize: 22, color: cg.forestDeep,
                fontWeight: 500, letterSpacing: -0.4, lineHeight: 1,
              }}>{s.v}</div>
              <div style={{ fontSize: 10, color: cg.muted, letterSpacing: 0.4, textTransform: 'uppercase', marginTop: 4 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* invite + find CTAs */}
        <div style={{ padding: '18px 20px 0', display: 'flex', gap: 8 }}>
          <button onClick={onFind} style={{
            flex: 1, height: 52, borderRadius: 16, border: 'none',
            background: cg.forestDeep, color: '#fff', cursor: 'pointer',
            fontFamily: cg.sans, fontSize: 14.5, fontWeight: 500,
            letterSpacing: -0.1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke="#fff" strokeWidth="1.6"/><path d="M9.5 9.5L13 13" stroke="#fff" strokeWidth="1.6" strokeLinecap="round"/></svg>
            Find caregiver
          </button>
          <button onClick={onInvite} style={{
            flex: 1, height: 52, borderRadius: 16,
            background: '#fff', color: cg.forestDeep,
            border: `1px solid ${cg.forestDeep}`, cursor: 'pointer',
            fontFamily: cg.sans, fontSize: 14.5, fontWeight: 500,
            letterSpacing: -0.1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            {CI.plus(cg.forestDeep)} Invite
          </button>
        </div>

        {/* Active */}
        {active.length > 0 && (
          <div style={{ padding: '24px 20px 0' }}>
            <SectionTitle title="Active" count={active.length} />
            {active.map(c => <CaregiverCard key={c.id} c={c} />)}
          </div>
        )}

        {/* Pending */}
        {pending.length > 0 && (
          <div style={{ padding: '20px 20px 0' }}>
            <SectionTitle title="Pending" count={pending.length} accent="expires in 7 days" />
            {pending.map(c => <CaregiverCard key={c.id} c={c} pending />)}
          </div>
        )}
      </div>
    </div>
  );
}

function CaregiverCard({ c, pending }) {
  const grantedCount = Object.values(c.sections).filter(s => s.v).length;
  const contribCount = Object.values(c.sections).filter(s => s.v && s.c).length;
  return (
    <div style={{
      background: '#fff', borderRadius: 16, border: `1px solid ${cg.line}`,
      padding: 14, marginBottom: 8,
      opacity: pending ? 0.95 : 1,
      borderStyle: pending ? 'dashed' : 'solid',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Avatar init={c.initials} tint={c.tint} size={44} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14.5, fontWeight: 600, color: cg.ink, letterSpacing: -0.1 }}>{c.name}</span>
            <RoleBadge role={c.role} />
          </div>
          <div style={{ fontSize: 11.5, color: cg.muted, marginTop: 2 }}>
            {c.rel} · {pending ? c.lastActive : `last active ${c.lastActive}`}
          </div>
        </div>
        {CI.chevR()}
      </div>
      {/* permissions bar */}
      <div style={{
        marginTop: 12, paddingTop: 10,
        borderTop: `1px solid ${cg.lineSoft}`,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {CI.shield(cg.muted)}
          <span style={{ fontSize: 11, color: cg.muted, letterSpacing: 0.2 }}>
            <b style={{ color: cg.ink, fontWeight: 600 }}>{grantedCount}</b> of 7 sections
            <span style={{ color: cg.mutedSoft }}> · {contribCount} contribute</span>
          </span>
        </div>
        <div style={{ flex: 1 }} />
        {pending ? (
          <span style={{ fontSize: 10.5, color: cg.terracotta, fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>
            Awaiting · Resend
          </span>
        ) : (
          <span style={{
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 10.5, color: cg.forest, fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase',
          }}>{CI.pencil(cg.forest)} Edit</span>
        )}
      </div>
    </div>
  );
}

// =========================================================
// SCREEN 2 — Invite Caregiver
// =========================================================
function InviteCaregiver({ onSend, onClose }) {
  const [email, setEmail] = React.useState('maya@gmail.com');
  const [role, setRole] = React.useState('Family');
  const [perms, setPerms] = React.useState({
    Medications: { v: true, c: true },
    Vitals:      { v: true, c: true },
    'Visit notes': { v: true, c: true },
    Conditions:  { v: true, c: false },
    Allergies:   { v: true, c: false },
    Documents:   { v: true, c: true },
    'Care team': { v: false, c: false },
  });

  const togVisible = (k) => setPerms(p => ({
    ...p, [k]: { v: !p[k].v, c: !p[k].v ? p[k].c : false }
  }));
  const togContrib = (k) => setPerms(p => ({
    ...p, [k]: { v: p[k].v, c: p[k].v ? !p[k].c : false }
  }));

  const sectionIcons = {
    Medications: CI.pill, Vitals: CI.pulse, 'Visit notes': CI.note,
    Conditions: CI.shield, Allergies: CI.warn, Documents: CI.doc, 'Care team': CI.note,
  };

  return (
    <div style={{
      width: '100%', height: '100%', background: cg.cream,
      fontFamily: cg.sans, color: cg.ink,
      display: 'flex', flexDirection: 'column', paddingTop: 56,
    }}>
      <TopBar title="Invite caregiver" left={<Pill onClick={onClose}>{CI.close()}</Pill>} />

      <div style={{ flex: 1, overflow: 'auto', paddingBottom: 110 }}>
        {/* Email */}
        <div style={{ padding: '18px 24px 0' }}>
          <Label>Their email</Label>
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              marginTop: 8, width: '100%', boxSizing: 'border-box',
              height: 52, borderRadius: 14, border: `1px solid ${cg.line}`,
              background: '#fff', padding: '0 16px',
              fontSize: 16, fontFamily: cg.sans, color: cg.ink,
              outline: 'none', letterSpacing: -0.1,
            }}
          />
        </div>

        {/* Role */}
        <div style={{ padding: '20px 24px 0' }}>
          <Label>Their role</Label>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            {[
              { k: 'Family', t: 'Family / Friend', sub: 'Trusted helper' },
              { k: 'PSW',    t: 'Professional PSW', sub: 'Paid caregiver' },
            ].map(r => {
              const active = role === r.k;
              return (
                <button key={r.k} onClick={() => setRole(r.k)} style={{
                  flex: 1, padding: '12px 12px', borderRadius: 14, cursor: 'pointer',
                  border: `1.5px solid ${active ? cg.forestDeep : cg.line}`,
                  background: active ? cg.forestDeep : '#fff',
                  color: active ? '#fff' : cg.ink,
                  textAlign: 'left', fontFamily: cg.sans,
                }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, letterSpacing: -0.1 }}>{r.t}</div>
                  <div style={{ fontSize: 11, opacity: active ? 0.7 : 0.55, marginTop: 2 }}>{r.sub}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Permissions */}
        <div style={{ padding: '24px 20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '0 4px', marginBottom: 10 }}>
            <Label>What can they see?</Label>
            <span style={{ fontSize: 10.5, color: cg.mutedSoft, letterSpacing: 0.3, textTransform: 'uppercase' }}>
              View · Contribute
            </span>
          </div>
          <div style={{
            background: '#fff', borderRadius: 16, border: `1px solid ${cg.line}`,
            overflow: 'hidden',
          }}>
            {Object.entries(perms).map(([k, p], i, arr) => {
              const Ico = sectionIcons[k] || CI.note;
              return (
                <div key={k} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px',
                  borderBottom: i < arr.length - 1 ? `1px solid ${cg.lineSoft}` : 'none',
                }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                    background: p.v ? cg.sageSoft : cg.cream,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: p.v ? 1 : 0.5,
                  }}><Ico c={p.v ? cg.forest : cg.muted} /></div>
                  <div style={{ flex: 1, fontSize: 13.5, fontWeight: 500, color: p.v ? cg.ink : cg.muted, letterSpacing: -0.1 }}>{k}</div>
                  {/* view toggle */}
                  <Toggle on={p.v} onClick={() => togVisible(k)} />
                  {/* contribute toggle (disabled when v is off) */}
                  <Toggle on={p.v && p.c} onClick={() => togContrib(k)} disabled={!p.v} accent={cg.terracotta} />
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 10, padding: '0 4px', fontSize: 11, color: cg.mutedSoft, lineHeight: '15px', display: 'flex', alignItems: 'center', gap: 4 }}>
            {CI.shield(cg.mutedSoft)} Server-side enforced. Sections you turn off are never sent to their device.
          </div>
        </div>
      </div>

      {/* sticky send */}
      <div style={{
        padding: '14px 20px 30px', background: cg.cream,
        borderTop: `1px solid ${cg.line}`,
      }}>
        <button onClick={onSend} style={{
          width: '100%', height: 52, borderRadius: 16, border: 'none',
          background: cg.forestDeep, color: '#fff', cursor: 'pointer',
          fontFamily: cg.sans, fontSize: 15, fontWeight: 500,
          letterSpacing: -0.1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>{CI.send()} Send invite</button>
      </div>
    </div>
  );
}

function Label({ children }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, color: cg.muted,
      letterSpacing: 0.5, textTransform: 'uppercase',
    }}>{children}</div>
  );
}

function Toggle({ on, onClick, disabled, accent }) {
  const fg = accent || cg.forestDeep;
  return (
    <div onClick={disabled ? undefined : onClick} style={{
      width: 36, height: 22, borderRadius: 99, flexShrink: 0,
      background: on ? fg : '#E5DDD0',
      cursor: disabled ? 'default' : 'pointer',
      position: 'relative',
      opacity: disabled ? 0.4 : 1,
      transition: 'background 0.18s',
    }}>
      <div style={{
        position: 'absolute', top: 2, left: on ? 16 : 2,
        width: 18, height: 18, borderRadius: 99,
        background: '#fff', transition: 'left 0.18s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
      }} />
    </div>
  );
}

// =========================================================
// SCREEN 3 — Activity Feed (owner)
// =========================================================
function ActivityFeed() {
  const kindMeta = {
    visit:  { i: CI.note(cg.forest),     bg: cg.terracottaSoft },
    vitals: { i: CI.pulse(cg.forest),    bg: cg.sageSoft },
    meds:   { i: CI.pill(cg.forest),     bg: '#E9DEC4' },
    doc:    { i: CI.doc(cg.forest),      bg: cg.terracottaSoft },
  };
  return (
    <div style={{
      width: '100%', height: '100%', background: cg.cream,
      fontFamily: cg.sans, color: cg.ink,
      display: 'flex', flexDirection: 'column', paddingTop: 56,
    }}>
      <TopBar title="Activity" right={<Pill>{CI.dots()}</Pill>} />

      {/* header & filter */}
      <div style={{ padding: '14px 24px 0' }}>
        <div style={{ fontSize: 10.5, color: cg.muted, letterSpacing: 0.4, textTransform: 'uppercase', fontWeight: 600 }}>
          Arjun Sharma · Activity log
        </div>
        <div style={{
          fontFamily: cg.serif, fontSize: 26, lineHeight: '30px',
          letterSpacing: -0.6, color: cg.forestDeep, fontWeight: 400, marginTop: 4,
        }}>What happened today</div>
      </div>

      <div style={{ padding: '14px 20px 0', display: 'flex', gap: 6, overflowX: 'auto' }}>
        {['Today', 'James', 'Maya', 'Vitals', 'Meds', 'Notes'].map((f, i) => (
          <div key={f} style={{
            flexShrink: 0, padding: '6px 12px', borderRadius: 99,
            background: i === 0 ? cg.forestDeep : '#fff',
            color: i === 0 ? '#fff' : cg.ink,
            border: i === 0 ? 'none' : `1px solid ${cg.line}`,
            fontSize: 12, fontWeight: 500, letterSpacing: -0.1,
          }}>{f}</div>
        ))}
      </div>

      {/* awaiting review banner */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{
          background: cg.forestDeep, color: '#fff',
          borderRadius: 14, padding: '10px 12px',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 26, height: 26, borderRadius: 8,
            background: cg.terracotta, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{CI.warn('#fff')}</div>
          <div style={{ flex: 1, fontSize: 12, lineHeight: '16px' }}>
            <b style={{ fontWeight: 600 }}>1 upload awaiting your review.</b>
            <span style={{ color: 'rgba(255,255,255,0.65)' }}> Maya's prescription from Monday.</span>
          </div>
          <span style={{
            padding: '4px 10px', borderRadius: 99,
            background: 'rgba(255,255,255,0.14)', color: '#fff',
            fontSize: 11, fontWeight: 600, letterSpacing: -0.1,
          }}>Review</span>
        </div>
      </div>

      {/* timeline */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 20px 30px' }}>
        {/* group by date — Today */}
        <DateLabel d="Today · May 12" />
        {activity.filter(a => a.time.startsWith('today')).map((a, i, arr) => (
          <FeedItem key={a.id} a={a} kindMeta={kindMeta} isLast={i === arr.length - 1} />
        ))}
        <div style={{ height: 14 }} />
        <DateLabel d="Yesterday · May 11" />
        {activity.filter(a => a.time.startsWith('Yesterday')).map((a, i, arr) => (
          <FeedItem key={a.id} a={a} kindMeta={kindMeta} isLast={i === arr.length - 1} />
        ))}
        <div style={{ height: 14 }} />
        <DateLabel d="Earlier this week" />
        {activity.filter(a => !a.time.startsWith('Yesterday') && !a.time.startsWith('today')).map((a, i, arr) => (
          <FeedItem key={a.id} a={a} kindMeta={kindMeta} isLast={i === arr.length - 1} />
        ))}
      </div>
    </div>
  );
}

function DateLabel({ d }) {
  return (
    <div style={{
      fontSize: 10.5, color: cg.muted, letterSpacing: 0.5, textTransform: 'uppercase',
      fontWeight: 600, marginBottom: 8, paddingLeft: 2,
    }}>{d}</div>
  );
}

function FeedItem({ a, kindMeta, isLast }) {
  const k = kindMeta[a.kind];
  return (
    <div style={{ display: 'flex', gap: 12, paddingBottom: isLast ? 0 : 12, position: 'relative' }}>
      {/* spine */}
      <div style={{ width: 38, flexShrink: 0, position: 'relative', display: 'flex', justifyContent: 'center' }}>
        <Avatar init={a.init} tint={a.tint} size={36} />
        {!isLast && (
          <div style={{
            position: 'absolute', top: 38, bottom: -12,
            width: 1.5, background: cg.line,
          }} />
        )}
      </div>
      <div style={{
        flex: 1, background: '#fff', borderRadius: 14,
        border: `1px solid ${cg.line}`, padding: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 22, height: 22, borderRadius: 6,
            background: k.bg, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{k.i}</div>
          <span style={{ fontSize: 12, color: cg.muted }}>
            <b style={{ color: cg.ink, fontWeight: 600 }}>{a.who}</b> · {a.time.replace('today · ', '').replace('Yesterday · ', '')}
          </span>
          {a.flag && (
            <span style={{
              marginLeft: 'auto', padding: '1px 6px', borderRadius: 99,
              background: '#FBE3D9', color: cg.terracotta,
              fontSize: 9, fontWeight: 700, letterSpacing: 0.4,
            }}>FLAGGED</span>
          )}
          {a.awaiting && (
            <span style={{
              marginLeft: 'auto', padding: '1px 6px', borderRadius: 99,
              background: '#E9DEC4', color: '#5C4A2A',
              fontSize: 9, fontWeight: 700, letterSpacing: 0.4,
            }}>REVIEW</span>
          )}
        </div>
        <div style={{
          marginTop: 6, fontSize: 13.5, fontWeight: 600, color: cg.ink,
          letterSpacing: -0.1,
        }}>{a.summary}</div>
        <div style={{ marginTop: 4, fontSize: 12, color: cg.muted, lineHeight: '16px', textWrap: 'pretty' }}>
          {a.detail}
        </div>
      </div>
    </div>
  );
}

// =========================================================
// SCREEN 4 — Caregiver Dashboard (Maya's view)
// =========================================================
function CaregiverDashboard({ onLogVisit, onShift }) {
  return (
    <div style={{
      width: '100%', height: '100%', background: cg.cream,
      fontFamily: cg.sans, color: cg.ink,
      display: 'flex', flexDirection: 'column', paddingTop: 56,
      position: 'relative',
    }}>
      {/* role mode strip */}
      <div style={{
        position: 'absolute', top: 56, left: 0, right: 0, height: 4,
        background: cg.terracotta, opacity: 0.85,
      }} />

      <div style={{
        padding: '20px 24px 0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{
            fontSize: 10, color: cg.terracotta, letterSpacing: 0.6,
            textTransform: 'uppercase', fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            {CI.shield(cg.terracotta)} Caregiver mode
          </div>
          <div style={{
            fontFamily: cg.serif, fontSize: 26, lineHeight: '32px',
            letterSpacing: -0.6, color: cg.forestDeep, fontWeight: 400, marginTop: 4,
          }}>Hello, Maya</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Pill>{CI.swap()}</Pill>
          <Pill>{CI.bell()}</Pill>
        </div>
      </div>

      <div style={{ padding: '4px 24px 0', fontSize: 12, color: cg.muted, lineHeight: '17px' }}>
        2 people shared with you · 3 things to do today
      </div>

      <div style={{ flex: 1, overflow: 'auto', paddingBottom: 100, paddingTop: 18 }}>
        {/* Profile card 1 — Arjun (Priya shared) */}
        <div style={{ padding: '0 20px' }}>
          <SharedProfileCard
            name="Arjun Sharma"
            rel="Dad"
            sharedBy="Priya"
            tint="#3F5D54"
            init="AS"
            tasksToday={[
              { i: CI.pill(cg.forest), label: 'Confirm evening meds', count: '3 due 8 PM' },
              { i: CI.pulse(cg.forest), label: 'Log blood pressure', count: 'Last: 152/96 high' },
              { i: CI.note(cg.forest), label: 'Visit note', count: 'Pending' },
            ]}
            permissions={['Meds', 'Vitals', 'Notes', 'Conditions', 'Allergies', 'Docs']}
            onLogVisit={onLogVisit}
            onShift={onShift}
          />
        </div>

        {/* Profile card 2 — Indira shared by someone else */}
        <div style={{ padding: '14px 20px 0' }}>
          <SharedProfileCard
            name="Indira Sharma"
            rel="Mum"
            sharedBy="Priya"
            tint="#C66E4E"
            init="IS"
            tasksToday={[
              { i: CI.pill(cg.forest), label: 'Confirm morning meds', count: '2 due 7 AM' },
            ]}
            permissions={['Meds', 'Vitals', 'Notes']}
            onLogVisit={onLogVisit}
          />
        </div>

        {/* note */}
        <div style={{ padding: '20px 24px 0', fontSize: 11.5, color: cg.mutedSoft, lineHeight: '16px', display: 'flex', gap: 6 }}>
          {CI.shield(cg.mutedSoft)}
          <span>Caregivers can't invite others. Only profile owners manage access.</span>
        </div>
      </div>

      {/* tab bar */}
      <BottomTabs activeIdx={0} labels={['Today', 'People', 'Activity', 'You']} />
    </div>
  );
}

function SharedProfileCard({ name, rel, sharedBy, tint, init, tasksToday, permissions, onLogVisit, onShift }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 20, border: `1px solid ${cg.line}`,
      padding: 16, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Avatar init={init} tint={tint} size={48} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10.5, color: cg.muted, letterSpacing: 0.4, textTransform: 'uppercase' }}>
            {rel} · shared by {sharedBy}
          </div>
          <div style={{
            fontFamily: cg.serif, fontSize: 19, color: cg.forestDeep,
            fontWeight: 500, letterSpacing: -0.3, marginTop: 1,
          }}>{name}</div>
        </div>
        <Pill>{CI.chevR()}</Pill>
      </div>

      {/* permission summary */}
      <div style={{
        marginTop: 12, display: 'flex', gap: 4, flexWrap: 'wrap',
        paddingTop: 10, borderTop: `1px solid ${cg.lineSoft}`,
      }}>
        {permissions.map(p => (
          <span key={p} style={{
            padding: '2px 7px', borderRadius: 99,
            background: cg.cream, border: `1px solid ${cg.lineSoft}`,
            fontSize: 10, color: cg.muted, fontWeight: 500,
          }}>{p}</span>
        ))}
      </div>

      {/* today's tasks */}
      {tasksToday && tasksToday.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{
            fontSize: 10.5, color: cg.muted, letterSpacing: 0.5,
            textTransform: 'uppercase', fontWeight: 600, marginBottom: 6,
          }}>Today</div>
          <div style={{
            background: cg.cream, borderRadius: 12, padding: 4,
          }}>
            {tasksToday.map((t, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px',
                borderBottom: i < tasksToday.length - 1 ? `1px solid ${cg.lineSoft}` : 'none',
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: 7,
                  background: '#fff', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{t.i}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 500, color: cg.ink, letterSpacing: -0.1 }}>{t.label}</div>
                  <div style={{ fontSize: 10.5, color: cg.muted }}>{t.count}</div>
                </div>
                {CI.chevR(cg.mutedSoft)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* quick actions */}
      <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
        <button onClick={onShift} style={{
          flex: 1, height: 40, borderRadius: 12, cursor: 'pointer',
          background: cg.forestDeep, color: '#fff', border: 'none',
          fontFamily: cg.sans, fontSize: 12.5, fontWeight: 500, letterSpacing: -0.1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
        }}>{CI.pill('#fff')} Start visit</button>
        <button onClick={onLogVisit} style={{
          flex: 1, height: 40, borderRadius: 12, cursor: 'pointer',
          background: '#fff', color: cg.ink, border: `1px solid ${cg.line}`,
          fontFamily: cg.sans, fontSize: 12.5, fontWeight: 500, letterSpacing: -0.1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
        }}>{CI.note(cg.ink)} Note</button>
      </div>
    </div>
  );
}

// =========================================================
// SCREEN 5 — Today's Shift (PSW view, James)
// =========================================================
function PSWShift() {
  const [meds, setMeds] = React.useState([
    { name: 'Metformin',    dose: '500 mg · with food', time: '8 AM', period: 'morning', state: 'given' },
    { name: 'Ramipril',     dose: '5 mg',                time: '8 AM', period: 'morning', state: 'given' },
    { name: 'Aspirin',      dose: '81 mg',               time: '8 AM', period: 'morning', state: 'given' },
    { name: 'Atorvastatin', dose: '20 mg',               time: '8 AM', period: 'morning', state: 'skipped', reason: 'Pt asked to take after dinner' },
    { name: 'Warfarin',     dose: '3 mg',                time: '8 PM', period: 'evening', state: 'pending' },
  ]);
  const setState = (i, s) => setMeds(m => m.map((x, j) => j === i ? { ...x, state: s } : x));

  const morningCount = meds.filter(m => m.period === 'morning').length;
  const morningDone = meds.filter(m => m.period === 'morning' && m.state !== 'pending').length;

  return (
    <div style={{
      width: '100%', height: '100%', background: cg.cream,
      fontFamily: cg.sans, color: cg.ink,
      display: 'flex', flexDirection: 'column', paddingTop: 56,
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute', top: 56, left: 0, right: 0, height: 4,
        background: cg.terracotta, opacity: 0.85,
      }} />

      <TopBar title="Morning shift" left={<Pill>{CI.back()}</Pill>} right={<Pill>{CI.dots()}</Pill>} />

      {/* shift hero */}
      <div style={{ padding: '14px 24px 0' }}>
        <div style={{ fontSize: 10, color: cg.terracotta, letterSpacing: 0.6, textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
          {CI.shield(cg.terracotta)} PSW · James Okoye
        </div>
        <div style={{
          fontFamily: cg.serif, fontSize: 24, lineHeight: '28px',
          letterSpacing: -0.5, color: cg.forestDeep, fontWeight: 400, marginTop: 4,
        }}>Arjun Sharma · 78</div>
        <div style={{ marginTop: 4, fontSize: 12.5, color: cg.muted }}>
          Tue 12 May · started 9:02 AM
        </div>
      </div>

      {/* progress */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{
          background: '#fff', borderRadius: 16, border: `1px solid ${cg.line}`,
          padding: 14, display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <ShiftRing pct={(morningDone / morningCount) * 100} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11.5, color: cg.muted, letterSpacing: 0.3 }}>Morning medications</div>
            <div style={{ fontFamily: cg.serif, fontSize: 18, fontWeight: 500, color: cg.forestDeep, letterSpacing: -0.3, marginTop: 2 }}>
              {morningDone} of {morningCount} confirmed
            </div>
          </div>
          <span style={{
            padding: '4px 10px', borderRadius: 99,
            background: cg.sageSoft, color: '#2E4942',
            fontSize: 11, fontWeight: 700, letterSpacing: 0.4,
            textTransform: 'uppercase',
          }}>On track</span>
        </div>
      </div>

      {/* allergies banner */}
      <div style={{ padding: '12px 20px 0' }}>
        <div style={{
          background: '#FBE3D9', borderRadius: 14, padding: '10px 12px',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 24, height: 24, borderRadius: 7,
            background: cg.terracotta, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{CI.warn('#fff')}</div>
          <div style={{ fontSize: 12, color: '#5C2A1F' }}>
            <b style={{ fontWeight: 600 }}>Allergies:</b> Penicillin · Sulfa drugs · Peanuts
          </div>
        </div>
      </div>

      {/* meds list */}
      <div style={{ flex: 1, overflow: 'auto', padding: '18px 20px 100px' }}>
        <SectionTitle title="Medications" count={meds.length} accent="confirm each" />
        <div style={{
          background: '#fff', borderRadius: 16, border: `1px solid ${cg.line}`,
          overflow: 'hidden',
        }}>
          {meds.map((m, i) => (
            <ShiftMedRow key={i} m={m} isLast={i === meds.length - 1} onGiven={() => setState(i, 'given')} onSkip={() => setState(i, 'skipped')} />
          ))}
        </div>

        {/* quick vitals strip */}
        <div style={{ marginTop: 18 }}>
          <SectionTitle title="Log a vital" accent="optional" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { l: 'Blood pressure', sub: 'Last 152/96', i: CI.pulse(cg.forest) },
              { l: 'Blood sugar',    sub: 'Last 6.2',     i: CI.pill(cg.forest) },
            ].map((v, i) => (
              <div key={i} style={{
                background: '#fff', borderRadius: 14, border: `1px solid ${cg.line}`,
                padding: 12, display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 9,
                  background: cg.sageSoft,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>{v.i}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: cg.ink, letterSpacing: -0.1 }}>{v.l}</div>
                  <div style={{ fontSize: 10.5, color: cg.muted }}>{v.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* sticky end shift */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '14px 20px 30px', background: cg.cream,
        borderTop: `1px solid ${cg.line}`,
      }}>
        <button style={{
          width: '100%', height: 50, borderRadius: 16, border: 'none',
          background: cg.forestDeep, color: '#fff', cursor: 'pointer',
          fontFamily: cg.sans, fontSize: 14.5, fontWeight: 500,
          letterSpacing: -0.1,
        }}>End shift & save</button>
      </div>
    </div>
  );
}

function ShiftRing({ pct, size = 44 }) {
  const stroke = 4.5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct / 100);
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} stroke={cg.line} strokeWidth={stroke} fill="none"/>
      <circle cx={size/2} cy={size/2} r={r} stroke={cg.forestDeep} strokeWidth={stroke} fill="none"
        strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" />
    </svg>
  );
}

function ShiftMedRow({ m, isLast, onGiven, onSkip }) {
  const isEvening = m.period === 'evening';
  const greyed = isEvening; // greyed during morning shift
  return (
    <div style={{
      padding: '12px 14px',
      borderBottom: isLast ? 'none' : `1px solid ${cg.lineSoft}`,
      display: 'flex', alignItems: 'center', gap: 10,
      opacity: greyed && m.state === 'pending' ? 0.5 : 1,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: cg.ink, letterSpacing: -0.1 }}>{m.name}</span>
          <span style={{ fontSize: 11, color: cg.muted }}>{m.dose}</span>
        </div>
        <div style={{ fontSize: 10.5, color: cg.muted, marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{
            padding: '1px 5px', borderRadius: 4,
            background: cg.cream, fontFamily: 'ui-monospace, monospace',
            fontSize: 9.5, letterSpacing: 0.2,
          }}>{m.time}</span>
          {greyed && <span style={{ fontSize: 9.5, color: cg.mutedSoft, letterSpacing: 0.3, textTransform: 'uppercase', fontWeight: 600 }}>· evening</span>}
          {m.state === 'skipped' && m.reason && (
            <span style={{ fontSize: 10.5, color: cg.terracotta, fontStyle: 'italic' }}>· {m.reason}</span>
          )}
        </div>
      </div>
      {/* state pills */}
      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={onSkip} disabled={greyed} style={{
          width: 32, height: 32, borderRadius: 99, cursor: greyed ? 'default' : 'pointer',
          border: `1.5px solid ${m.state === 'skipped' ? cg.terracotta : cg.line}`,
          background: m.state === 'skipped' ? cg.terracotta : '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 0,
        }}>{CI.x(m.state === 'skipped' ? '#fff' : cg.muted)}</button>
        <button onClick={onGiven} disabled={greyed} style={{
          width: 32, height: 32, borderRadius: 99, cursor: greyed ? 'default' : 'pointer',
          border: `1.5px solid ${m.state === 'given' ? cg.forestDeep : cg.line}`,
          background: m.state === 'given' ? cg.forestDeep : '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 0,
        }}>{CI.check(m.state === 'given' ? '#fff' : cg.muted, 2)}</button>
      </div>
    </div>
  );
}

// =========================================================
// SCREEN 6 — Log Visit Note (caregiver)
// =========================================================
function LogVisitNote() {
  const [note, setNote] = React.useState("Dad ate a full dinner. Took all evening medications. Seemed a bit tired but in good spirits. He mentioned a slight headache around 7 PM — gone within an hour. Walked to the kitchen on his own twice.");
  const [vital, setVital] = React.useState({ sys: '136', dia: '84', sugar: '', hr: '' });

  return (
    <div style={{
      width: '100%', height: '100%', background: cg.cream,
      fontFamily: cg.sans, color: cg.ink,
      display: 'flex', flexDirection: 'column', paddingTop: 56,
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute', top: 56, left: 0, right: 0, height: 4,
        background: cg.terracotta, opacity: 0.85,
      }} />

      <TopBar title="Log a visit" left={<Pill>{CI.close()}</Pill>} />

      <div style={{ padding: '14px 24px 0' }}>
        <div style={{ fontSize: 10, color: cg.terracotta, letterSpacing: 0.6, textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
          {CI.shield(cg.terracotta)} You're posting as Maya · Sister
        </div>
        <div style={{
          fontFamily: cg.serif, fontSize: 22, lineHeight: '26px',
          letterSpacing: -0.5, color: cg.forestDeep, fontWeight: 400, marginTop: 4,
        }}>What happened tonight?</div>
        <div style={{ marginTop: 4, fontSize: 12.5, color: cg.muted }}>
          Priya will see this within seconds.
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '18px 20px 110px' }}>
        {/* when */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {['Now', 'Earlier today', 'Yesterday'].map((w, i) => (
            <button key={w} style={{
              flex: 1, height: 38, borderRadius: 12, cursor: 'pointer',
              border: `1px solid ${i === 0 ? cg.forestDeep : cg.line}`,
              background: i === 0 ? cg.forestDeep : '#fff',
              color: i === 0 ? '#fff' : cg.ink,
              fontFamily: cg.sans, fontSize: 12.5, fontWeight: 500, letterSpacing: -0.1,
            }}>{w}</button>
          ))}
        </div>

        {/* note */}
        <Label>Note</Label>
        <div style={{ position: 'relative', marginTop: 8 }}>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value.slice(0, 500))}
            rows={6}
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: 14, borderRadius: 16,
              background: '#fff', border: `1px solid ${cg.line}`,
              fontSize: 14, fontFamily: cg.sans, color: cg.ink,
              lineHeight: '20px', letterSpacing: -0.1,
              outline: 'none', resize: 'none',
            }}
          />
          <div style={{
            position: 'absolute', bottom: 10, right: 12,
            fontSize: 10.5, color: cg.mutedSoft, fontFamily: 'ui-monospace, monospace',
          }}>{note.length}/500</div>
        </div>

        {/* optional vitals */}
        <div style={{ marginTop: 18 }}>
          <SectionTitle title="Quick vitals" accent="optional" />
          <div style={{
            background: '#fff', borderRadius: 16, border: `1px solid ${cg.line}`,
            padding: 4,
          }}>
            <VitalInput label="Blood pressure" placeholder="—" right={
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <MiniInput v={vital.sys} onChange={v => setVital(s => ({ ...s, sys: v }))} w={42} ph="sys" />
                <span style={{ color: cg.mutedSoft }}>/</span>
                <MiniInput v={vital.dia} onChange={v => setVital(s => ({ ...s, dia: v }))} w={42} ph="dia" />
                <span style={{ fontSize: 10, color: cg.mutedSoft, letterSpacing: 0.3 }}>mmHg</span>
              </div>
            } />
            <Divider />
            <VitalInput label="Blood sugar" right={
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <MiniInput v={vital.sugar} onChange={v => setVital(s => ({ ...s, sugar: v }))} w={50} ph="—" />
                <span style={{ fontSize: 10, color: cg.mutedSoft, letterSpacing: 0.3 }}>mmol/L</span>
              </div>
            } />
            <Divider />
            <VitalInput label="Heart rate" right={
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <MiniInput v={vital.hr} onChange={v => setVital(s => ({ ...s, hr: v }))} w={50} ph="—" />
                <span style={{ fontSize: 10, color: cg.mutedSoft, letterSpacing: 0.3 }}>bpm</span>
              </div>
            } />
          </div>
        </div>

        {/* attribution */}
        <div style={{
          marginTop: 18, padding: '12px 14px',
          background: '#fff', borderRadius: 14, border: `1px solid ${cg.lineSoft}`,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <Avatar init="MS" tint="#C66E4E" size={32} />
          <div style={{ flex: 1, fontSize: 11.5, color: cg.muted, lineHeight: '15px' }}>
            Saves with your name and timestamp. Priya can see and reply on her dashboard.
          </div>
        </div>
      </div>

      {/* sticky save */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '14px 20px 30px', background: cg.cream,
        borderTop: `1px solid ${cg.line}`,
      }}>
        <button style={{
          width: '100%', height: 50, borderRadius: 16, border: 'none',
          background: cg.forestDeep, color: '#fff', cursor: 'pointer',
          fontFamily: cg.sans, fontSize: 14.5, fontWeight: 500,
          letterSpacing: -0.1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>{CI.send()} Save & notify Priya</button>
      </div>
    </div>
  );
}

function VitalInput({ label, right }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      padding: '10px 12px',
    }}>
      <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: cg.ink, letterSpacing: -0.1 }}>{label}</span>
      {right}
    </div>
  );
}

function MiniInput({ v, onChange, w, ph }) {
  return (
    <input
      value={v}
      onChange={e => onChange(e.target.value)}
      placeholder={ph}
      style={{
        width: w, height: 32, borderRadius: 8,
        background: cg.cream, border: `1px solid ${cg.lineSoft}`,
        textAlign: 'center', fontSize: 13.5, fontFamily: cg.sans,
        color: cg.ink, fontWeight: 600, outline: 'none',
      }}
    />
  );
}

function Divider() {
  return <div style={{ height: 1, background: cg.lineSoft, margin: '0 12px' }} />;
}

// =========================================================
// Shared bottom tabs
// =========================================================
function BottomTabs({ activeIdx = 0, labels = ['Home', 'People', 'Care', 'You'] }) {
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      paddingBottom: 24, paddingTop: 10,
      background: `linear-gradient(to top, ${cg.cream} 60%, rgba(246,241,234,0))`,
    }}>
      <div style={{
        margin: '0 16px', height: 60, borderRadius: 22,
        background: '#fff', border: `1px solid ${cg.line}`,
        boxShadow: '0 6px 24px rgba(31,61,56,0.06)',
        display: 'grid', gridTemplateColumns: `repeat(${labels.length}, 1fr)`,
        alignItems: 'center',
      }}>
        {labels.map((l, i) => {
          const a = i === activeIdx;
          return (
            <div key={l} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              color: a ? cg.forestDeep : cg.muted,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: 99, background: a ? cg.forestDeep : 'transparent' }} />
              <div style={{ fontSize: 11, fontWeight: a ? 600 : 500 }}>{l}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =========================================================
// Interactive owner-side flow wrapper
// =========================================================
function OwnerCaregiverFlow() {
  const [step, setStep] = React.useState('share'); // share | invite | feed | find
  if (step === 'invite') return <InviteCaregiver onClose={() => setStep('share')} onSend={() => setStep('share')} />;
  if (step === 'feed')   return <ActivityFeed />;
  if (step === 'find')   return <FindCaregiverFlow onBack={() => setStep('share')} />;
  return <ShareCaregivers onInvite={() => setStep('invite')} onFind={() => setStep('find')} />;
}

function CaregiverFlow() {
  const [step, setStep] = React.useState('dash'); // dash | shift | note
  if (step === 'shift') return <PSWShift />;
  if (step === 'note')  return <LogVisitNote />;
  return <CaregiverDashboard onShift={() => setStep('shift')} onLogVisit={() => setStep('note')} />;
}

Object.assign(window, {
  ShareCaregivers, InviteCaregiver, ActivityFeed,
  CaregiverDashboard, PSWShift, LogVisitNote,
  OwnerCaregiverFlow, CaregiverFlow,
});
