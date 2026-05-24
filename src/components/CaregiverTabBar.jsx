import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

const C = {
  cream: '#F6F1EA', forestDeep: '#15302C', muted: '#6B6862',
  line: '#E8E0D2',
};

function IHome({ color }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <Path d="M2 7l6-5 6 5v7a1 1 0 01-1 1H3a1 1 0 01-1-1V7z" stroke={color} strokeWidth={1.4} strokeLinejoin="round" />
    </Svg>
  );
}
function IPerson({ color }) {
  return (
    <Svg width={14} height={16} viewBox="0 0 14 16" fill="none">
      <Circle cx={7} cy={4.5} r={3} stroke={color} strokeWidth={1.4} />
      <Path d="M1 15c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
    </Svg>
  );
}
function IPulse({ color }) {
  return (
    <Svg width={16} height={14} viewBox="0 0 16 14" fill="none">
      <Path d="M1 7h2.5L5 1l3 12 2-7 1.5 5H15" stroke={color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const TABS = [
  { label: 'Today',    screen: 'CaregiverToday',    Icon: IHome },
  { label: 'Profile',  screen: 'CaregiverProfile',  Icon: IPerson },
  { label: 'Activity', screen: 'CaregiverActivity', Icon: IPulse },
];

export default function CaregiverTabBar({ active, navigation }) {
  return (
    <View style={s.wrap}>
      <View style={s.bar}>
        {TABS.map((t, i) => {
          const isActive = i === active;
          const { Icon } = t;
          return (
            <TouchableOpacity
              key={t.label}
              style={s.item}
              onPress={() => {
        if (i === active) return;
        navigation.popToTop();
        if (t.screen !== 'CaregiverToday') {
          navigation.navigate(t.screen);
        }
      }}
              activeOpacity={0.7}
            >
              <Icon color={isActive ? C.forestDeep : C.muted} />
              <Text style={[s.label, isActive && s.labelActive]}>{t.label}</Text>
              <View style={[s.dot, isActive && s.dotActive]} />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingBottom: 22, paddingTop: 10,
  },
  bar: {
    marginHorizontal: 16, height: 64, borderRadius: 22,
    backgroundColor: '#fff', borderWidth: 1, borderColor: C.line,
    shadowColor: 'rgba(31,61,56,0.06)', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1, shadowRadius: 24, elevation: 6,
    flexDirection: 'row', alignItems: 'center',
  },
  item: { flex: 1, alignItems: 'center', gap: 3 },
  label: { fontSize: 11, fontWeight: '500', color: C.muted, letterSpacing: -0.1 },
  labelActive: { color: C.forestDeep, fontWeight: '600' },
  dot: { width: 18, height: 2, borderRadius: 99, backgroundColor: 'transparent', marginTop: -2 },
  dotActive: { backgroundColor: C.forestDeep },
});
