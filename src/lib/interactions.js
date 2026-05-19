// ─── Shared interaction detection ────────────────────────
// Used by MedicationsScreen and PeopleScreen.
// Static lookups run instantly; AI check is in groq.js.

// ─── Drug–drug interaction DB ─────────────────────────────
export const INTERACTION_DB = [
  { drugs: ['warfarin','aspirin'],           sev: 'major',    label: 'Severe bleeding',                  why: 'Aspirin inhibits platelets and displaces warfarin from proteins — sharply amplifying anticoagulant effect. Confirm with prescriber before next dose.' },
  { drugs: ['warfarin','ibuprofen'],         sev: 'major',    label: 'Severe bleeding',                  why: 'NSAIDs inhibit platelet function and damage the gastric mucosa. Combined with warfarin the risk of serious bleeding is dramatically increased.' },
  { drugs: ['warfarin','fluconazole'],       sev: 'major',    label: 'INR elevation',                    why: 'Fluconazole inhibits CYP2C9 — the primary enzyme clearing warfarin. Plasma warfarin can double; INR must be monitored closely.' },
  { drugs: ['warfarin','amiodarone'],        sev: 'major',    label: 'INR elevation',                    why: 'Amiodarone inhibits CYP2C9, causing warfarin accumulation. Warfarin dose reduction of 30–50 % is often needed.' },
  { drugs: ['digoxin','amiodarone'],         sev: 'major',    label: 'Digoxin toxicity',                 why: 'Amiodarone raises plasma digoxin up to 100 %. Signs: bradycardia, heart block, nausea.' },
  { drugs: ['simvastatin','clarithromycin'], sev: 'major',    label: 'Rhabdomyolysis',                   why: 'CYP3A4 inhibition raises simvastatin 10-fold — severe myopathy and life-threatening rhabdomyolysis.' },
  { drugs: ['atorvastatin','clarithromycin'],sev: 'major',    label: 'Rhabdomyolysis',                   why: 'CYP3A4 inhibition raises atorvastatin ~5-fold — significant muscle breakdown and kidney injury risk.' },
  { drugs: ['tramadol','sertraline'],        sev: 'major',    label: 'Serotonin syndrome',               why: 'Combined serotonergic load can trigger agitation, fever, muscle rigidity, tachycardia, or seizure.' },
  { drugs: ['sildenafil','isosorbide'],      sev: 'major',    label: 'Severe hypotension',               why: 'PDE5 inhibitor + nitrate: coadministration is contraindicated — profound, potentially fatal hypotension.' },
  { drugs: ['lithium','ibuprofen'],          sev: 'major',    label: 'Lithium toxicity',                 why: 'NSAIDs reduce renal lithium excretion. Plasma lithium can rise 25–60 % — tremor, confusion, seizures.' },
  { drugs: ['metformin','contrast'],         sev: 'major',    label: 'Lactic acidosis',                  why: 'Contrast can cause AKI, reducing metformin elimination — potentially fatal lactic acidosis.' },
  { drugs: ['lisinopril','spironolactone'],  sev: 'moderate', label: 'Hyperkalemia',                     why: 'ACE inhibitor + K⁺-sparing diuretic: both raise serum K⁺. Dangerous with reduced kidney function.' },
  { drugs: ['ramipril','spironolactone'],    sev: 'moderate', label: 'Hyperkalemia',                     why: 'Monitor K⁺ levels every 1–4 weeks until stable.' },
  { drugs: ['digoxin','furosemide'],         sev: 'moderate', label: 'Digoxin toxicity',                 why: 'Furosemide-induced hypokalemia sensitises myocardium to digoxin — arrhythmia risk at therapeutic levels.' },
  { drugs: ['clopidogrel','omeprazole'],     sev: 'moderate', label: 'Reduced antiplatelet effect',      why: 'Omeprazole inhibits CYP2C19 — reduces clopidogrel activation, increasing thrombotic risk.' },
  { drugs: ['metoprolol','amiodarone'],      sev: 'moderate', label: 'Bradycardia / heart block',        why: 'Amiodarone inhibits CYP2D6, raising metoprolol levels — excessive heart slowing.' },
  { drugs: ['levothyroxine','calcium'],      sev: 'minor',    label: 'Reduced thyroid absorption',       why: 'Calcium forms complexes with levothyroxine in the gut. Space at least 4 hours apart.' },
  { drugs: ['levothyroxine','iron'],         sev: 'minor',    label: 'Reduced thyroid absorption',       why: 'Iron chelates levothyroxine. Take levothyroxine 2–4 hours before iron supplements.' },
  { drugs: ['alendronate','calcium'],        sev: 'minor',    label: 'Reduced bisphosphonate absorption', why: 'Take alendronate 30 minutes before any food or supplements.' },
];

// ─── Drug–condition interaction DB ───────────────────────
export const CONDITION_DRUG_DB = [
  { condition: 'asthma',        drugs: ['propranolol','metoprolol','atenolol','bisoprolol','carvedilol','nadolol','timolol'],              sev: 'major',    label: 'Bronchospasm risk',          why: 'Beta-blockers can trigger severe bronchospasm in asthma — even cardioselective agents carry risk. Discuss safer alternatives with your prescriber.' },
  { condition: 'copd',          drugs: ['propranolol','metoprolol','atenolol','bisoprolol','carvedilol'],                                  sev: 'major',    label: 'Bronchoconstriction',        why: 'Non-selective beta-blockers worsen COPD by blocking bronchial beta-2 receptors. If unavoidable, use the most cardioselective option at the lowest dose.' },
  { condition: 'kidney',        drugs: ['metformin','ibuprofen','naproxen','diclofenac','celecoxib','indomethacin'],                        sev: 'major',    label: 'Renal toxicity risk',        why: 'NSAIDs reduce renal blood flow and worsen kidney disease. Metformin can cause fatal lactic acidosis if GFR falls. Review doses with a nephrologist.' },
  { condition: 'renal',         drugs: ['metformin','ibuprofen','naproxen','diclofenac'],                                                  sev: 'major',    label: 'Renal toxicity risk',        why: 'Impaired clearance raises drug levels and toxicity risk. Dose adjustment or discontinuation may be necessary — consult prescriber.' },
  { condition: 'diabetes',      drugs: ['prednisone','dexamethasone','methylprednisolone','hydrocortisone','betamethasone'],                sev: 'moderate', label: 'Blood sugar elevation',      why: 'Corticosteroids increase glucose via gluconeogenesis and insulin resistance. Close monitoring and antidiabetic dose adjustment are usually needed.' },
  { condition: 'liver',         drugs: ['acetaminophen','paracetamol','methotrexate','isoniazid','ketoconazole','fluconazole'],             sev: 'major',    label: 'Hepatotoxicity risk',        why: 'Liver disease reduces drug metabolism, causing toxic accumulation. Hepatotoxic drugs can cause further liver damage. Consult a hepatologist.' },
  { condition: 'hepatic',       drugs: ['acetaminophen','paracetamol','methotrexate','isoniazid'],                                         sev: 'major',    label: 'Hepatotoxicity risk',        why: 'Impaired hepatic metabolism leads to drug accumulation and hepatotoxicity risk. Dose reduction or alternative agents are usually needed.' },
  { condition: 'heart failure', drugs: ['ibuprofen','naproxen','diclofenac','celecoxib'],                                                  sev: 'moderate', label: 'Worsens heart failure',      why: 'NSAIDs promote sodium and water retention, reduce renal prostaglandins, and can precipitate acute decompensation in heart failure.' },
  { condition: 'hypertension',  drugs: ['pseudoephedrine','phenylephrine','ephedrine'],                                                    sev: 'moderate', label: 'Blood pressure elevation',   why: 'Sympathomimetic decongestants constrict blood vessels and can significantly raise blood pressure. Avoid or use under close monitoring.' },
  { condition: 'epilepsy',      drugs: ['tramadol','bupropion','meperidine','chlorpromazine'],                                             sev: 'major',    label: 'Seizure risk increased',     why: 'These drugs lower the seizure threshold and can trigger breakthrough seizures in patients with epilepsy. Review with neurologist before use.' },
  { condition: 'seizure',       drugs: ['tramadol','bupropion','chlorpromazine'],                                                          sev: 'major',    label: 'Seizure risk increased',     why: 'Seizure threshold-lowering drugs increase the chance of breakthrough seizures. Discuss with the prescribing neurologist.' },
  { condition: 'gout',          drugs: ['hydrochlorothiazide','furosemide','chlorothiazide'],                                              sev: 'moderate', label: 'Uric acid elevation',        why: 'Thiazide and loop diuretics reduce uric acid excretion. This can trigger or worsen gout flares — monitor uric acid levels regularly.' },
  { condition: 'parkinson',     drugs: ['haloperidol','olanzapine','risperidone','metoclopramide','prochlorperazine','chlorpromazine'],     sev: 'major',    label: "Worsens Parkinson's",        why: "Dopamine-blocking drugs can dramatically worsen tremor, rigidity, and gait in Parkinson's disease. Use only under close neurologist supervision." },
  { condition: 'hypothyroid',   drugs: ['lithium','amiodarone'],                                                                          sev: 'moderate', label: 'Thyroid suppression',        why: 'Lithium and amiodarone both interfere with thyroid hormone production. Combined with hypothyroidism, levels may fall further — monitor TSH closely.' },
  { condition: 'hyperthyroid',  drugs: ['amiodarone'],                                                                                    sev: 'moderate', label: 'Thyroid storm risk',          why: 'Amiodarone contains high iodine and can trigger or worsen hyperthyroidism, including life-threatening thyroid storm. Regular thyroid monitoring is essential.' },
  { condition: 'osteoporosis',  drugs: ['prednisone','dexamethasone','methylprednisolone'],                                               sev: 'moderate', label: 'Bone density loss',          why: 'Long-term corticosteroids accelerate bone loss and greatly increase fracture risk in osteoporosis. Ensure calcium, vitamin D, and bisphosphonate cover.' },
  { condition: 'bleeding',      drugs: ['ibuprofen','naproxen','aspirin','clopidogrel','warfarin','rivaroxaban','apixaban'],               sev: 'major',    label: 'Increased bleeding risk',    why: 'Anticoagulants and antiplatelet drugs compound any existing bleeding tendency. Review with prescriber; monitor for signs of GI or internal bleeding.' },
  { condition: 'peptic ulcer',  drugs: ['ibuprofen','naproxen','aspirin','diclofenac','celecoxib'],                                       sev: 'moderate', label: 'GI ulcer worsening',         why: 'NSAIDs inhibit prostaglandins that protect the gastric mucosa, increasing the risk of ulcer recurrence and GI bleeding.' },
];

// ─── Detection functions ──────────────────────────────────

export function detectInteractions(meds) {
  const activeMeds = meds.filter(m => m.active);
  const seen = new Set();
  const out = [];
  for (const ix of INTERACTION_DB) {
    const [kA, kB] = ix.drugs;
    const mA = activeMeds.find(m => m.name.toLowerCase().includes(kA));
    const mB = activeMeds.find(m => m.name.toLowerCase().includes(kB));
    if (mA && mB) {
      const key = [kA, kB].sort().join('|');
      if (!seen.has(key)) { seen.add(key); out.push({ ...ix, a: mA.name, b: mB.name }); }
    }
  }
  const order = { major: 0, moderate: 1, minor: 2 };
  return out.sort((a, b) => order[a.sev] - order[b.sev]);
}

export function detectConditionInteractions(meds, conditions) {
  if (!conditions || conditions.length === 0) return [];
  const activeMeds = meds.filter(m => m.active);
  const seen = new Set();
  const out = [];
  for (const pair of CONDITION_DRUG_DB) {
    const condKey = pair.condition.toLowerCase();
    const matchedCond = conditions.find(c => (c.name ?? '').toLowerCase().includes(condKey));
    if (!matchedCond) continue;
    for (const drugKey of pair.drugs) {
      const matchedMed = activeMeds.find(m => m.name.toLowerCase().includes(drugKey));
      if (!matchedMed) continue;
      const key = `${condKey}|${drugKey}`;
      if (!seen.has(key)) {
        seen.add(key);
        out.push({ ...pair, a: matchedMed.name, b: matchedCond.name, isCondition: true });
      }
    }
  }
  return out;
}

export function mergeInteractions(drugDrug, drugCond, aiResults = []) {
  const seen = new Set();
  const all = [];
  for (const ix of [...drugDrug, ...drugCond, ...aiResults]) {
    const key = [ix.a, ix.b].map(s => s.toLowerCase()).sort().join('|');
    if (!seen.has(key)) { seen.add(key); all.push(ix); }
  }
  const order = { major: 0, moderate: 1, minor: 2 };
  return all.sort((a, b) => order[a.sev] - order[b.sev]);
}

// ─── Cache key helpers ────────────────────────────────────

/**
 * Build a stable hash string from active med names + condition names.
 * If hash changes → new AI check is needed.
 */
export function buildInteractionHash(medNames, conditionNames) {
  const meds = [...medNames].sort().join(',');
  const conds = [...conditionNames].sort().join(',');
  return `${meds}||${conds}`;
}
