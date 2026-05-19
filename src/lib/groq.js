import Constants from 'expo-constants';
const GROQ_API_KEY = Constants.expoConfig?.extra?.groqApiKey || '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';
const BASE_URL = 'https://api.groq.com/openai/v1/chat/completions';
const VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';
const TEXT_MODEL = 'llama-3.3-70b-versatile';
async function callGroq(model, messages, jsonMode = false) {
  const body = {
    model,
    messages,
    temperature: 0.1,
    max_tokens: 2048
  };
  // json_object mode is only supported by text models, not vision models
  if (jsonMode) body.response_format = {
    type: 'json_object'
  };
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Extraction failed: ${err}`);
  }
  const json = await res.json();
  return json.choices?.[0]?.message?.content ?? '';
}
export async function extractPrescriptionFromImage(base64, mimeType) {
  const raw = await callGroq(VISION_MODEL, [{
    role: 'user',
    content: [{
      type: 'image_url',
      image_url: {
        url: `data:${mimeType};base64,${base64}`
      }
    }, {
      type: 'text',
      text: `This is a prescription. Extract all medications listed.
Return ONLY valid JSON matching this structure exactly:
{
  "medications": [
    {
      "name": "generic medication name",
      "brand": "brand name if visible or omit",
      "dose": "dosage with units e.g. 50mg",
      "frequency": "how often e.g. Once daily",
      "prescriber": "doctor name if visible",
      "start_date": "date if visible e.g. May 10, 2026"
    }
  ]
}
Omit any field that is not clearly visible. Return only JSON, no other text.`
    }]
  }]);
  try {
    const parsed = extractJson(raw);
    return Array.isArray(parsed.medications) ? parsed.medications : [];
  } catch {
    throw new Error('Could not read the prescription. Please try a clearer, better-lit photo.');
  }
}
export async function extractLabFromImage(base64, mimeType) {
  const raw = await callGroq(VISION_MODEL, [{
    role: 'user',
    content: [{
      type: 'image_url',
      image_url: {
        url: `data:${mimeType};base64,${base64}`
      }
    }, {
      type: 'text',
      text: `This is a lab report. Extract all test results.
Return ONLY valid JSON matching this structure exactly:
{
  "collection_date": "date as text if found",
  "lab_name": "lab or hospital name if visible",
  "tests": [
    {
      "name": "test name e.g. Hemoglobin",
      "value": "numeric result e.g. 14.2",
      "unit": "unit e.g. g/dL",
      "reference_range": "normal range e.g. 12.0-16.0",
      "flag": "high" or "low" or "normal" or "critical"
    }
  ]
}
Omit fields that are not visible. Return only JSON, no other text.`
    }]
  }]);
  try {
    const parsed = extractJson(raw);
    return {
      collection_date: parsed.collection_date,
      lab_name: parsed.lab_name,
      tests: Array.isArray(parsed.tests) ? parsed.tests : []
    };
  } catch {
    throw new Error('Could not read the lab report. Please try a clearer photo.');
  }
}

// ─── AI-powered drug interaction check ───────────────────
// medNames: string[] of active medication names
// conditionNames: string[] of active condition names
// Returns interaction objects: { a, b, sev, label, why, isCondition }
export async function checkInteractionsAI(medNames, conditionNames = []) {
  if (!medNames || medNames.length < 2) return [];
  const condPart = conditionNames.length > 0 ? conditionNames.join(', ') : 'none listed';
  const prompt = `You are a clinical pharmacist assistant. Given the medication list and medical conditions below, identify any clinically significant drug-drug or drug-condition interactions that a family caregiver should know about.

Medications: ${medNames.join(', ')}
Medical conditions: ${condPart}

Return ONLY valid JSON matching this structure:
{
  "interactions": [
    {
      "a": "drug name (exactly as listed above)",
      "b": "second drug name or condition name (exactly as listed above)",
      "sev": "major" or "moderate" or "minor",
      "label": "interaction name (5 words max)",
      "why": "clear 2-3 sentence explanation for a non-medical caregiver",
      "isCondition": true or false
    }
  ]
}

Only include clinically significant interactions (skip minor ones unless clearly relevant). Keep "why" in plain, reassuring language. Return only JSON, no other text.`;
  try {
    const raw = await callGroq(TEXT_MODEL, [{ role: 'user', content: prompt }], true);
    const parsed = extractJson(raw);
    if (!Array.isArray(parsed.interactions)) return [];
    // Validate each entry has required fields
    return parsed.interactions.filter(ix => ix.a && ix.b && ix.sev && ix.label && ix.why);
  } catch {
    return []; // silently return empty on any failure
  }
}

// Pull the first JSON object out of a string that may have surrounding prose
function extractJson(raw) {
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON found in response');
  return JSON.parse(raw.slice(start, end + 1));
}
export async function extractLabFromText(text) {
  if (!text.trim()) {
    throw new Error('Could not read text from this PDF. It may be scanned — try taking a photo of each page instead.');
  }
  const raw = await callGroq(TEXT_MODEL, [{
    role: 'user',
    content: `Extract lab results from the following medical document text.
Return ONLY valid JSON matching this structure exactly:
{
  "collection_date": "date as text if found",
  "lab_name": "lab or hospital name if visible",
  "tests": [
    {
      "name": "test name e.g. Hemoglobin",
      "value": "numeric result",
      "unit": "unit",
      "reference_range": "normal range",
      "flag": "high" or "low" or "normal" or "critical"
    }
  ]
}
Omit fields that are not present. Return only JSON, no other text.

Document text:
${text.substring(0, 12000)}`
  }], true);
  try {
    const parsed = extractJson(raw);
    return {
      collection_date: parsed.collection_date,
      lab_name: parsed.lab_name,
      tests: Array.isArray(parsed.tests) ? parsed.tests : []
    };
  } catch {
    throw new Error('Could not parse the lab report data. Please check the document and try again.');
  }
}