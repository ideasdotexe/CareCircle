import React, { useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, StyleSheet,
} from 'react-native';

const C = {
  ink: '#1A1F1D', forest: '#1F3D38', muted: '#6B6862',
  mutedSoft: '#9A968F', line: '#E8E0D2', cream: '#F6F1EA',
};

// ─── Nominatim fetchers ───────────────────────────────────
const HEADERS = { 'User-Agent': 'CareCircle/1.0 (carecircle-app)' };

async function fetchCities(query) {
  const q = encodeURIComponent(query);
  const url = `https://nominatim.openstreetmap.org/search?q=${q}&countrycodes=ca&format=json&limit=8&addressdetails=1`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) return [];
  const data = await res.json();
  const seen = new Set();
  return data
    .map(r => {
      const city =
        r.address?.city ||
        r.address?.town ||
        r.address?.village ||
        r.address?.county ||
        r.name || '';
      const province = r.address?.state || '';
      const label = province ? `${city}, ${province}` : city;
      return { label, city, province, country: 'CA', full: r.display_name };
    })
    .filter(r => r.label && !seen.has(r.label) && seen.add(r.label))
    .slice(0, 6);
}

async function fetchAddress(query) {
  const q = encodeURIComponent(query);
  const url = `https://nominatim.openstreetmap.org/search?q=${q}&countrycodes=ca&format=json&limit=6&addressdetails=1`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) return [];
  const data = await res.json();
  const seen = new Set();
  return data
    .map(r => {
      const a = r.address || {};
      const houseNum = a.house_number || '';
      const road     = a.road || a.pedestrian || a.footway || '';
      const street   = houseNum ? `${houseNum} ${road}`.trim() : road;
      const city     = a.city || a.town || a.village || a.hamlet || a.suburb || '';
      const province = a.state || '';
      const postal   = a.postcode || '';
      const country  = a.country || 'Canada';
      // Short label: "200 Jameson Ave, Toronto"
      const label = [street, city].filter(Boolean).join(', ') || r.display_name;
      return { label, street, city, province, postal, country, full: r.display_name };
    })
    .filter(r => r.label && !seen.has(r.label) && seen.add(r.label))
    .slice(0, 6);
}

async function fetchClinics(query) {
  const q = encodeURIComponent(query);
  const url = `https://nominatim.openstreetmap.org/search?q=${q}&countrycodes=ca&format=json&limit=8&addressdetails=1`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) return [];
  const data = await res.json();
  const seen = new Set();
  return data
    .map(r => {
      const name = r.name || r.display_name.split(',')[0].trim();
      const city =
        r.address?.city || r.address?.town || r.address?.village || '';
      const label = city ? `${name}, ${city}` : name;
      return { label, name, address: r.display_name, city };
    })
    .filter(r => r.label && !seen.has(r.label) && seen.add(r.label))
    .slice(0, 6);
}

// ─── Component ────────────────────────────────────────────
/**
 * PlaceAutocomplete
 * Props:
 *   value         – controlled text value
 *   onChangeText  – called on every keystroke
 *   onSelect      – called with { label, city?, province?, address?, name? }
 *   placeholder   – input placeholder
 *   type          – 'city' | 'address' | 'clinic'  (default: 'city')
 *   leading       – optional element rendered left of the input (icon etc.)
 *   inputStyle    – extra styles for the input container
 */
export default function PlaceAutocomplete({
  value,
  onChangeText,
  onSelect,
  placeholder,
  type = 'city',
  leading,
  inputStyle,
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const timer = useRef(null);

  const fetch_ = type === 'clinic'
    ? fetchClinics
    : type === 'address'
    ? fetchAddress
    : fetchCities;

  const handleChange = text => {
    onChangeText(text);
    setSuggestions([]);
    if (timer.current) clearTimeout(timer.current);
    if (text.length < 2) { setLoading(false); return; }
    setLoading(true);
    timer.current = setTimeout(async () => {
      const results = await fetch_(text).catch(() => []);
      setSuggestions(results);
      setLoading(false);
    }, 380);
  };

  const handleSelect = item => {
    onChangeText(item.label);
    if (onSelect) onSelect(item);
    setSuggestions([]);
  };

  return (
    <View style={{ zIndex: 10 }}>
      <View style={[pc.inputRow, inputStyle]}>
        {leading ? <View style={pc.leadingWrap}>{leading}</View> : null}
        <TextInput
          value={value}
          onChangeText={handleChange}
          placeholder={placeholder}
          placeholderTextColor={C.mutedSoft}
          style={pc.inputText}
          autoCapitalize="words"
        />
        {loading && (
          <ActivityIndicator size="small" color={C.muted} style={{ marginLeft: 6 }} />
        )}
      </View>

      {suggestions.length > 0 && (
        <View style={pc.dropdown}>
          {suggestions.map((s, i) => (
            <TouchableOpacity
              key={i}
              style={[pc.row, i < suggestions.length - 1 && pc.rowBorder]}
              onPress={() => handleSelect(s)}
              activeOpacity={0.7}
            >
              <Text style={pc.rowText} numberOfLines={1}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const pc = StyleSheet.create({
  inputRow: {
    height: 50, borderRadius: 13, borderWidth: 1, borderColor: C.line,
    backgroundColor: '#fff', paddingHorizontal: 14,
    flexDirection: 'row', alignItems: 'center',
  },
  leadingWrap: { marginRight: 8, width: 20, alignItems: 'center' },
  inputText: { flex: 1, fontSize: 15, color: C.ink, letterSpacing: -0.15 },
  dropdown: {
    position: 'absolute', top: 52, left: 0, right: 0, zIndex: 999,
    backgroundColor: '#fff', borderRadius: 12,
    borderWidth: 1, borderColor: C.line,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 10, elevation: 10,
    overflow: 'hidden',
  },
  row: { paddingVertical: 12, paddingHorizontal: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: C.line },
  rowText: { fontSize: 13.5, color: C.ink, letterSpacing: -0.1 },
});
