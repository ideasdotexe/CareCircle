// CareCircle — Documents page
// Two top tabs: Prescriptions | Reports
// Auto-clusters: if ≥3 docs share a subtype (blood, MRI, etc.) they fold into a stack

const dp = window.tokens;

// ─── Sample documents ──────────────────────────────────
const documents = {
  prescriptions: [
    { id: 'rx1', who: 'Arjun', date: 'May 02', doctor: 'Dr. Mei Chen', clinic: 'St. Michael\'s', subtype: 'Cardiology', meds: ['Warfarin 3 mg', 'Atorvastatin 20 mg'], tint: '#1F3D38' },
    { id: 'rx2', who: 'Arjun', date: 'Apr 18', doctor: 'Dr. Patel', clinic: 'Family clinic', subtype: 'General', meds: ['Ramipril 5 mg', 'Aspirin 81 mg'], tint: '#C66E4E' },
    { id: 'rx3', who: 'Arjun', date: 'Mar 21', doctor: 'Dr. Mei Chen', clinic: 'St. Michael\'s', subtype: 'Cardiology', meds: ['Warfarin 2.5 mg'], tint: '#1F3D38' },
    { id: 'rx4', who: 'Arjun', date: 'Feb 14', doctor: 'Dr. Patel', clinic: 'Family clinic', subtype: 'General', meds: ['Metformin 500 mg'], tint: '#C66E4E' },
    { id: 'rx5', who: 'Indira', date: 'Apr 30', doctor: 'Dr. Ng', clinic: 'Mount Sinai', subtype: 'Endocrinology', meds: ['Levothyroxine 75 mcg'], tint: '#A8B5A0' },
    { id: 'rx6', who: 'Indira', date: 'Mar 12', doctor: 'Dr. Ng', clinic: 'Mount Sinai', subtype: 'Endocrinology', meds: ['Alendronate 70 mg'], tint: '#A8B5A0' },
    { id: 'rx7', who: 'Indira', date: 'Jan 09', doctor: 'Dr. Ng', clinic: 'Mount Sinai', subtype: 'Endocrinology', meds: ['Calcium + D₃'], tint: '#A8B5A0' },
  ],
  reports: [
    { id: 'r1', who: 'Arjun', date: 'May 04', subtype: 'Blood', title: 'CBC + Lipid panel', lab: 'LifeLabs', flagged: 1, tint: '#C66E4E' },
    { id: 'r2', who: 'Arjun', date: 'Apr 22', subtype: 'Blood', title: 'INR · weekly', lab: 'LifeLabs', flagged: 0, tint: '#C66E4E' },
    { id: 'r3', who: 'Arjun', date: 'Apr 08', subtype: 'Blood', title: 'INR + LFT', lab: 'LifeLabs', flagged: 1, tint: '#C66E4E' },
    { id: 'r4', who: 'Arjun', date: 'Mar 25', subtype: 'Blood', title: 'HbA1c · quarterly', lab: 'LifeLabs', flagged: 0, tint: '#C66E4E' },
    { id: 'r5', who: 'Arjun', date: 'Mar 02', subtype: 'Imaging', title: 'Echocardiogram', lab: 'St. Michael\'s', flagged: 0, tint: '#1F3D38' },
    { id: 'r6', who: 'Arjun', date: 'Feb 20', subtype: 'Imaging', title: 'Chest X-ray', lab: 'St. Michael\'s', flagged: 0, tint: '#1F3D38' },
    { id: 'r7', who: 'Indira', date: 'Apr 28', subtype: 'Imaging', title: 'DEXA bone density', lab: 'Women\'s College', flagged: 1, tint: '#1F3D38' },
    { id: 'r8', who: 'Indira', date: 'Apr 10', subtype: 'Blood', title: 'TSH + Free T4', lab: 'LifeLabs', flagged: 0, tint: '#C66E4E' },
    { id: 'r9', who: 'Indira', date: 'Feb 11', subtype: 'ECG', title: 'Resting ECG', lab: 'Mt. Sinai', flagged: 0, tint: '#A8B5A0' },
  ],
};

const DIcon = {
  back: (c = dp.ink) => (<svg width="9" height="16" viewBox="0 0 9 16"><path d="M8 1L1 8l7 7" stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  scan: (c = dp.forest) => (<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M1 5V3a2 2 0 012-2h2M17 5V3a2 2 0 00-2-2h-2M1 13v2a2 2 0 002 2h2M17 13v2a2 2 0 01-2 2h-2" stroke={c} strokeWidth="1.5" strokeLinecap="round"/><path d="M1 9h16" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></svg>),
  search: (c = dp.muted) => (<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke={c} strokeWidth="1.4"/><path d="M9.5 9.5L13 13" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>),
  filter: (c = dp.muted) => (<svg width="14" height="12" viewBox="0 0 14 12" fill="none"><path d="M1 2h12M3 6h8M5 10h4" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>),
  rx: (c = '#fff') => (<svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 1h4a3 3 0 010 6H3v6m0-6h3l4 6M3 1v6" stroke={c} strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  flask: (c = '#fff') => (<svg width="12" height="14" viewBox="0 0 12 14" fill="none"><path d="M4.5 1v4L1 12a.8.8 0 00.7 1h8.6a.8.8 0 00.7-1L7.5 5V1" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M3.5 1h5" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>),
  image: (c = '#fff') => (<svg width="14" height="12" viewBox="0 0 14 12" fill="none"><rect x="1" y="1" width="12" height="10" rx="1.5" stroke={c} strokeWidth="1.3"/><path d="M1 8l3-3 3 3 2-2 4 4" stroke={c} strokeWidth="1.3" strokeLinejoin="round" fill="none"/><circle cx="9.5" cy="3.5" r="1" fill={c}/></svg>),
  pulse: (c = '#fff') => (<svg width="14" height="12" viewBox="0 0 14 12" fill="none"><path d="M1 6h2.5L5 1l3 10 1.5-5H13" stroke={c} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  warn: (c = '#fff') => (<svg width="10" height="10" viewBox="0 0 10 10"><path d="M5 1l4 8H1L5 1z" fill={c}/></svg>),
  chevR: (c = dp.muted) => (<svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1l5 5-5 5" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  stack: (c = '#fff') => (<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 4l5-3 5 3-5 3-5-3z" stroke={c} strokeWidth="1.2" strokeLinejoin="round"/><path d="M1 8l5 3 5-3" stroke={c} strokeWidth="1.2" strokeLinejoin="round"/></svg>),
  plus: (c = '#fff') => (<svg width="14" height="14" viewBox="0 0 14 14"><path d="M7 1v12M1 7h12" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></svg>),
};

function subtypeIcon(sub) {
  if (sub === 'Blood') return DIcon.flask;
  if (sub === 'Imaging') return DIcon.image;
  if (sub === 'ECG') return DIcon.pulse;
  return DIcon.rx;
}

// Auto-segregation: ≥3 of same subtype → cluster
function segregate(docs) {
  const groups = {};
  docs.forEach(d => {
    const key = `${d.who}::${d.subtype}`;
    (groups[key] = groups[key] || []).push(d);
  });
  const clusters = [];
  const loose = [];
  Object.entries(groups).forEach(([k, items]) => {
    if (items.length >= 3) clusters.push({ key: k, who: items[0].who, subtype: items[0].subtype, tint: items[0].tint, items });
    else loose.push(...items);
  });
  // sort loose by date desc-ish (we'll just use given order)
  return { clusters, loose };
}

// ─── Cluster card (folded stack of ≥3 same-subtype) ────
function ClusterCard({ cluster, kind, onOpen }) {
  const Icon = kind === 'rx' ? DIcon.rx : subtypeIcon(cluster.subtype);
  const label = kind === 'rx' ? `${cluster.subtype} prescriptions` : `${cluster.subtype} reports`;
  return (
    <div onClick={onOpen} style={{
      position: 'relative', height: 138, cursor: 'pointer',
      marginBottom: 6,
    }}>
      {/* back papers */}
      <div style={{
        position: 'absolute', inset: '8px 14px 0 14px', height: 130, borderRadius: 16,
        background: '#fff', border: `1px solid ${dp.line}`,
        transform: 'rotate(-1.5deg)',
      }} />
      <div style={{
        position: 'absolute', inset: '4px 8px 0 8px', height: 130, borderRadius: 16,
        background: '#fff', border: `1px solid ${dp.line}`,
        transform: 'rotate(1deg)',
      }} />
      {/* front */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 16,
        background: '#fff', border: `1px solid ${dp.line}`,
        padding: 14, display: 'flex', gap: 12,
        boxShadow: '0 4px 14px rgba(31,61,56,0.08)',
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          background: cluster.tint,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          <Icon />
          <div style={{
            position: 'absolute', top: 3, right: 3,
            background: 'rgba(255,255,255,0.18)', borderRadius: 99,
            padding: '1px 5px',
            fontSize: 9, fontWeight: 700, color: '#fff',
            fontFamily: 'ui-monospace, monospace', letterSpacing: 0.3,
          }}>{cluster.items.length}</div>
        </div>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2,
          }}>
            <div style={{
              padding: '2px 6px', borderRadius: 99,
              background: dp.cream, fontSize: 9.5, fontWeight: 600,
              color: dp.muted, letterSpacing: 0.4, textTransform: 'uppercase',
            }}>{cluster.who}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3,
              fontSize: 9.5, fontWeight: 700, color: dp.forest,
              letterSpacing: 0.4, textTransform: 'uppercase',
            }}>{DIcon.stack(dp.forest)} GROUPED</div>
          </div>
          <div style={{
            fontFamily: dp.serif, fontSize: 17, color: dp.forestDeep,
            fontWeight: 500, letterSpacing: -0.3,
          }}>{label}</div>
          <div style={{ fontSize: 11.5, color: dp.muted, marginTop: 2 }}>
            {cluster.items.length} files · latest {cluster.items[0].date}
          </div>
          {/* mini timeline */}
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', gap: 4, marginTop: 6, alignItems: 'center' }}>
            {cluster.items.slice(0, 5).map((it, i) => (
              <div key={i} style={{
                padding: '2px 6px', borderRadius: 5,
                background: dp.cream, border: `1px solid ${dp.lineSoft}`,
                fontSize: 9.5, fontFamily: 'ui-monospace, monospace',
                color: dp.muted, letterSpacing: 0.2,
              }}>{it.date}</div>
            ))}
            {cluster.items.length > 5 && (
              <span style={{ fontSize: 10, color: dp.mutedSoft }}>+{cluster.items.length - 5}</span>
            )}
          </div>
        </div>
        <div style={{ alignSelf: 'center' }}>{DIcon.chevR()}</div>
      </div>
    </div>
  );
}

// ─── Single doc card ───────────────────────────────────
function DocCard({ doc, kind }) {
  const Icon = kind === 'rx' ? DIcon.rx : subtypeIcon(doc.subtype);
  return (
    <div style={{
      background: '#fff', border: `1px solid ${dp.line}`, borderRadius: 16,
      padding: 14, display: 'flex', gap: 12, marginBottom: 8,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: doc.tint,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <div style={{
            padding: '2px 6px', borderRadius: 99, background: dp.cream,
            fontSize: 9.5, fontWeight: 600, color: dp.muted,
            letterSpacing: 0.4, textTransform: 'uppercase',
          }}>{doc.who}</div>
          <div style={{ fontSize: 10, color: dp.mutedSoft, letterSpacing: 0.3 }}>{doc.subtype}</div>
          {doc.flagged > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 3,
              padding: '2px 6px', borderRadius: 99,
              background: '#FBE3D9', color: dp.terracotta,
              fontSize: 9, fontWeight: 700, letterSpacing: 0.4,
            }}>{DIcon.warn(dp.terracotta)} FLAGGED</div>
          )}
        </div>
        <div style={{
          fontFamily: dp.serif, fontSize: 15.5, color: dp.forestDeep,
          fontWeight: 500, letterSpacing: -0.2,
        }}>
          {kind === 'rx'
            ? `${doc.subtype} · ${doc.meds.length} med${doc.meds.length > 1 ? 's' : ''}`
            : doc.title}
        </div>
        <div style={{ fontSize: 11.5, color: dp.muted, marginTop: 2, lineHeight: '15px' }}>
          {kind === 'rx' ? `${doc.doctor} · ${doc.clinic}` : doc.lab}
        </div>
        {kind === 'rx' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
            {doc.meds.slice(0, 3).map((m, i) => (
              <span key={i} style={{
                padding: '2px 7px', borderRadius: 99,
                background: dp.cream, border: `1px solid ${dp.lineSoft}`,
                fontSize: 10, color: dp.ink,
              }}>{m}</span>
            ))}
          </div>
        )}
      </div>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
        justifyContent: 'space-between', flexShrink: 0,
      }}>
        <div style={{ fontSize: 10.5, color: dp.muted, fontFamily: 'ui-monospace, monospace', letterSpacing: 0.3 }}>{doc.date}</div>
        <div>{DIcon.chevR()}</div>
      </div>
    </div>
  );
}

// ─── Cluster detail (when opened) ──────────────────────
function ClusterDetail({ cluster, kind, onBack }) {
  return (
    <div style={{ paddingTop: 4 }}>
      <div style={{
        padding: '0 20px 14px', display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div onClick={onBack} style={{
          width: 30, height: 30, borderRadius: 9,
          background: '#fff', border: `1px solid ${dp.line}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}>{DIcon.back()}</div>
        <div>
          <div style={{ fontSize: 10.5, color: dp.muted, letterSpacing: 0.4, textTransform: 'uppercase' }}>
            {cluster.who} · {cluster.items.length} files
          </div>
          <div style={{
            fontFamily: dp.serif, fontSize: 19, color: dp.forestDeep,
            fontWeight: 500, letterSpacing: -0.3,
          }}>{cluster.subtype} {kind === 'rx' ? 'prescriptions' : 'reports'}</div>
        </div>
      </div>
      {/* timeline list */}
      <div style={{ padding: '0 20px' }}>
        {cluster.items.map((d, i) => (
          <div key={d.id} style={{
            display: 'flex', gap: 12, paddingLeft: 4, position: 'relative',
          }}>
            <div style={{
              width: 36, display: 'flex', flexDirection: 'column', alignItems: 'center',
              paddingTop: 18,
            }}>
              <div style={{
                width: 9, height: 9, borderRadius: 99,
                background: i === 0 ? dp.terracotta : dp.line,
                border: i === 0 ? `2px solid ${dp.terracottaSoft}` : 'none',
                zIndex: 1,
              }} />
              {i < cluster.items.length - 1 && (
                <div style={{ flex: 1, width: 1.5, background: dp.line, marginTop: 2 }} />
              )}
            </div>
            <div style={{ flex: 1, paddingBottom: 8 }}>
              <DocCard doc={d} kind={kind} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────
function DocumentsPage({ initialTab = 'rx', initialWho = 'Arjun' } = {}) {
  const [tab, setTab] = React.useState(initialTab); // 'rx' | 'rep'
  const [who, setWho] = React.useState(initialWho); // 'Arjun' | 'Indira'
  const [openCluster, setOpenCluster] = React.useState(null);

  const allDocs = tab === 'rx' ? documents.prescriptions : documents.reports;
  const docs = allDocs.filter(d => d.who === who);
  const { clusters, loose } = segregate(docs);

  const peopleChips = [
    { k: 'Arjun',  label: 'Arjun',  rel: 'Father', tint: '#3F5D54', count: allDocs.filter(d => d.who === 'Arjun').length,  init: 'A' },
    { k: 'Indira', label: 'Indira', rel: 'Mother', tint: '#C66E4E', count: allDocs.filter(d => d.who === 'Indira').length, init: 'I' },
  ];

  return (
    <div style={{
      width: '100%', height: '100%', background: dp.cream,
      fontFamily: dp.sans, color: dp.ink,
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
          background: '#fff', border: `1px solid ${dp.line}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{DIcon.back()}</div>
        <div style={{
          fontFamily: dp.serif, fontSize: 17, color: dp.forestDeep,
          fontWeight: 500, letterSpacing: -0.2,
        }}>Documents</div>
        <div style={{
          width: 36, height: 36, borderRadius: 12,
          background: dp.forestDeep,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{DIcon.scan('#fff')}</div>
      </div>

      {/* header copy */}
      <div style={{ padding: '20px 24px 0' }}>
        <div style={{
          fontFamily: dp.serif, fontSize: 28, lineHeight: '32px',
          letterSpacing: -0.7, color: dp.forestDeep, fontWeight: 400,
        }}>Everything,<br />in one folder.</div>
        <div style={{ marginTop: 8, fontSize: 13, color: dp.muted, lineHeight: '18px' }}>
          We sort each new scan by what it is, who it's for, and stack things up once you have a few.
        </div>
      </div>

      {/* person selector */}
      <div style={{
        padding: '20px 20px 0',
        display: 'flex', gap: 8, overflowX: 'auto',
      }}>
        {peopleChips.map(p => {
          const active = who === p.k;
          return (
            <button key={p.k} onClick={() => { setWho(p.k); setOpenCluster(null); }} style={{
              flexShrink: 0, height: 40, padding: '0 14px 0 4px',
              borderRadius: 99, cursor: 'pointer',
              border: `1px solid ${active ? dp.forestDeep : dp.line}`,
              background: active ? dp.forestDeep : '#fff',
              color: active ? '#fff' : dp.ink,
              display: 'flex', alignItems: 'center', gap: 8,
              fontFamily: dp.sans, fontSize: 13, fontWeight: 500,
              letterSpacing: -0.1,
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: 99, flexShrink: 0,
                background: p.tint, color: '#fff',
                fontFamily: dp.serif, fontSize: 13, fontWeight: 500,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: active ? '1.5px solid rgba(255,255,255,0.25)' : 'none',
              }}>{p.init}</div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.1 }}>
                <span>{p.label}</span>
                <span style={{
                  fontSize: 9.5, opacity: active ? 0.65 : 0.5,
                  fontWeight: 500, letterSpacing: 0.2, marginTop: 2,
                }}>{p.rel} · {String(p.count).padStart(2, '0')}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* tabs */}
      <div style={{ padding: '12px 20px 0' }}>
        <div style={{
          height: 44, background: '#fff', borderRadius: 14,
          border: `1px solid ${dp.line}`, padding: 4,
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4,
        }}>
          {[
            { k: 'rx',  label: 'Prescriptions', count: documents.prescriptions.length },
            { k: 'rep', label: 'Reports',       count: documents.reports.length },
          ].map(t => {
            const active = tab === t.k;
            return (
              <button key={t.k} onClick={() => { setTab(t.k); setOpenCluster(null); }} style={{
                border: 'none', cursor: 'pointer',
                background: active ? dp.forestDeep : 'transparent',
                color: active ? '#fff' : dp.ink,
                borderRadius: 11, fontFamily: dp.sans, fontSize: 13.5,
                fontWeight: 600, letterSpacing: -0.1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                {t.label}
                <span style={{
                  fontSize: 10, fontFamily: 'ui-monospace, monospace',
                  fontWeight: 600, opacity: active ? 0.7 : 0.5,
                }}>{String(t.count).padStart(2, '0')}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* search + filter */}
      <div style={{ padding: '12px 20px 0', display: 'flex', gap: 8 }}>
        <div style={{
          flex: 1, height: 36, borderRadius: 11,
          background: '#fff', border: `1px solid ${dp.line}`,
          display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px',
        }}>
          {DIcon.search()}
          <span style={{ fontSize: 12.5, color: dp.mutedSoft }}>Search by name, date, doctor…</span>
        </div>
        <div style={{
          height: 36, padding: '0 12px', borderRadius: 11,
          background: '#fff', border: `1px solid ${dp.line}`,
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 12, color: dp.ink, fontWeight: 500,
        }}>{DIcon.filter()} Filter</div>
      </div>

      {/* body */}
      <div style={{ flex: 1, overflow: 'auto', paddingBottom: 110, paddingTop: 18 }}>
        {openCluster ? (
          <ClusterDetail cluster={openCluster} kind={tab} onBack={() => setOpenCluster(null)} />
        ) : (
          <>
            {/* clusters */}
            {clusters.length > 0 && (
              <div style={{ padding: '0 20px' }}>
                <div style={{
                  display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
                  marginBottom: 10,
                }}>
                  <span style={{
                    fontFamily: dp.serif, fontSize: 16, color: dp.forestDeep,
                    fontWeight: 500, letterSpacing: -0.3,
                  }}>Auto-grouped</span>
                  <span style={{ fontSize: 10.5, color: dp.mutedSoft, letterSpacing: 0.3 }}>
                    3+ of a kind
                  </span>
                </div>
                {clusters.map(c => (
                  <ClusterCard key={c.key} cluster={c} kind={tab} onOpen={() => setOpenCluster(c)} />
                ))}
              </div>
            )}

            {/* loose */}
            {loose.length > 0 && (
              <div style={{ padding: clusters.length > 0 ? '20px 20px 0' : '0 20px' }}>
                <div style={{
                  display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
                  marginBottom: 10,
                }}>
                  <span style={{
                    fontFamily: dp.serif, fontSize: 16, color: dp.forestDeep,
                    fontWeight: 500, letterSpacing: -0.3,
                  }}>Recent</span>
                  <span style={{ fontSize: 10.5, color: dp.mutedSoft, letterSpacing: 0.3 }}>
                    {loose.length} files
                  </span>
                </div>
                {loose.map(d => <DocCard key={d.id} doc={d} kind={tab} />)}
              </div>
            )}

            {/* empty filler if nothing */}
            {clusters.length === 0 && loose.length === 0 && (
              <div style={{ padding: 40, textAlign: 'center', color: dp.muted }}>
                Nothing here yet.
              </div>
            )}
          </>
        )}
      </div>

      {/* FAB upload */}
      <div style={{
        position: 'absolute', right: 20, bottom: 100, zIndex: 10,
      }}>
        <div style={{
          width: 54, height: 54, borderRadius: 18,
          background: dp.forestDeep,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 10px 24px rgba(31,61,56,0.28)',
          cursor: 'pointer',
        }}>{DIcon.plus()}</div>
      </div>

      {/* tab bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        paddingBottom: 24, paddingTop: 10,
        background: `linear-gradient(to top, ${dp.cream} 60%, rgba(246,241,234,0))`,
      }}>
        <div style={{
          margin: '0 16px', height: 60, borderRadius: 22,
          background: '#fff', border: `1px solid ${dp.line}`,
          boxShadow: '0 6px 24px rgba(31,61,56,0.06)',
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr',
          alignItems: 'center',
        }}>
          {[
            { l: 'Home',   a: false },
            { l: 'People', a: false },
            { l: 'Care',   a: true  },
            { l: 'You',    a: false },
          ].map((t, i) => (
            <div key={i} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              color: t.a ? dp.forestDeep : dp.muted,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: 99, background: t.a ? dp.forestDeep : 'transparent' }} />
              <div style={{ fontSize: 11, fontWeight: t.a ? 600 : 500 }}>{t.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DocumentsPage });
