// CareCircle — login, onboarding, dashboard screens

const tokens = {
  cream: '#F6F1EA',
  paper: '#FBF7F1',
  ink: '#1A1F1D',
  forest: '#1F3D38',
  forestDeep: '#15302C',
  terracotta: '#C66E4E',
  terracottaSoft: '#E9CFC1',
  sage: '#A8B5A0',
  sageSoft: '#DDE4D6',
  muted: '#6B6862',
  mutedSoft: '#9A968F',
  line: '#E8E0D2',
  lineSoft: '#EFE8DA',
  serif: '"Newsreader", "Times New Roman", Georgia, serif',
  sans: '-apple-system, "SF Pro Text", "Helvetica Neue", system-ui, sans-serif',
};

// ─── Logo ───────────────────────────────────────────────
function CCLogo({ size = 28, color = tokens.forest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="13" stroke={color} strokeWidth="1.5" />
      <circle cx="16" cy="16" r="7.5" stroke={color} strokeWidth="1.5" />
      <circle cx="16" cy="8.5" r="2" fill={color} />
    </svg>
  );
}

// ─── Striped placeholder ────────────────────────────────
function Placeholder({ w = '100%', h = 120, label, dark = false, radius = 14 }) {
  const c1 = dark ? '#34423E' : '#E5DCC9';
  const c2 = dark ? '#3B4B47' : '#EFE8DA';
  const ink = dark ? 'rgba(255,255,255,0.7)' : tokens.muted;
  return (
    <div style={{
      width: w, height: h, borderRadius: radius,
      background: `repeating-linear-gradient(135deg, ${c1} 0 6px, ${c2} 6px 12px)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'ui-monospace, SF Mono, Menlo, monospace',
      fontSize: 10, letterSpacing: 0.5, color: ink,
      textTransform: 'uppercase',
    }}>{label}</div>
  );
}

// ─── Pill icons ─────────────────────────────────────────
const Icon = {
  apple: (c = '#fff') => (
    <svg width="18" height="20" viewBox="0 0 18 20" fill="none">
      <path d="M14.55 10.6c0-2.6 2.1-3.85 2.2-3.9-1.2-1.75-3.05-2-3.7-2-1.6-.15-3.1.95-3.9.95-.85 0-2.05-.95-3.4-.9-1.7.05-3.3 1-4.2 2.55-1.85 3.15-.45 7.85 1.3 10.4.85 1.25 1.85 2.65 3.2 2.6 1.3-.05 1.8-.85 3.35-.85s2 .85 3.35.85c1.4 0 2.3-1.25 3.15-2.55.65-.95 1.05-1.95 1.4-2.95-1.7-.65-2.75-2.3-2.75-4.2z" fill={c}/>
      <path d="M11.95 3c.7-.85 1.2-2.05 1.05-3.25-1.05.05-2.3.7-3.05 1.55-.65.75-1.25 1.95-1.1 3.15 1.15.1 2.4-.6 3.1-1.45z" fill={c}/>
    </svg>
  ),
  google: () => (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.71v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.61z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.34 0-4.33-1.58-5.04-3.71H.96v2.33A9 9 0 009 18z" fill="#34A853"/>
      <path d="M3.96 10.71A5.41 5.41 0 013.68 9c0-.59.1-1.17.28-1.71V4.96H.96A9 9 0 000 9c0 1.45.35 2.83.96 4.04l3-2.33z" fill="#FBBC05"/>
      <path d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 00.96 4.96l3 2.33C4.67 5.16 6.66 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  ),
  mail: (c = tokens.forest) => (
    <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
      <rect x="1" y="1" width="16" height="12" rx="2" stroke={c} strokeWidth="1.5"/>
      <path d="M1.5 2L9 8l7.5-6" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  bell: (c = tokens.ink) => (
    <svg width="18" height="20" viewBox="0 0 18 20" fill="none">
      <path d="M9 2v1.5M3 8a6 6 0 1112 0v3l1.5 3h-15L3 11V8z" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7 17a2 2 0 004 0" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  plus: (c = tokens.forest) => (
    <svg width="14" height="14" viewBox="0 0 14 14"><path d="M7 1v12M1 7h12" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></svg>
  ),
  arrow: (c = tokens.forest) => (
    <svg width="14" height="12" viewBox="0 0 14 12" fill="none"><path d="M1 6h12m0 0L8 1m5 5L8 11" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  shield: (c = tokens.muted) => (
    <svg width="12" height="14" viewBox="0 0 12 14" fill="none"><path d="M6 .5L1 2.5v4c0 3 2 5.5 5 6.5 3-1 5-3.5 5-6.5v-4l-5-2z" stroke={c} strokeWidth="1.2" strokeLinejoin="round"/></svg>
  ),
  heart: (c = tokens.terracotta) => (
    <svg width="14" height="12" viewBox="0 0 14 12" fill="none"><path d="M7 11s-5.5-3-5.5-7A2.5 2.5 0 016 2c.5 0 .8.2 1 .5.2-.3.5-.5 1-.5a2.5 2.5 0 014.5 2c0 4-5.5 7-5.5 7z" fill={c}/></svg>
  ),
  drop: (c = tokens.forest) => (
    <svg width="12" height="14" viewBox="0 0 12 14" fill="none"><path d="M6 1c0 4-5 5-5 8.5a5 5 0 0010 0C11 6 6 5 6 1z" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/></svg>
  ),
  pulse: (c = tokens.forest) => (
    <svg width="16" height="14" viewBox="0 0 16 14" fill="none"><path d="M1 7h3l2-5 4 10 2-5h3" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  scale: (c = tokens.forest) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="12" height="12" rx="3" stroke={c} strokeWidth="1.4"/><path d="M5 5l2-2 2 2" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>
  ),
  pill: (c = tokens.forest) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="5" width="14" height="6" rx="3" stroke={c} strokeWidth="1.4"/><path d="M8 5v6" stroke={c} strokeWidth="1.4"/></svg>
  ),
  doc: (c = tokens.forest) => (
    <svg width="14" height="16" viewBox="0 0 14 16" fill="none"><path d="M2 1h7l4 4v10H2V1z" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/><path d="M9 1v4h4" stroke={c} strokeWidth="1.4"/></svg>
  ),
  home: (c = tokens.forest) => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 8l7-6 7 6v8H2V8z" stroke={c} strokeWidth="1.5" strokeLinejoin="round"/><path d="M7 16v-5h4v5" stroke={c} strokeWidth="1.5"/></svg>
  ),
  people: (c = tokens.muted) => (
    <svg width="20" height="16" viewBox="0 0 20 16" fill="none"><circle cx="6" cy="5" r="3" stroke={c} strokeWidth="1.4"/><path d="M1 15c0-3 2-5 5-5s5 2 5 5" stroke={c} strokeWidth="1.4" strokeLinecap="round"/><circle cx="14" cy="6" r="2.5" stroke={c} strokeWidth="1.4"/><path d="M11 14c0-2 1.5-3.5 3.5-3.5S19 12 19 14" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>
  ),
  user: (c = tokens.muted) => (
    <svg width="16" height="18" viewBox="0 0 16 18" fill="none"><circle cx="8" cy="5" r="3.5" stroke={c} strokeWidth="1.4"/><path d="M2 17c0-3 3-5 6-5s6 2 6 5" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>
  ),
  check: (c = tokens.forest) => (
    <svg width="12" height="10" viewBox="0 0 12 10" fill="none"><path d="M1 5l3 3 7-7" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  chevronRight: (c = tokens.muted) => (
    <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1l5 5-5 5" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
};

// ─── 1. LOGIN SCREEN ────────────────────────────────────
function LoginScreen({ onContinue, initialRole = 'dear' }) {
  const [role, setRole] = React.useState(initialRole); // 'dear' | 'pro'
  const isPro = role === 'pro';
  const hero = isPro
    ? { title: ['Care, kept', 'on the record.'], sub: 'Your roster, shift notes, and family channel — one calm tool for the work you do every day.' }
    : { title: ['Care,', 'kept close.'], sub: 'One quiet place for the people you look after — medications, doctors, and what matters next.' };
  return (
    <div style={{
      width: '100%', height: '100%', background: tokens.cream,
      display: 'flex', flexDirection: 'column',
      fontFamily: tokens.sans, color: tokens.ink,
      paddingTop: 64,
    }}>
      {/* top brand */}
      <div style={{ padding: '36px 28px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
        <CCLogo size={26} />
        <span style={{
          fontFamily: tokens.serif, fontSize: 21, letterSpacing: -0.3,
          color: tokens.forest, fontWeight: 500,
        }}>CareCircle</span>
      </div>

      {/* hero copy */}
      <div style={{ padding: '52px 28px 0' }}>
        <div style={{
          fontFamily: tokens.serif, fontSize: 42, lineHeight: '44px',
          letterSpacing: -1.2, color: tokens.forestDeep, fontWeight: 400,
          textWrap: 'pretty',
        }}>
          {hero.title[0]}<br />
          {hero.title[1]}
        </div>
        <div style={{
          marginTop: 16, fontSize: 15, lineHeight: '22px', color: tokens.muted,
          maxWidth: 300, letterSpacing: -0.1,
        }}>
          {hero.sub}
        </div>
      </div>

      <div style={{ flex: 1 }} />

      {/* role tabs */}
      <div style={{ padding: '0 24px 14px' }}>
        <div style={{ fontSize: 11, color: tokens.mutedSoft, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8, paddingLeft: 4 }}>
          I am signing in as
        </div>
        <div style={{
          height: 50, background: '#fff', borderRadius: 14,
          border: `1px solid ${tokens.line}`, padding: 4,
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4,
        }}>
          {[
            { k: 'dear', label: 'Dear ones', sub: 'family' },
            { k: 'pro',  label: 'Caregiver', sub: 'professional' },
          ].map(t => {
            const active = role === t.k;
            return (
              <button key={t.k} onClick={() => setRole(t.k)} style={{
                border: 'none', cursor: 'pointer',
                background: active ? tokens.forestDeep : 'transparent',
                color: active ? '#fff' : tokens.ink,
                borderRadius: 11, fontFamily: tokens.sans,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: 1, padding: '0 8px',
              }}>
                <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: -0.2, lineHeight: 1 }}>{t.label}</span>
                <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: 0.3, opacity: active ? 0.7 : 0.5, textTransform: 'uppercase' }}>{t.sub}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* sign-in buttons */}
      <div style={{ padding: '0 24px 22px', display: 'flex', flexDirection: 'column', gap: 9 }}>
        <button onClick={() => onContinue && onContinue(role)} style={{
          height: 52, borderRadius: 14, border: 'none',
          background: tokens.forestDeep, color: '#fff',
          fontSize: 15.5, fontWeight: 500, fontFamily: tokens.sans,
          letterSpacing: -0.2,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          cursor: 'pointer',
        }}>
          {Icon.apple('#fff')}
          Continue with Apple
        </button>
        <button onClick={() => onContinue && onContinue(role)} style={{
          height: 52, borderRadius: 14,
          background: '#fff', color: tokens.ink,
          border: `1px solid ${tokens.line}`,
          fontSize: 15.5, fontWeight: 500, fontFamily: tokens.sans,
          letterSpacing: -0.2,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          cursor: 'pointer',
        }}>
          {Icon.google()}
          Continue with Google
        </button>
        <button onClick={() => onContinue && onContinue(role)} style={{
          height: 52, borderRadius: 14,
          background: 'transparent', color: tokens.forest,
          border: `1px solid ${tokens.line}`,
          fontSize: 15.5, fontWeight: 500, fontFamily: tokens.sans,
          letterSpacing: -0.2,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          cursor: 'pointer',
        }}>
          {Icon.mail()}
          Continue with email
        </button>

        <div style={{
          marginTop: 8, textAlign: 'center', fontSize: 13, color: tokens.muted,
        }}>
          New here? <span onClick={() => onContinue && onContinue(role)} style={{ color: tokens.forest, fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}>Create an account</span>
        </div>

        <div style={{
          marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          fontSize: 11.5, color: tokens.muted, letterSpacing: 0.1,
        }}>
          {Icon.shield()}
          <span>{isPro ? 'PHIPA-compliant · Stored in Canada' : 'Stored in Canada · Encrypted at rest'}</span>
        </div>
      </div>
    </div>
  );
}

// ─── 2. ONBOARDING — ABOUT YOU + ABOUT YOUR PERSON ──────
function OnbField({ label, value, onChange, placeholder, optional, half, type = 'text' }) {
  return (
    <div style={{ flex: half ? 1 : undefined, minWidth: 0 }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        marginBottom: 7,
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: tokens.muted, letterSpacing: 0.5, textTransform: 'uppercase' }}>{label}</div>
        {optional && <div style={{ fontSize: 10.5, color: tokens.mutedSoft }}>Optional</div>}
      </div>
      <input
        value={value}
        type={type}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', boxSizing: 'border-box',
          height: 48, borderRadius: 13, border: `1px solid ${tokens.line}`,
          background: '#fff', padding: '0 14px',
          fontSize: 16, fontFamily: tokens.sans, color: tokens.ink,
          outline: 'none', letterSpacing: -0.2,
        }}
      />
    </div>
  );
}

function OnboardingHeader({ step, total, onBack, onSkip }) {
  return (
    <React.Fragment>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 24px 0',
      }}>
        <div onClick={onBack} style={{
          width: 36, height: 36, borderRadius: 12,
          background: '#fff', border: `1px solid ${tokens.line}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: onBack ? 'pointer' : 'default',
          opacity: onBack ? 1 : 0.4,
        }}>
          <svg width="8" height="14" viewBox="0 0 8 14"><path d="M7 1L1 7l6 6" stroke={tokens.ink} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <div style={{ fontSize: 12, color: tokens.muted, letterSpacing: 0.5, textTransform: 'uppercase' }}>
          Step {step} of {total}
        </div>
        {onSkip ? (
          <div onClick={onSkip} style={{
            height: 36, padding: '0 14px', borderRadius: 12,
            background: 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            fontSize: 13, color: tokens.muted, fontWeight: 500,
          }}>Skip</div>
        ) : <div style={{ width: 36 }} />}
      </div>
      <div style={{ padding: '14px 24px 0', display: 'flex', gap: 6 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 99,
            background: i < step ? tokens.forestDeep : tokens.line,
          }} />
        ))}
      </div>
    </React.Fragment>
  );
}

function OnboardingScreen({ onCreate, initialStep = 1 }) {
  const [step, setStep] = React.useState(initialStep); // 1 = about you, 2 = care recipient

  // About you
  const [you, setYou] = React.useState({ first: '', last: '', dob: '', address: '' });
  // Care recipient
  const [them, setThem] = React.useState({ first: '', last: '', dob: '', rel: 'Father', address: '', sameAddress: false });

  const rels = ['Mother', 'Father', 'Spouse', 'Child', 'Parent', 'Other'];

  if (step === 1) {
    const canContinue = you.first.trim().length > 0;
    return (
      <div style={{
        width: '100%', height: '100%', background: tokens.cream,
        fontFamily: tokens.sans, color: tokens.ink,
        display: 'flex', flexDirection: 'column', paddingTop: 64,
      }}>
        <OnboardingHeader step={1} total={2} />

        {/* heading */}
        <div style={{ padding: '32px 28px 0' }}>
          <div style={{
            fontFamily: tokens.serif, fontSize: 34, lineHeight: '38px',
            letterSpacing: -0.8, color: tokens.forestDeep, fontWeight: 400,
            textWrap: 'pretty',
          }}>
            First, a little<br />about you.
          </div>
          <div style={{
            marginTop: 10, fontSize: 13.5, lineHeight: '19px', color: tokens.muted,
            maxWidth: 310,
          }}>
            This stays private. Doctors and pharmacies sometimes need it when we share documents on your behalf.
          </div>
        </div>

        {/* form */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px 24px 12px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <OnbField half label="First name" value={you.first} onChange={(v) => setYou({ ...you, first: v })} placeholder="Priya" />
            <OnbField half label="Last name"  value={you.last}  onChange={(v) => setYou({ ...you, last: v })}  placeholder="Sharma" />
          </div>
          <OnbField label="Date of birth" value={you.dob} onChange={(v) => setYou({ ...you, dob: v })} placeholder="MM / DD / YYYY" />
          <OnbField label="Address" value={you.address} onChange={(v) => setYou({ ...you, address: v })} placeholder="Street, city, postal code" optional />
        </div>

        {/* CTA */}
        <div style={{ padding: '4px 24px 30px' }}>
          <button onClick={() => setStep(2)} disabled={!canContinue} style={{
            width: '100%', height: 52, borderRadius: 14, border: 'none',
            background: canContinue ? tokens.forestDeep : '#cdc5b6',
            color: '#fff',
            fontSize: 15.5, fontWeight: 500, fontFamily: tokens.sans,
            letterSpacing: -0.1, cursor: canContinue ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            Continue {Icon.arrow('#fff')}
          </button>
        </div>
      </div>
    );
  }

  // Step 2 — care recipient
  const canCreate = them.first.trim().length > 0;
  return (
    <div style={{
      width: '100%', height: '100%', background: tokens.cream,
      fontFamily: tokens.sans, color: tokens.ink,
      display: 'flex', flexDirection: 'column', paddingTop: 64,
    }}>
      <OnboardingHeader step={2} total={2} onBack={() => setStep(1)} onSkip={() => onCreate && onCreate({ skipped: true, you })} />

      {/* heading */}
      <div style={{ padding: '28px 28px 0' }}>
        <div style={{
          fontFamily: tokens.serif, fontSize: 32, lineHeight: '36px',
          letterSpacing: -0.7, color: tokens.forestDeep, fontWeight: 400,
          textWrap: 'pretty',
        }}>
          Who are you<br />caring for?
        </div>
        <div style={{
          marginTop: 10, fontSize: 13.5, lineHeight: '19px', color: tokens.muted,
          maxWidth: 310,
        }}>
          You can add more people, medications, and doctors at your own pace.
        </div>
      </div>

      {/* form */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px 12px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <OnbField half label="First name" value={them.first} onChange={(v) => setThem({ ...them, first: v })} placeholder="Arjun" />
          <OnbField half label="Last name"  value={them.last}  onChange={(v) => setThem({ ...them, last: v })}  placeholder="Sharma" />
        </div>
        <OnbField label="Date of birth" value={them.dob} onChange={(v) => setThem({ ...them, dob: v })} placeholder="MM / DD / YYYY" />

        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: tokens.muted, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 9 }}>Your relationship</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {rels.map((r) => {
              const active = r === them.rel;
              return (
                <button key={r} onClick={() => setThem({ ...them, rel: r })} style={{
                  height: 36, padding: '0 14px', borderRadius: 99,
                  border: `1px solid ${active ? tokens.forestDeep : tokens.line}`,
                  background: active ? tokens.forestDeep : '#fff',
                  color: active ? '#fff' : tokens.ink,
                  fontSize: 13.5, fontFamily: tokens.sans, fontWeight: 500,
                  letterSpacing: -0.1, cursor: 'pointer',
                }}>{r}</button>
              );
            })}
          </div>
        </div>

        <div>
          <div style={{
            display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
            marginBottom: 7,
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: tokens.muted, letterSpacing: 0.5, textTransform: 'uppercase' }}>Address</div>
            <div style={{ fontSize: 10.5, color: tokens.mutedSoft }}>Optional</div>
          </div>
          <input
            value={them.sameAddress ? (you.address || 'Same as yours') : them.address}
            onChange={(e) => setThem({ ...them, address: e.target.value, sameAddress: false })}
            placeholder="Street, city, postal code"
            style={{
              width: '100%', boxSizing: 'border-box',
              height: 48, borderRadius: 13, border: `1px solid ${tokens.line}`,
              background: '#fff', padding: '0 14px',
              fontSize: 16, fontFamily: tokens.sans, color: them.sameAddress ? tokens.muted : tokens.ink,
              outline: 'none', letterSpacing: -0.2,
            }}
          />
          {you.address && (
            <div onClick={() => setThem({ ...them, sameAddress: !them.sameAddress })} style={{
              marginTop: 9, display: 'flex', alignItems: 'center', gap: 8,
              cursor: 'pointer',
            }}>
              <div style={{
                width: 18, height: 18, borderRadius: 5,
                border: `1.5px solid ${them.sameAddress ? tokens.forestDeep : tokens.line}`,
                background: them.sameAddress ? tokens.forestDeep : '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {them.sameAddress && Icon.check('#fff')}
              </div>
              <span style={{ fontSize: 13, color: tokens.ink }}>Same as my address</span>
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '4px 24px 30px' }}>
        <button onClick={() => canCreate && onCreate && onCreate({ you, them })} disabled={!canCreate} style={{
          width: '100%', height: 52, borderRadius: 14, border: 'none',
          background: canCreate ? tokens.forestDeep : '#cdc5b6',
          color: '#fff',
          fontSize: 15.5, fontWeight: 500, fontFamily: tokens.sans,
          letterSpacing: -0.1, cursor: canCreate ? 'pointer' : 'not-allowed',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          Create profile {Icon.arrow('#fff')}
        </button>
        <div onClick={() => onCreate && onCreate({ skipped: true, you })} style={{
          marginTop: 12, textAlign: 'center', fontSize: 13,
          color: tokens.muted, cursor: 'pointer',
        }}>
          I'll add this later
        </div>
      </div>
    </div>
  );
}

// ─── 3. DASHBOARD ───────────────────────────────────────
function Dashboard({ variant = 'fresh', onAddPerson, tall = false }) {
  // variant: 'fresh' (day 1, single recipient, low completion) | 'established' (day 14, multi-recipient, vitals)
  const [activeIdx, setActiveIdx] = React.useState(0);

  const peopleFresh = [
    { name: 'Arjun', full: 'Arjun Sharma', rel: 'Father', age: 78, completion: 10, sections: ['medications', 'conditions', 'allergies', 'care team'], portrait: 'father · 78', tone: 'sage' },
  ];
  const peopleEst = [
    { name: 'Arjun', full: 'Arjun Sharma', rel: 'Father', age: 78, completion: 92, meds: 5, conditions: 3, alerts: 1, conditionList: ['Hypertension', 'Type 2 Diabetes', 'Atrial Fibrillation'], allergies: ['Penicillin', 'Sulfa'], portrait: 'father · 78', tone: 'sage',  sections: ['emergency contacts'] },
    { name: 'Indira', full: 'Indira Sharma', rel: 'Mother', age: 74, completion: 64, meds: 3, conditions: 1, alerts: 0, conditionList: ['Hypothyroidism'],                              allergies: ['Latex'],            portrait: 'mother · 74', tone: 'terra', sections: ['allergies', 'care team', 'emergency contacts'] },
  ];
  const people = variant === 'fresh' ? peopleFresh : peopleEst;
  const active = people[activeIdx];

  return (
    <div style={{
      width: '100%', minHeight: '100%', background: tokens.cream,
      fontFamily: tokens.sans, color: tokens.ink,
      display: 'flex', flexDirection: 'column', paddingTop: 56,
      position: 'relative',
    }}>
      {/* top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 24px 0',
      }}>
        <div>
          <div style={{ fontSize: 13, color: tokens.muted, letterSpacing: 0.1 }}>
            {variant === 'fresh' ? 'Welcome' : 'Saturday, May 9'}
          </div>
          <div style={{
            fontFamily: tokens.serif, fontSize: 26, lineHeight: '32px',
            letterSpacing: -0.6, color: tokens.forestDeep, fontWeight: 400,
            marginTop: 2,
          }}>
            Hello, Priya
          </div>
        </div>
        <div style={{
          width: 40, height: 40, borderRadius: 12, background: '#fff',
          border: `1px solid ${tokens.line}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}>
          {Icon.bell()}
          {variant === 'established' && (
            <div style={{
              position: 'absolute', top: 9, right: 10,
              width: 7, height: 7, borderRadius: 99, background: tokens.terracotta,
              border: '1.5px solid #fff',
            }} />
          )}
        </div>
      </div>

      {/* scroll body */}
      <div style={{
        flex: 1,
        overflow: tall ? 'visible' : 'auto',
        paddingBottom: tall ? 30 : 100,
      }}>
        {/* people switcher */}
        {people.length > 1 && (
          <div style={{ padding: '20px 24px 0', display: 'flex', gap: 8 }}>
            {people.map((p, i) => (
              <button key={i} onClick={() => setActiveIdx(i)} style={{
                height: 32, padding: '0 14px', borderRadius: 99,
                border: `1px solid ${i === activeIdx ? tokens.forestDeep : tokens.line}`,
                background: i === activeIdx ? tokens.forestDeep : '#fff',
                color: i === activeIdx ? '#fff' : tokens.ink,
                fontSize: 13, fontWeight: 500, fontFamily: tokens.sans,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              }}>
                {p.name}
                <span style={{ opacity: i === activeIdx ? 0.7 : 0.5, fontSize: 12 }}>· {p.rel}</span>
              </button>
            ))}
            <button onClick={onAddPerson} style={{
              height: 32, width: 32, borderRadius: 99,
              border: `1px dashed ${tokens.mutedSoft}`,
              background: 'transparent', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {Icon.plus(tokens.muted)}
            </button>
          </div>
        )}

        {/* care recipient hero card */}
        <div style={{ padding: '20px 20px 0' }}>
          <RecipientCard person={active} variant={variant} />
        </div>

        {/* completion prompt — shown until profile is 100% */}
        {active.completion < 100 && (
          <div style={{ padding: '14px 20px 0' }}>
            <CompletionPrompt person={active} />
          </div>
        )}

        {/* established — upcoming + activity feed */}
        {variant === 'established' && (
          <React.Fragment>
            <div style={{ padding: '22px 20px 0' }}>
              <SectionLabel title="Coming up" action="Calendar →" />
              <UpcomingStrip />
            </div>
            <div style={{ padding: '22px 20px 0' }}>
              <SectionLabel title="Activity" action="All →" />
              <ActivityFeed />
            </div>
          </React.Fragment>
        )}

        {/* fresh — vitals empty + log nudge */}
        {variant === 'fresh' && (
          <div style={{ padding: '22px 24px 0' }}>
            <SectionLabel title="Vitals" action="Log a reading" />
            <VitalsEmpty />
          </div>
        )}

        {/* documents row — fresh only */}
        {variant === 'fresh' && (
          <div style={{ padding: '22px 24px 0' }}>
            <SectionLabel title="Documents" action="Coming soon" />
            <DocumentsEmpty />
          </div>
        )}

        {/* add another person CTA — fresh */}
        {variant === 'fresh' && (
          <div style={{ padding: '22px 24px 0' }}>
            <button onClick={onAddPerson} style={{
              width: '100%', height: 56, borderRadius: 16,
              background: '#fff', border: `1px dashed ${tokens.mutedSoft}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontFamily: tokens.sans, fontSize: 14, color: tokens.muted, fontWeight: 500,
              cursor: 'pointer',
            }}>
              {Icon.plus(tokens.muted)} Add another person
            </button>
          </div>
        )}
      </div>

      {/* tab bar */}
      {!tall && <TabBar />}
    </div>
  );
}

function RecipientCard({ person, variant }) {
  const portraitTone = person.tone === 'terra';
  return (
    <div style={{
      borderRadius: 24, padding: 20,
      background: tokens.forestDeep, color: '#fff',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* faint ring decoration */}
      <svg width="180" height="180" viewBox="0 0 180 180" style={{ position: 'absolute', right: -50, top: -50, opacity: 0.08 }}>
        <circle cx="90" cy="90" r="85" stroke="#fff" strokeWidth="1" fill="none"/>
        <circle cx="90" cy="90" r="55" stroke="#fff" strokeWidth="1" fill="none"/>
        <circle cx="90" cy="90" r="25" stroke="#fff" strokeWidth="1" fill="none"/>
      </svg>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* portrait */}
        <div style={{
          width: 56, height: 56, borderRadius: 18, flexShrink: 0,
          background: portraitTone
            ? `repeating-linear-gradient(135deg, #C66E4E 0 6px, #B05E40 6px 12px)`
            : `repeating-linear-gradient(135deg, #A8B5A0 0 6px, #94A38D 6px 12px)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'ui-monospace, monospace', fontSize: 8, color: 'rgba(255,255,255,0.85)',
          letterSpacing: 0.3, textAlign: 'center',
          border: '1px solid rgba(255,255,255,0.15)',
        }}>{person.portrait}</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', letterSpacing: 0.4, textTransform: 'uppercase' }}>
            {person.rel} · {person.age}
          </div>
          <div style={{
            fontFamily: tokens.serif, fontSize: 24, lineHeight: '28px',
            letterSpacing: -0.4, fontWeight: 400, marginTop: 2, color: '#fff',
          }}>{person.full}</div>
        </div>
      </div>

      {/* stats row — established only */}
      {variant === 'established' && (
        <div style={{
          marginTop: 18, paddingTop: 16,
          borderTop: '1px solid rgba(255,255,255,0.12)',
          display: 'flex', flexDirection: 'column', gap: 14,
        }}>
          {/* medications */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'rgba(255,255,255,0.10)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{Icon.pill('rgba(255,255,255,0.85)')}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.55)', letterSpacing: 0.4, textTransform: 'uppercase' }}>Medications</div>
              <div style={{ fontFamily: tokens.serif, fontSize: 16, fontWeight: 400, color: '#fff', marginTop: 1, lineHeight: 1.1 }}>
                {person.meds} active
              </div>
            </div>
          </div>

          {/* conditions */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8, flexShrink: 0,
              background: 'rgba(255,255,255,0.10)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginTop: 2,
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 12s-5-3-5-7a2.8 2.8 0 015-1.7A2.8 2.8 0 0112 5c0 4-5 7-5 7z" stroke="rgba(255,255,255,0.85)" strokeWidth="1.4" strokeLinejoin="round"/>
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.55)', letterSpacing: 0.4, textTransform: 'uppercase' }}>Conditions</div>
              {person.conditionList && person.conditionList.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 4 }}>
                  {person.conditionList.map((c, i) => (
                    <span key={i} style={{
                      padding: '2px 7px', borderRadius: 99,
                      background: 'rgba(255,255,255,0.12)',
                      border: '1px solid rgba(255,255,255,0.18)',
                      fontSize: 10.5, color: '#fff', letterSpacing: 0.1, fontWeight: 500,
                    }}>{c}</span>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>None recorded</div>
              )}
            </div>
          </div>

          {/* allergies */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8, flexShrink: 0,
              background: person.allergies && person.allergies.length > 0 ? 'rgba(198,110,78,0.35)' : 'rgba(255,255,255,0.10)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginTop: 2,
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1l6 11H1L7 1z" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round"/>
                <rect x="6.4" y="5" width="1.2" height="4" fill="#fff"/>
                <circle cx="7" cy="10.5" r="0.7" fill="#fff"/>
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.55)', letterSpacing: 0.4, textTransform: 'uppercase' }}>Allergies</div>
              {person.allergies && person.allergies.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 4 }}>
                  {person.allergies.map((a, i) => (
                    <span key={i} style={{
                      padding: '2px 7px', borderRadius: 99,
                      background: 'rgba(255,255,255,0.12)',
                      border: '1px solid rgba(255,255,255,0.18)',
                      fontSize: 10.5, color: '#fff', letterSpacing: 0.1, fontWeight: 500,
                    }}>{a}</span>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>None recorded</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProgressRing({ pct, size = 44, stroke = 4 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct / 100);
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.15)" strokeWidth={stroke} fill="none" />
      <circle cx={size / 2} cy={size / 2} r={r} stroke={pct > 80 ? tokens.sageSoft : tokens.terracottaSoft} strokeWidth={stroke} fill="none"
        strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" />
    </svg>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div>
      <div style={{
        fontFamily: tokens.serif, fontSize: 18, fontWeight: 400, lineHeight: '20px',
        color: accent ? tokens.terracottaSoft : '#fff',
      }}>{value}</div>
      <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.55)', letterSpacing: 0.3, textTransform: 'uppercase', marginTop: 2 }}>{label}</div>
    </div>
  );
}

function CompletionPrompt({ person }) {
  const sections = person.sections || [];
  const almostDone = person.completion >= 80;
  return (
    <div style={{
      borderRadius: 20, padding: 14,
      background: tokens.terracottaSoft,
      display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: tokens.terracotta,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, position: 'relative',
      }}>
        {/* progress ring */}
        <svg width="44" height="44" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
          <circle cx="22" cy="22" r="18" fill="none"
            stroke="#fff" strokeOpacity="0.3" strokeWidth="3" />
          <circle cx="22" cy="22" r="18" fill="none"
            stroke="#fff" strokeWidth="3" strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 18}
            strokeDashoffset={2 * Math.PI * 18 * (1 - person.completion / 100)} />
        </svg>
        <span style={{
          fontFamily: tokens.serif, fontSize: 12, fontWeight: 600,
          color: '#fff', position: 'relative', letterSpacing: -0.2,
        }}>{person.completion}%</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: tokens.forestDeep, letterSpacing: -0.1 }}>
          {almostDone ? `Almost there — finish ${person.name}'s profile` : `Complete ${person.name}'s profile`}
        </div>
        <div style={{ fontSize: 11.5, color: '#5d3a2c', marginTop: 2, lineHeight: '15px' }}>
          {sections.length > 0
            ? `${sections.length} section${sections.length > 1 ? 's' : ''} left — ${sections.slice(0, 3).join(', ')}${sections.length > 3 ? '…' : ''}`
            : 'A few details left to add.'}
        </div>
      </div>
      <div style={{ flexShrink: 0 }}>{Icon.arrow(tokens.forestDeep)}</div>
    </div>
  );
}

function SectionLabel({ title, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
      <div style={{ fontFamily: tokens.serif, fontSize: 18, color: tokens.forestDeep, fontWeight: 500, letterSpacing: -0.3 }}>{title}</div>
      <div style={{ fontSize: 12, color: tokens.muted, letterSpacing: 0.1 }}>{action}</div>
    </div>
  );
}

function VitalsEmpty() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      {[
        { i: Icon.pulse(tokens.terracotta), label: 'Blood pressure', sub: 'Tap to log' },
        { i: Icon.drop(tokens.terracotta), label: 'Blood sugar', sub: 'Tap to log' },
        { i: Icon.heart(tokens.terracotta), label: 'Heart rate', sub: 'Tap to log' },
        { i: Icon.scale(tokens.terracotta), label: 'Weight', sub: 'Tap to log' },
      ].map((v, i) => (
        <div key={i} style={{
          background: '#fff', border: `1px solid ${tokens.line}`,
          borderRadius: 16, padding: '14px 14px',
          display: 'flex', flexDirection: 'column', gap: 14,
          minHeight: 90,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: tokens.terracottaSoft,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{v.i}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: tokens.ink, letterSpacing: -0.1 }}>{v.label}</div>
            <div style={{ fontSize: 11, color: tokens.muted, marginTop: 2 }}>{v.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Upcoming strip (horizontal cards) ──────────────────
const upcoming = [
  { kind: 'visit', day: 'TODAY',    time: '4:30 PM', what: 'Cardiology · Dr. Mei Chen',     where: 'St. Michael\'s · Rm 412', soon: true },
  { kind: 'lab',   day: 'TUE · MAY 19', time: '7:30 AM', what: 'INR + lipid panel',         where: 'LifeLabs · Yonge & Eg · fasting' },
  { kind: 'tele',  day: 'MON · MAY 25', time: '2:00 PM', what: 'Dr. Patel · family physician', where: 'Telehealth call' },
  { kind: 'lab',   day: 'THU · MAY 28', time: '9:00 AM', what: 'HbA1c · quarterly',         where: 'LifeLabs' },
];

function UpKindIcon({ kind, color }) {
  if (kind === 'lab') return (<svg width="14" height="16" viewBox="0 0 14 16" fill="none"><path d="M5 1v5L1 14a1 1 0 001 1h10a1 1 0 001-1L9 6V1" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 1h6" stroke={color} strokeWidth="1.5" strokeLinecap="round"/></svg>);
  if (kind === 'tele') return (<svg width="16" height="12" viewBox="0 0 16 12" fill="none"><rect x="1" y="1" width="10" height="10" rx="2" stroke={color} strokeWidth="1.5"/><path d="M11 4l4-2v8l-4-2" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/></svg>);
  return (<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 2v4a3 3 0 003 3 3 3 0 003-3V2" stroke={color} strokeWidth="1.5" strokeLinecap="round"/><path d="M6 9v2a3 3 0 003 3h1a3 3 0 003-3v-1" stroke={color} strokeWidth="1.5" strokeLinecap="round"/><circle cx="13" cy="7" r="1.5" stroke={color} strokeWidth="1.5"/></svg>);
}

function UpcomingStrip() {
  return (
    <div style={{
      display: 'flex', gap: 10, overflowX: 'auto', margin: '0 -20px', padding: '0 20px',
      scrollSnapType: 'x mandatory',
    }}>
      {upcoming.map((u, i) => {
        const isSoon = u.soon;
        const tint =
          u.kind === 'lab'  ? { bg: '#F5E4C9', icon: '#C7973A' } :
          u.kind === 'tele' ? { bg: tokens.sageSoft, icon: tokens.forest } :
                              { bg: tokens.terracottaSoft, icon: tokens.terracotta };
        return (
          <div key={i} style={{
            flexShrink: 0, width: 232, scrollSnapAlign: 'start',
            background: isSoon ? tokens.forestDeep : '#fff',
            color: isSoon ? '#fff' : tokens.ink,
            border: isSoon ? 'none' : `1px solid ${tokens.line}`,
            borderRadius: 18, padding: 14,
            display: 'flex', flexDirection: 'column', gap: 10,
            minHeight: 122,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{
                fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
                color: isSoon ? 'rgba(255,255,255,0.85)' : tokens.muted,
              }}>{u.day}</div>
              <div style={{
                width: 28, height: 28, borderRadius: 9,
                background: isSoon ? 'rgba(255,255,255,0.12)' : tint.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <UpKindIcon kind={u.kind} color={isSoon ? '#fff' : tint.icon} />
              </div>
            </div>
            <div style={{
              fontFamily: tokens.serif, fontSize: 17, lineHeight: '21px',
              fontWeight: 500, letterSpacing: -0.3,
              color: isSoon ? '#fff' : tokens.forestDeep,
              textWrap: 'pretty',
            }}>{u.what}</div>
            <div style={{ flex: 1 }} />
            <div style={{
              fontSize: 11.5, lineHeight: '15px',
              color: isSoon ? 'rgba(255,255,255,0.7)' : tokens.muted,
            }}>
              <span style={{ fontWeight: 600 }}>{u.time}</span> · {u.where}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Activity feed (grouped Today / Yesterday / Earlier) ─
const activity = [
  {
    bucket: 'Today',
    items: [
      { type: 'med',   t: '8:00 AM',  title: 'Metformin · 500 mg',  note: 'With breakfast', done: true,  by: { name: 'Anika', role: 'Caregiver', tone: '#C66E4E' } },
      { type: 'med',   t: '8:00 AM',  title: 'Ramipril · 5 mg',     note: 'Morning dose',   done: true,  by: { name: 'Anika', role: 'Caregiver', tone: '#C66E4E' } },
      { type: 'med',   t: '8:00 AM',  title: 'Aspirin · 81 mg',     note: 'With food',      done: true,  by: { name: 'Anika', role: 'Caregiver', tone: '#C66E4E' } },
      { type: 'vital', t: '9:15 AM',  title: 'Blood pressure',      note: '152 / 96 mmHg · flagged high', done: true, flagged: true, by: { name: 'Anika', role: 'Caregiver', tone: '#C66E4E' } },
      { type: 'note',  t: '10:20 AM', title: 'Anika added a note',  note: '"Walked to the porch and back. A little short of breath."', done: true, by: { name: 'Anika', role: 'Caregiver', tone: '#C66E4E' } },
      { type: 'vital', t: '12:30 PM', title: 'Blood sugar',         note: '7.1 mmol/L · post-meal',       done: true, by: { name: 'Anika', role: 'Caregiver', tone: '#C66E4E' } },
      { type: 'med',   t: '7:00 PM',  title: 'Metformin · 500 mg',  note: 'With dinner',    done: false, due: 'Due in 2h' },
      { type: 'vital', t: '8:00 PM',  title: 'Blood sugar',         note: 'Evening reading', done: false, due: 'Due tonight' },
      { type: 'med',   t: '8:00 PM',  title: 'Warfarin · 3 mg',     note: 'Evening',        done: false, due: 'Due tonight' },
      { type: 'med',   t: '9:00 PM',  title: 'Atorvastatin · 20 mg', note: 'Evening',       done: false, due: 'Due tonight' },
    ],
  },
  {
    bucket: 'Yesterday',
    items: [
      { type: 'med',   t: '8:00 AM',  title: 'Metformin · 500 mg',  note: 'Breakfast dose', done: true,  by: { name: 'You',   role: 'Family',    tone: '#1F3D38' } },
      { type: 'med',   t: '8:00 AM',  title: 'Ramipril · 5 mg',     note: 'Morning dose',   done: true,  by: { name: 'You',   role: 'Family',    tone: '#1F3D38' } },
      { type: 'vital', t: '9:00 AM',  title: 'Blood pressure',      note: '134 / 84 mmHg',  done: true,  by: { name: 'You',   role: 'Family',    tone: '#1F3D38' } },
      { type: 'med',   t: '1:00 PM',  title: 'Metformin · 500 mg',  note: 'Lunch dose',     done: true,  by: { name: 'Anika', role: 'Caregiver', tone: '#C66E4E' } },
      { type: 'vital', t: '6:30 PM',  title: 'Blood pressure',      note: '128 / 82 mmHg',  done: true,  by: { name: 'Anika', role: 'Caregiver', tone: '#C66E4E' } },
      { type: 'note',  t: '7:10 PM',  title: 'Anika left a note',   note: '"Walked 15 min after dinner, felt steady."', done: true, by: { name: 'Anika', role: 'Caregiver', tone: '#C66E4E' } },
      { type: 'med',   t: '9:00 PM',  title: 'Warfarin · 3 mg',     note: 'Evening',        done: true,  by: { name: 'Anika', role: 'Caregiver', tone: '#C66E4E' } },
      { type: 'med',   t: '9:00 PM',  title: 'Atorvastatin · 20 mg', note: 'Evening',       done: true,  by: { name: 'Anika', role: 'Caregiver', tone: '#C66E4E' } },
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
      { type: 'doc',   t: '2:15 PM',  title: 'Prescription added',  note: 'Atorvastatin 20 mg · Dr. Chen',    done: true,  by: { name: 'You',   role: 'Family',    tone: '#1F3D38' } },
      { type: 'vital', t: '7:00 PM',  title: 'Blood pressure',      note: '142 / 90 mmHg · flagged high',     done: true, flagged: true, by: { name: 'Anika', role: 'Caregiver', tone: '#C66E4E' } },
    ],
  },
];

function ActIcon({ type, color }) {
  if (type === 'med')   return Icon.pill(color);
  if (type === 'vital') return Icon.pulse(color);
  if (type === 'note')  return (<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2h10v8l-3 3H2V2z" stroke={color} strokeWidth="1.4" strokeLinejoin="round"/><path d="M9 13v-3h3" stroke={color} strokeWidth="1.4" strokeLinejoin="round"/></svg>);
  if (type === 'doc')   return Icon.doc(color);
  return Icon.check(color);
}

function ActivityRow({ item, isLast }) {
  const done = item.done;
  const flagged = item.flagged;
  const iconBg = flagged ? '#FBE3D9' : done ? tokens.sageSoft : tokens.cream;
  const iconColor = flagged ? tokens.terracotta : done ? tokens.forest : tokens.muted;
  return (
    <div style={{
      display: 'flex', gap: 12, padding: '12px 14px',
      borderBottom: isLast ? 'none' : `1px solid ${tokens.lineSoft}`,
      alignItems: 'flex-start',
    }}>
      {/* type icon */}
      <div style={{
        width: 32, height: 32, borderRadius: 10, flexShrink: 0,
        background: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginTop: 1,
      }}>
        <ActIcon type={item.type} color={iconColor} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8,
        }}>
          <div style={{
            fontSize: 13.5, fontWeight: 600, color: tokens.ink, letterSpacing: -0.1,
            opacity: done ? 0.95 : 1,
          }}>{item.title}</div>
          <div style={{
            fontSize: 10.5, color: tokens.mutedSoft,
            fontFamily: 'ui-monospace, monospace', letterSpacing: 0.2, flexShrink: 0,
          }}>{item.t}</div>
        </div>
        <div style={{
          marginTop: 2, fontSize: 11.5, color: flagged ? tokens.terracotta : tokens.muted,
          lineHeight: '15px',
        }}>{item.note}</div>
        {/* footer: who, or due */}
        <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
          {done && item.by ? (
            <React.Fragment>
              <div style={{
                width: 18, height: 18, borderRadius: 99,
                background: item.by.tone, color: '#fff',
                fontFamily: tokens.serif, fontSize: 9, fontWeight: 500,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{item.by.name[0]}</div>
              <div style={{ fontSize: 10.5, color: tokens.muted }}>
                <span style={{ fontWeight: 600, color: tokens.ink }}>{item.by.name}</span>
                <span style={{ color: tokens.mutedSoft }}> · {item.by.role}</span>
              </div>
            </React.Fragment>
          ) : (
            <div style={{
              padding: '2px 7px', borderRadius: 99,
              background: tokens.cream, border: `1px solid ${tokens.line}`,
              fontSize: 10, color: tokens.muted, fontWeight: 600, letterSpacing: 0.2,
            }}>{item.due || 'Pending'}</div>
          )}
        </div>
      </div>
      {/* status check */}
      <div style={{
        width: 22, height: 22, borderRadius: 99, flexShrink: 0,
        border: `1.5px solid ${done ? tokens.forest : tokens.line}`,
        background: done ? tokens.forest : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginTop: 4,
      }}>
        {done && Icon.check('#fff')}
      </div>
    </div>
  );
}

function ActivityFeed() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {activity.map((group, gi) => (
        <div key={gi}>
          <div style={{
            display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
            padding: '0 4px 8px',
          }}>
            <div style={{
              fontSize: 11, fontWeight: 700, color: tokens.muted,
              letterSpacing: 0.6, textTransform: 'uppercase',
            }}>{group.bucket}</div>
            <div style={{
              fontSize: 10.5, color: tokens.mutedSoft,
              fontFamily: 'ui-monospace, monospace',
            }}>
              {group.items.filter(i => i.done).length}/{group.items.length} done
            </div>
          </div>
          <div style={{
            background: '#fff', borderRadius: 16, border: `1px solid ${tokens.line}`,
            overflow: 'hidden',
          }}>
            {group.items.map((it, i) => (
              <ActivityRow key={i} item={it} isLast={i === group.items.length - 1} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function VitalsGrid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      <VitalCard label="Blood pressure" big="128/82" sub="mmHg" trend={[120, 124, 119, 130, 126, 128, 122]} status="normal" />
      <VitalCard label="Blood sugar" big="6.2" sub="mmol/L · fasting" trend={[5.8, 6.1, 6.4, 6.0, 6.2, 6.5, 6.2]} status="normal" />
      <VitalCard label="Heart rate" big="74" sub="bpm · resting" trend={[72, 75, 78, 70, 74, 76, 74]} status="normal" />
      <VitalCard label="Weight" big="71.2" sub="kg" trend={[71.8, 71.6, 71.4, 71.5, 71.3, 71.2, 71.2]} status="watch" />
    </div>
  );
}

function VitalCard({ label, big, sub, trend, status }) {
  const min = Math.min(...trend);
  const max = Math.max(...trend);
  const w = 100, h = 28;
  const pts = trend.map((v, i) => {
    const x = (i / (trend.length - 1)) * w;
    const y = h - ((v - min) / Math.max(0.01, max - min)) * h;
    return `${x},${y}`;
  }).join(' ');
  const dotColor = status === 'normal' ? tokens.sage : tokens.terracotta;
  return (
    <div style={{
      background: '#fff', border: `1px solid ${tokens.line}`,
      borderRadius: 16, padding: 14,
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      minHeight: 110,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 11, color: tokens.muted, letterSpacing: 0.3, textTransform: 'uppercase' }}>{label}</div>
        <div style={{ width: 6, height: 6, borderRadius: 99, background: dotColor }} />
      </div>
      <div style={{ marginTop: 4 }}>
        <span style={{ fontFamily: tokens.serif, fontSize: 24, fontWeight: 500, color: tokens.forestDeep, letterSpacing: -0.4 }}>{big}</span>
        <span style={{ fontSize: 11, color: tokens.muted, marginLeft: 4 }}>{sub}</span>
      </div>
      <svg width={w} height={h} style={{ marginTop: 4 }}>
        <polyline points={pts} stroke={tokens.forest} strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

function MedsList() {
  const meds = [
    { name: 'Atorvastatin', dose: '20 mg · evening', taken: true },
    { name: 'Metformin', dose: '500 mg · with breakfast', taken: true },
    { name: 'Ramipril', dose: '5 mg · morning', taken: true },
    { name: 'Aspirin', dose: '81 mg · morning', taken: false },
    { name: 'Vitamin D', dose: '1000 IU · with dinner', taken: false },
  ];
  return (
    <div style={{
      background: '#fff', borderRadius: 18, border: `1px solid ${tokens.line}`,
      overflow: 'hidden',
    }}>
      {meds.map((m, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '14px 16px',
          borderBottom: i < meds.length - 1 ? `1px solid ${tokens.lineSoft}` : 'none',
        }}>
          <div style={{
            width: 24, height: 24, borderRadius: 99,
            border: `1.5px solid ${m.taken ? tokens.forest : tokens.line}`,
            background: m.taken ? tokens.forest : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            {m.taken && Icon.check('#fff')}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 14, fontWeight: 500, color: tokens.ink, letterSpacing: -0.1,
              textDecoration: m.taken ? 'none' : 'none',
              opacity: m.taken ? 0.55 : 1,
            }}>{m.name}</div>
            <div style={{ fontSize: 12, color: tokens.muted, marginTop: 1 }}>{m.dose}</div>
          </div>
          {Icon.chevronRight()}
        </div>
      ))}
    </div>
  );
}

function DocumentsEmpty() {
  return (
    <div style={{
      borderRadius: 16, padding: 18,
      background: '#fff', border: `1px dashed ${tokens.line}`,
      display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, background: tokens.sageSoft,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{Icon.doc(tokens.forest)}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: tokens.ink }}>Snap a prescription, lab, or letter</div>
        <div style={{ fontSize: 11, color: tokens.muted, marginTop: 2, lineHeight: '15px' }}>We'll read it and pre-fill the right fields. Available next month.</div>
      </div>
    </div>
  );
}

function TabBar() {
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      paddingBottom: 24, paddingTop: 10,
      background: 'linear-gradient(to top, ' + tokens.cream + ' 60%, rgba(246,241,234,0))',
    }}>
      <div style={{
        margin: '0 16px', height: 60, borderRadius: 22,
        background: '#fff', border: `1px solid ${tokens.line}`,
        boxShadow: '0 6px 24px rgba(31,61,56,0.06)',
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr',
        alignItems: 'center',
      }}>
        <TabItem icon={Icon.home(tokens.forestDeep)} active label="Home" />
        <TabItem icon={Icon.people()} label="People" />
        <TabItem icon={Icon.doc(tokens.muted)} label="Care" />
        <TabItem icon={Icon.user()} label="You" />
      </div>
    </div>
  );
}

function TabItem({ icon, label, active }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
      color: active ? tokens.forestDeep : tokens.muted,
    }}>
      <div>{icon}</div>
      <div style={{ fontSize: 10, fontWeight: active ? 600 : 500, letterSpacing: 0.2 }}>{label}</div>
    </div>
  );
}

// ─── Interactive flow wrapper ────────────────────────────
function Flow({ start = 'login' }) {
  const [step, setStep] = React.useState(start);
  const screen = (() => {
    if (step === 'login') return <LoginScreen onContinue={() => setStep('onboarding')} />;
    if (step === 'onboarding') return <OnboardingScreen onCreate={() => setStep('dashboard')} />;
    return <Dashboard variant="fresh" onAddPerson={() => setStep('onboarding')} />;
  })();
  return screen;
}

Object.assign(window, {
  LoginScreen, OnboardingScreen, Dashboard, Flow, tokens, RecipientCard,
});
