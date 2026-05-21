// CareCircle — Log a vital reading
// One screen, vital-type picker → tailored numeric input → context (notes, taken with).

const lr = window.tokens;

const LRI = {
  back: (c = lr.ink) => (<svg width="9" height="16" viewBox="0 0 9 16"><path d="M8 1L1 8l7 7" stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  pulse: (c = '#fff') => (<svg width="18" height="14" viewBox="0 0 18 14" fill="none"><path d="M1 7h3l2-6 4 12 2-6h5" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  drop:  (c = '#fff') => (<svg width="14" height="18" viewBox="0 0 14 18" fill="none"><path d="M7 1c0 5-6 6-6 10.5a6 6 0 0012 0C13 7 7 6 7 1z" stroke={c} strokeWidth="1.6" strokeLinejoin="round"/></svg>),
  heart: (c = '#fff') => (<svg width="16" height="14" viewBox="0 0 16 14" fill="none"><path d="M8 13S1 9 1 5a3 3 0 016-1 3 3 0 016 1c0 4-7 8-7 8z" stroke={c} strokeWidth="1.6" strokeLinejoin="round"/></svg>),
  scale: (c = '#fff') => (<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="14" height="14" rx="3" stroke={c} strokeWidth="1.5"/><path d="M5 6l3-3 3 3" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  lung:  (c = '#fff') => (<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1v6m0 0c-1.5-2-4-2-5 0-1 2 0 6 2 7 2 .5 3-1 3-3m0-4c1.5-2 4-2 5 0 1 2 0 6-2 7-2 .5-3-1-3-3" stroke={c} strokeWidth="1.5" strokeLinejoin="round"/></svg>),
  thermo:(c = '#fff') => (<svg width="10" height="18" viewBox="0 0 10 18" fill="none"><path d="M5 1v11a2 2 0 102 0V1a1 1 0 10-2 0z" stroke={c} strokeWidth="1.5" strokeLinejoin="round"/></svg>),
  caret: (c = lr.muted) => (<svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  check: (c = '#fff') => (<svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1 4.5l3 3 6-6" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>),
};

// vital meta — defines range, units, glyph
const vitalKinds = {
  bp:        { label: 'Blood pressure', short: 'BP',   unit: 'mmHg',          icon: LRI.pulse, tone: '#C66E4E', ranges: { low: 90, high: 140 } },
  sugar:     { label: 'Blood sugar',    short: 'BG',   unit: 'mmol/L',        icon: LRI.drop,  tone: '#3F5D54', ranges: { low: 4,  high: 7.8 } },
  hr:        { label: 'Heart rate',     short: 'HR',   unit: 'bpm',           icon: LRI.heart, tone: '#7A5A3F', ranges: { low: 50, high: 100 } },
  weight:    { label: 'Weight',         short: 'Wt',   unit: 'kg',            icon: LRI.scale, tone: '#A8B5A0' },
  spo2:      { label: 'SpO₂',           short: 'SpO₂', unit: '%',             icon: LRI.lung,  tone: '#3F5D54', ranges: { low: 94, high: 100 } },
  temp:      { label: 'Temperature',    short: 'T°',   unit: '°C',            icon: LRI.thermo,tone: '#C66E4E', ranges: { low: 36, high: 37.5 } },
};

// ─── Field bits ────────────────────────────────────────
function LRLabel({ label, optional }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
      marginBottom: 8,
    }}>
      <div style={{
        fontSize: 11, fontWeight: 700, color: lr.muted,
        letterSpacing: 0.5, textTransform: 'uppercase',
      }}>{label}</div>
      {optional && <div style={{ fontSize: 10.5, color: lr.mutedSoft }}>Optional</div>}
    </div>
  );
}

function LRSelect({ value, placeholder, onClick }) {
  return (
    <div onClick={onClick} style={{
      height: 50, borderRadius: 13, background: '#fff',
      border: `1px solid ${lr.line}`, padding: '0 14px',
      display: 'flex', alignItems: 'center', cursor: 'pointer',
    }}>
      <span style={{
        flex: 1, fontSize: 15, color: value ? lr.ink : lr.mutedSoft,
        letterSpacing: -0.15,
      }}>{value || placeholder}</span>
      {LRI.caret()}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────
function LogReadingPage({ onBack, onSave, person, initialKind = 'bp' }) {
  const [kind, setKind] = React.useState(initialKind);
  const meta = vitalKinds[kind];

  // Multi-field state — BP uses sys/dia, others use a single value
  const [sys, setSys] = React.useState('');
  const [dia, setDia] = React.useState('');
  const [value, setValue] = React.useState('');

  // Context
  const [when, setWhen] = React.useState('now'); // now | morning | afternoon | evening | custom
  const [context, setContext] = React.useState('seated'); // depends on kind
  const [note, setNote] = React.useState('');

  // Reset values when kind changes
  React.useEffect(() => {
    setSys(''); setDia(''); setValue('');
    setContext(defaultContextFor(kind));
  }, [kind]);

  const contextOptions = contextOptionsFor(kind);
  const isBP = kind === 'bp';
  const isSugar = kind === 'sugar';

  // Flag detection
  const numeric = isBP
    ? (parseFloat(sys) || 0)
    : (parseFloat(value) || 0);
  const flag = (() => {
    if (!meta.ranges) return null;
    if (isBP) {
      if (!sys || !dia) return null;
      const s = parseFloat(sys), d = parseFloat(dia);
      if (s >= 140 || d >= 90) return 'high';
      if (s < 90 || d < 60)    return 'low';
      return 'normal';
    }
    if (!value) return null;
    if (numeric > meta.ranges.high) return 'high';
    if (numeric < meta.ranges.low)  return 'low';
    return 'normal';
  })();

  const canSave = isBP ? (sys.length && dia.length) : value.length > 0;

  return (
    <div style={{
      width: '100%', height: '100%', background: lr.cream,
      fontFamily: lr.sans, color: lr.ink,
      display: 'flex', flexDirection: 'column', paddingTop: 56, position: 'relative',
    }}>
      {/* top bar */}
      <div style={{
        padding: '14px 20px 0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div onClick={onBack} style={{
          width: 36, height: 36, borderRadius: 12,
          background: '#fff', border: `1px solid ${lr.line}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>{LRI.back()}</div>
        <div style={{
          fontFamily: lr.serif, fontSize: 16, color: lr.forestDeep,
          fontWeight: 500, letterSpacing: -0.2,
        }}>Log reading</div>
        <div onClick={onBack} style={{
          height: 36, padding: '0 12px', borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontSize: 13, color: lr.muted, fontWeight: 500,
        }}>Cancel</div>
      </div>

      {/* hero */}
      <div style={{ padding: '20px 24px 0' }}>
        <div style={{ fontSize: 11, color: lr.muted, letterSpacing: 0.4, textTransform: 'uppercase', fontWeight: 600 }}>
          {person || 'Care recipient'} · just now
        </div>
        <div style={{
          marginTop: 4, fontFamily: lr.serif, fontSize: 26, lineHeight: '30px',
          letterSpacing: -0.6, color: lr.forestDeep, fontWeight: 400,
        }}>How are the numbers today?</div>
      </div>

      {/* vital kind picker */}
      <div style={{
        marginTop: 18, display: 'flex', gap: 8, padding: '0 20px',
        overflowX: 'auto',
      }}>
        {Object.entries(vitalKinds).map(([k, v]) => {
          const active = kind === k;
          return (
            <button key={k} onClick={() => setKind(k)} style={{
              flexShrink: 0,
              padding: '10px 14px 10px 8px', borderRadius: 14, cursor: 'pointer',
              background: active ? lr.forestDeep : '#fff',
              border: active ? 'none' : `1px solid ${lr.line}`,
              color: active ? '#fff' : lr.ink,
              display: 'flex', alignItems: 'center', gap: 8,
              fontFamily: lr.sans, fontSize: 13, fontWeight: 600, letterSpacing: -0.1,
            }}>
              <span style={{
                width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                background: v.tone, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{v.icon('#fff')}</span>
              <span>{v.label}</span>
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '22px 20px 130px' }}>
        {/* Big numeric input area */}
        <div style={{
          background: '#fff', borderRadius: 20, border: `1px solid ${lr.line}`,
          padding: '18px 16px',
        }}>
          <div style={{
            display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
            marginBottom: 14,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                width: 22, height: 22, borderRadius: 6,
                background: meta.tone, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{meta.icon('#fff')}</span>
              <span style={{
                fontSize: 13.5, fontWeight: 600, color: lr.ink, letterSpacing: -0.1,
              }}>{meta.label}</span>
            </div>
            <FlagPill flag={flag} />
          </div>

          {isBP ? (
            <div style={{
              display: 'flex', alignItems: 'baseline', justifyContent: 'center',
              gap: 8, padding: '10px 0',
            }}>
              <BigNumberInput value={sys} onChange={setSys} placeholder="—" max={3} />
              <span style={{ fontFamily: lr.serif, fontSize: 46, color: lr.mutedSoft, fontWeight: 300, lineHeight: 1 }}>/</span>
              <BigNumberInput value={dia} onChange={setDia} placeholder="—" max={3} />
              <span style={{ fontSize: 12, color: lr.muted, marginLeft: 6, alignSelf: 'flex-end', paddingBottom: 12 }}>{meta.unit}</span>
            </div>
          ) : (
            <div style={{
              display: 'flex', alignItems: 'baseline', justifyContent: 'center',
              gap: 8, padding: '10px 0',
            }}>
              <BigNumberInput value={value} onChange={setValue} placeholder="—" max={5} decimal />
              <span style={{ fontSize: 14, color: lr.muted, marginLeft: 4, alignSelf: 'flex-end', paddingBottom: 12 }}>{meta.unit}</span>
            </div>
          )}

          {/* helper */}
          {meta.ranges && (
            <div style={{
              marginTop: 10, paddingTop: 10, borderTop: `1px solid ${lr.lineSoft}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              fontSize: 11, color: lr.mutedSoft, letterSpacing: 0.2,
            }}>
              Typical range {meta.ranges.low}–{meta.ranges.high} {meta.unit}
            </div>
          )}
        </div>

        {/* When */}
        <div style={{ marginTop: 22 }}>
          <LRLabel label="When" />
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {[
              { k: 'now',       l: 'Just now' },
              { k: 'morning',   l: 'This morning' },
              { k: 'afternoon', l: 'This afternoon' },
              { k: 'evening',   l: 'This evening' },
              { k: 'custom',    l: 'Pick time…' },
            ].map(o => {
              const active = when === o.k;
              return (
                <button key={o.k} onClick={() => setWhen(o.k)} style={{
                  height: 36, padding: '0 14px', borderRadius: 99, cursor: 'pointer',
                  border: active ? 'none' : `1px solid ${lr.line}`,
                  background: active ? lr.forestDeep : '#fff',
                  color: active ? '#fff' : lr.ink,
                  fontFamily: lr.sans, fontSize: 12.5, fontWeight: 600, letterSpacing: -0.1,
                }}>{o.l}</button>
              );
            })}
          </div>
        </div>

        {/* Context — depends on vital */}
        {contextOptions.length > 0 && (
          <div style={{ marginTop: 22 }}>
            <LRLabel label={contextLabel(kind)} optional />
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
              {contextOptions.map(o => {
                const active = context === o.k;
                return (
                  <button key={o.k} onClick={() => setContext(o.k)} style={{
                    height: 36, padding: '0 14px', borderRadius: 99, cursor: 'pointer',
                    border: active ? 'none' : `1px solid ${lr.line}`,
                    background: active ? lr.sageSoft : '#fff',
                    color: active ? '#2E4942' : lr.ink,
                    fontFamily: lr.sans, fontSize: 12.5, fontWeight: 600, letterSpacing: -0.1,
                  }}>{o.l}</button>
                );
              })}
            </div>
          </div>
        )}

        {/* Note */}
        <div style={{ marginTop: 22 }}>
          <LRLabel label="Note" optional />
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. measured after a walk, felt a little dizzy…"
            rows={3}
            style={{
              width: '100%', boxSizing: 'border-box',
              borderRadius: 13, border: `1px solid ${lr.line}`,
              background: '#fff', padding: '12px 14px',
              fontFamily: lr.sans, fontSize: 14, color: lr.ink,
              resize: 'none', outline: 'none', letterSpacing: -0.1,
            }}
          />
        </div>

        {/* Privacy note */}
        <div style={{
          marginTop: 18, padding: '10px 14px', borderRadius: 12,
          background: lr.sageSoft, display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <div style={{
            width: 22, height: 22, borderRadius: 99, background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>{LRI.check(lr.forest)}</div>
          <div style={{ fontSize: 11.5, color: '#2E4942', lineHeight: '15px' }}>
            Out-of-range readings show as flagged on the dashboard and trigger a check-in nudge.
          </div>
        </div>
      </div>

      {/* sticky save */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '14px 20px 26px',
        background: `linear-gradient(to top, ${lr.cream} 60%, rgba(246,241,234,0))`,
      }}>
        <button
          onClick={() => canSave && onSave && onSave({ kind, sys, dia, value, when, context, note, flag })}
          disabled={!canSave}
          style={{
            width: '100%', height: 54, borderRadius: 16, border: 'none',
            background: canSave ? lr.forestDeep : '#cdc5b6',
            color: '#fff', cursor: canSave ? 'pointer' : 'not-allowed',
            fontFamily: lr.sans, fontSize: 15.5, fontWeight: 600, letterSpacing: -0.1,
          }}>
          Save reading
        </button>
      </div>
    </div>
  );
}

function BigNumberInput({ value, onChange, placeholder, max = 3, decimal }) {
  return (
    <input
      type="text" inputMode={decimal ? 'decimal' : 'numeric'}
      value={value}
      onChange={(e) => {
        const v = decimal ? e.target.value.replace(/[^0-9.]/g, '') : e.target.value.replace(/\D/g, '');
        if (v.length <= max) onChange(v);
      }}
      placeholder={placeholder}
      style={{
        width: max <= 3 ? 90 : 110,
        textAlign: 'center', border: 'none', outline: 'none', background: 'transparent',
        fontFamily: lr.serif, fontSize: 56, lineHeight: 1,
        color: value ? lr.forestDeep : lr.mutedSoft,
        fontWeight: 400, letterSpacing: -2,
        padding: 0,
      }}
    />
  );
}

function FlagPill({ flag }) {
  if (!flag || flag === 'normal') {
    return flag === 'normal' ? (
      <span style={{
        padding: '3px 8px', borderRadius: 99,
        background: lr.sageSoft, color: '#2E4942',
        fontSize: 9.5, fontWeight: 700, letterSpacing: 0.4,
      }}>NORMAL</span>
    ) : null;
  }
  const tone = flag === 'high'
    ? { bg: '#FBE3D9', fg: lr.terracotta, label: 'HIGH' }
    : { bg: '#FBE7D0', fg: '#C7973A',     label: 'LOW' };
  return (
    <span style={{
      padding: '3px 8px', borderRadius: 99,
      background: tone.bg, color: tone.fg,
      fontSize: 9.5, fontWeight: 700, letterSpacing: 0.4,
    }}>{tone.label}</span>
  );
}

function defaultContextFor(kind) {
  if (kind === 'bp')     return 'seated';
  if (kind === 'sugar')  return 'fasting';
  if (kind === 'hr')     return 'resting';
  if (kind === 'weight') return 'morning';
  if (kind === 'temp')   return 'oral';
  return '';
}

function contextLabel(kind) {
  if (kind === 'bp')    return 'Position';
  if (kind === 'sugar') return 'Context';
  if (kind === 'hr')    return 'State';
  if (kind === 'weight')return 'Time of day';
  if (kind === 'temp')  return 'Method';
  if (kind === 'spo2')  return 'Position';
  return 'Context';
}

function contextOptionsFor(kind) {
  if (kind === 'bp') return [
    { k: 'seated', l: 'Seated' }, { k: 'standing', l: 'Standing' }, { k: 'lying', l: 'Lying down' },
    { k: 'left',   l: 'Left arm' }, { k: 'right', l: 'Right arm' },
  ];
  if (kind === 'sugar') return [
    { k: 'fasting',   l: 'Fasting' },
    { k: 'preMeal',   l: 'Before meal' },
    { k: 'postMeal',  l: 'After meal' },
    { k: 'bedtime',   l: 'Bedtime' },
    { k: 'random',    l: 'Random' },
  ];
  if (kind === 'hr')    return [{ k: 'resting', l: 'Resting' }, { k: 'active', l: 'Active' }];
  if (kind === 'weight')return [{ k: 'morning', l: 'Morning' }, { k: 'evening', l: 'Evening' }];
  if (kind === 'temp')  return [{ k: 'oral', l: 'Oral' }, { k: 'ear', l: 'Ear' }, { k: 'forehead', l: 'Forehead' }];
  if (kind === 'spo2')  return [{ k: 'rest', l: 'At rest' }, { k: 'exertion', l: 'After exertion' }];
  return [];
}

Object.assign(window, { LogReadingPage });
