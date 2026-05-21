// CareCircle — Add medication (with optional scheduling)
// Two-tier form: required basics → optional reminder schedule (toggle reveals it).

const am = window.tokens;

const AMI = {
  back: (c = am.ink) => (<svg width="9" height="16" viewBox="0 0 9 16"><path d="M8 1L1 8l7 7" stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  caret: (c = am.muted) => (<svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  plus: (c = am.muted) => (<svg width="12" height="12" viewBox="0 0 12 12"><path d="M6 1v10M1 6h10" stroke={c} strokeWidth="1.6" strokeLinecap="round"/></svg>),
  close: (c = am.muted) => (<svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 2l6 6M8 2l-6 6" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></svg>),
  check: (c = '#fff') => (<svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1 4.5l3 3 6-6" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  search: (c = am.muted) => (<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke={c} strokeWidth="1.4"/><path d="M9.5 9.5L13 13" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>),
};

// ─── Building blocks ────────────────────────────────────
function FieldLabel({ label, optional, accent }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
      marginBottom: 8,
    }}>
      <div style={{
        fontSize: 11, fontWeight: 700, color: am.muted,
        letterSpacing: 0.5, textTransform: 'uppercase',
        display: 'flex', alignItems: 'baseline', gap: 6,
      }}>
        {label}
        {accent && (
          <span style={{ fontSize: 10, color: am.mutedSoft, fontWeight: 500, letterSpacing: 0.2, textTransform: 'lowercase' }}>{accent}</span>
        )}
      </div>
      {optional && <div style={{ fontSize: 10.5, color: am.mutedSoft }}>Optional</div>}
    </div>
  );
}

function TextField({ value, onChange, placeholder, leading }) {
  return (
    <div style={{
      height: 50, borderRadius: 13, background: '#fff',
      border: `1px solid ${am.line}`, padding: '0 14px',
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      {leading}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          flex: 1, border: 'none', outline: 'none', background: 'transparent',
          fontFamily: am.sans, fontSize: 15, color: am.ink,
          letterSpacing: -0.15,
        }}
      />
    </div>
  );
}

function SelectField({ value, placeholder, onClick }) {
  return (
    <div onClick={onClick} style={{
      height: 50, borderRadius: 13, background: '#fff',
      border: `1px solid ${am.line}`, padding: '0 14px',
      display: 'flex', alignItems: 'center', cursor: 'pointer',
    }}>
      <span style={{
        flex: 1, fontSize: 15, color: value ? am.ink : am.mutedSoft,
        letterSpacing: -0.15,
      }}>{value || placeholder}</span>
      {AMI.caret()}
    </div>
  );
}

function Toggle({ on, onChange }) {
  return (
    <div onClick={onChange} style={{
      width: 46, height: 28, borderRadius: 99, padding: 3,
      background: on ? am.forestDeep : am.line,
      transition: 'background .2s', cursor: 'pointer',
      display: 'flex', alignItems: 'center',
      justifyContent: on ? 'flex-end' : 'flex-start',
    }}>
      <div style={{
        width: 22, height: 22, borderRadius: 99,
        background: '#fff',
        boxShadow: '0 1px 3px rgba(31,61,56,0.2)',
        transition: 'all .2s',
      }} />
    </div>
  );
}

function Section({ title, sub, accent, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        marginBottom: 12, padding: '0 4px',
      }}>
        <div>
          <div style={{
            fontFamily: am.serif, fontSize: 18, color: am.forestDeep,
            fontWeight: 500, letterSpacing: -0.3,
          }}>{title}</div>
          {sub && <div style={{ fontSize: 11.5, color: am.muted, marginTop: 2 }}>{sub}</div>}
        </div>
        {accent && <div style={{ fontSize: 11, color: am.mutedSoft }}>{accent}</div>}
      </div>
      {children}
    </div>
  );
}

// ─── Frequency option card ─────────────────────────────
function FreqCard({ active, title, sub, onClick }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, minWidth: 0,
      padding: '14px 14px', borderRadius: 14, cursor: 'pointer',
      background: active ? am.forestDeep : '#fff',
      color: active ? '#fff' : am.ink,
      border: active ? 'none' : `1px solid ${am.line}`,
      textAlign: 'left', fontFamily: am.sans,
      display: 'flex', flexDirection: 'column', gap: 3,
      transition: 'background .15s',
    }}>
      <span style={{
        fontSize: 14, fontWeight: 600, letterSpacing: -0.1,
      }}>{title}</span>
      <span style={{
        fontSize: 11.5, opacity: active ? 0.75 : 0.65,
        color: active ? '#fff' : am.muted, letterSpacing: -0.05,
      }}>{sub}</span>
    </button>
  );
}

// ─── Add Medication page ───────────────────────────────
function AddMedicationPage({ onBack, onSave, person }) {
  const [name, setName] = React.useState('');
  const [brand, setBrand] = React.useState('');
  const [dose, setDose] = React.useState('');
  const [doctor, setDoctor] = React.useState('');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [reminderOn, setReminderOn] = React.useState(true);

  // Schedule
  const [unit, setUnit] = React.useState('tablet');
  const [freq, setFreq] = React.useState('once');
  const [times, setTimes] = React.useState(['8:00 AM']);
  const [foodInstr, setFoodInstr] = React.useState('none');
  const [supply, setSupply] = React.useState('');

  const units = ['tablet', 'capsule', 'ml', 'drops', 'puff', 'patch'];
  const freqOptions = [
    { k: 'once',   t: 'Once daily',     s: '1 dose/day' },
    { k: 'twice',  t: 'Twice daily',    s: '2 doses/day' },
    { k: 'three',  t: 'Three times',    s: '3 doses/day' },
    { k: 'altDay', t: 'Every other day', s: 'Alternating days' },
    { k: 'custom', t: 'Custom days',    s: 'Specific days' },
    { k: 'prn',    t: 'As needed (PRN)', s: 'No fixed time' },
  ];
  // Full 24-hour list for explicit pick-any
  const dailyTimes = Array.from({ length: 24 }, (_, i) => {
    const h = i % 12 === 0 ? 12 : i % 12;
    return `${h}:00 ${i < 12 ? 'AM' : 'PM'}`;
  });
  const foodOptions = [
    { k: 'none',    l: 'No instruction' },
    { k: 'with',    l: 'With food' },
    { k: 'without', l: 'Without food' },
    { k: 'water',   l: 'With water' },
  ];

  const toggleTime = (t) => {
    setTimes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  const canSave = name.trim().length > 0;

  return (
    <div style={{
      width: '100%', height: '100%', background: am.cream,
      fontFamily: am.sans, color: am.ink,
      display: 'flex', flexDirection: 'column', paddingTop: 56,
      position: 'relative',
    }}>
      {/* top bar */}
      <div style={{
        padding: '14px 20px 0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div onClick={onBack} style={{
          width: 36, height: 36, borderRadius: 12,
          background: '#fff', border: `1px solid ${am.line}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}>{AMI.back()}</div>
        <div style={{
          fontFamily: am.serif, fontSize: 16, color: am.forestDeep,
          fontWeight: 500, letterSpacing: -0.2,
        }}>Add medication</div>
        <div onClick={onBack} style={{
          height: 36, padding: '0 12px', borderRadius: 12,
          background: 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          fontSize: 13, color: am.muted, fontWeight: 500,
        }}>Cancel</div>
      </div>

      {/* hero */}
      <div style={{ padding: '20px 24px 0' }}>
        <div style={{
          fontFamily: am.serif, fontSize: 26, lineHeight: '30px',
          letterSpacing: -0.6, color: am.forestDeep, fontWeight: 400,
        }}>A new med, kept right.</div>
        <div style={{ marginTop: 6, fontSize: 12.5, color: am.muted, lineHeight: '17px' }}>
          {person ? `Adding for ${person}.` : ''} Only the name is required — fill in what you have.
        </div>
      </div>

      {/* scroll body */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 20px 120px' }}>
        {/* basics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <FieldLabel label="Medication name" />
            <TextField value={name} onChange={setName} placeholder="e.g. Metoprolol" leading={AMI.search()} />
            {name && (
              <div style={{ marginTop: 6, fontSize: 11, color: am.mutedSoft, paddingLeft: 4 }}>
                We'll check this against your other medications for interactions.
              </div>
            )}
          </div>

          <div>
            <FieldLabel label="Brand name" optional />
            <TextField value={brand} onChange={setBrand} placeholder="e.g. Lopressor" />
          </div>

          {/* Dose + Supply side-by-side */}
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <FieldLabel label="Dose" optional />
              <TextField value={dose} onChange={setDose} placeholder="e.g. 50 mg" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <FieldLabel label="Supply" optional />
              <div style={{
                height: 50, borderRadius: 13, background: '#fff',
                border: `1px solid ${am.line}`, padding: '0 14px',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <input
                  value={supply}
                  onChange={(e) => setSupply(e.target.value)}
                  placeholder="e.g. 30"
                  style={{
                    flex: 1, minWidth: 0, border: 'none', outline: 'none',
                    background: 'transparent',
                    fontFamily: am.sans, fontSize: 15, color: am.ink,
                    letterSpacing: -0.15,
                  }}
                />
                <span style={{ fontSize: 12.5, color: am.muted, fontWeight: 500, flexShrink: 0 }}>doses</span>
              </div>
            </div>
          </div>

          <div>
            <FieldLabel label="Prescribing doctor" optional />
            <TextField value={doctor} onChange={setDoctor} placeholder="e.g. Dr. Patel" />
          </div>

          {/* Start + End date side-by-side */}
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <FieldLabel label="Start date" optional />
              <SelectField value={startDate} placeholder="Select…" />
            </div>
            <div style={{ flex: 1 }}>
              <FieldLabel label="End date" optional />
              <SelectField value={endDate} placeholder="Select…" />
            </div>
          </div>
        </div>

        {/* divider */}
        <div style={{ margin: '26px 0 0', height: 1, background: am.line }} />

        {/* Reminders toggle */}
        <div style={{
          marginTop: 18, padding: '0 4px',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: am.serif, fontSize: 18, color: am.forestDeep,
              fontWeight: 500, letterSpacing: -0.3,
            }}>Set up reminders</div>
            <div style={{ fontSize: 12, color: am.muted, marginTop: 3, lineHeight: '16px' }}>
              Choose times and frequency for this medication.
            </div>
          </div>
          <Toggle on={reminderOn} onChange={() => setReminderOn(v => !v)} />
        </div>

        {/* Scheduling — only when reminders are on */}
        {reminderOn && (
          <div style={{ marginTop: 22 }}>
            {/* Dose unit */}
            <Section title="Dose unit">
              <div style={{ display: 'flex', gap: 7, overflowX: 'auto', padding: '0 4px' }}>
                {units.map(u => {
                  const active = unit === u;
                  return (
                    <button key={u} onClick={() => setUnit(u)} style={{
                      flexShrink: 0, height: 38, padding: '0 16px', borderRadius: 99,
                      cursor: 'pointer',
                      border: active ? 'none' : `1px solid ${am.line}`,
                      background: active ? am.forestDeep : '#fff',
                      color: active ? '#fff' : am.ink,
                      fontFamily: am.sans, fontSize: 13, fontWeight: 600, letterSpacing: -0.1,
                    }}>{u}</button>
                  );
                })}
              </div>
            </Section>

            {/* Frequency */}
            <Section title="Frequency">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {freqOptions.map(f => (
                  <FreqCard key={f.k} active={freq === f.k} title={f.t} sub={f.s} onClick={() => setFreq(f.k)} />
                ))}
              </div>
            </Section>

            {/* Times */}
            {freq !== 'prn' && (
              <Section title="Time"
                       sub={freq === 'once' ? 'Pick one daily time' : freq === 'twice' ? 'Pick two daily times' : freq === 'three' ? 'Pick three daily times' : 'Pick when to remind'}>
                <div style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '4px 4px 6px' }}>
                  {dailyTimes.map(t => {
                    const active = times.includes(t);
                    return (
                      <button key={t} onClick={() => toggleTime(t)} style={{
                        flexShrink: 0, height: 38, padding: '0 14px', borderRadius: 12,
                        cursor: 'pointer',
                        border: active ? 'none' : `1px solid ${am.line}`,
                        background: active ? am.forestDeep : '#fff',
                        color: active ? '#fff' : am.ink,
                        fontFamily: 'ui-monospace, SF Mono, monospace',
                        fontSize: 12.5, fontWeight: 600, letterSpacing: 0.2,
                      }}>{t}</button>
                    );
                  })}
                  <button style={{
                    flexShrink: 0, height: 38, padding: '0 14px', borderRadius: 12,
                    border: `1px dashed ${am.mutedSoft}`,
                    background: 'transparent', cursor: 'pointer',
                    fontFamily: am.sans, fontSize: 12, color: am.muted, fontWeight: 500,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>{AMI.plus(am.muted)} Custom</button>
                </div>
                {times.length > 0 && (
                  <div style={{ marginTop: 8, padding: '0 4px', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: am.mutedSoft, letterSpacing: 0.4, textTransform: 'uppercase', fontWeight: 600 }}>Selected</span>
                    {times.map((t, i) => (
                      <span key={i} style={{
                        padding: '3px 8px 3px 10px', borderRadius: 99,
                        background: am.terracottaSoft, color: '#5d3a2c',
                        fontSize: 11, fontWeight: 600, letterSpacing: 0.1,
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                      }}>
                        {t}
                        <span onClick={() => toggleTime(t)} style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer',
                        }}>{AMI.close('#5d3a2c')}</span>
                      </span>
                    ))}
                  </div>
                )}
              </Section>
            )}

            {/* Food instruction */}
            <Section title="Food instruction" accent="Optional">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, padding: '0 4px' }}>
                {foodOptions.map(o => {
                  const active = foodInstr === o.k;
                  return (
                    <button key={o.k} onClick={() => setFoodInstr(o.k)} style={{
                      height: 38, padding: '0 14px', borderRadius: 99, cursor: 'pointer',
                      border: active ? 'none' : `1px solid ${am.line}`,
                      background: active ? am.sageSoft : '#fff',
                      color: active ? '#2E4942' : am.ink,
                      fontFamily: am.sans, fontSize: 13, fontWeight: 600, letterSpacing: -0.1,
                    }}>{o.l}</button>
                  );
                })}
              </div>
            </Section>

            {/* Supply on hand — moved up to basics; keep section here as a hint summary if filled */}
            {supply && (
              <Section title="Supply on hand" sub="Enables run-out alerts.">
                <div style={{
                  padding: '12px 14px', borderRadius: 14,
                  background: '#fff', border: `1px solid ${am.line}`,
                  display: 'flex', alignItems: 'center', gap: 10,
                  fontSize: 13, color: am.ink,
                }}>
                  <span style={{
                    width: 30, height: 30, borderRadius: 8, background: am.sageSoft,
                    color: am.forest, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: am.serif, fontSize: 13, fontWeight: 600,
                  }}>{supply}</span>
                  <span style={{ fontWeight: 500 }}>doses remaining</span>
                  <span style={{ flex: 1 }} />
                  <span style={{ fontSize: 11, color: am.muted }}>~{Math.max(1, Math.floor(parseInt(supply) / (freq === 'twice' ? 2 : freq === 'three' ? 3 : 1)))} days</span>
                </div>
              </Section>
            )}
          </div>
        )}
      </div>

      {/* sticky save */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '14px 20px 26px',
        background: `linear-gradient(to top, ${am.cream} 60%, rgba(246,241,234,0))`,
      }}>
        <button onClick={() => canSave && onSave && onSave({ name, brand, dose, doctor, startDate, reminderOn, unit, freq, times, foodInstr, supply })}
                disabled={!canSave}
                style={{
                  width: '100%', height: 54, borderRadius: 16, border: 'none',
                  background: canSave ? am.forestDeep : '#cdc5b6',
                  color: '#fff', cursor: canSave ? 'pointer' : 'not-allowed',
                  fontFamily: am.sans, fontSize: 15.5, fontWeight: 600, letterSpacing: -0.1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
          Save medication
        </button>
        {!canSave && (
          <div style={{ marginTop: 8, textAlign: 'center', fontSize: 11, color: am.mutedSoft }}>
            Add a name to save.
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { AddMedicationPage });
