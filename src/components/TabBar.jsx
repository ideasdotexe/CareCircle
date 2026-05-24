import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme';
import { IconHome, IconPeople, IconUser, IconHeart } from './Icons';

const TABS = [
  { label: 'Home', screen: 'Dashboard', icon: IconHome },
  { label: 'People', screen: 'PeopleTab', icon: IconPeople },
  { label: 'Care', screen: 'CareScreen', icon: IconHeart },
  { label: 'You', screen: 'Account', icon: IconUser },
];

export default function TabBar({ active, navigation }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.bar}>
        {TABS.map((t, i) => {
          const isActive = i === active;
          const Ico = t.icon;
          return (
            <TouchableOpacity key={t.label} style={styles.item} onPress={() => {
              if (i === active) return;
              // Pop everything off the stack then navigate — prevents stale params leaking
              navigation.popToTop();
              if (t.screen !== 'Dashboard' && t.screen !== 'OwnerTabs') {
                navigation.navigate(t.screen);
              }
            }} activeOpacity={0.7}>
              <Ico color={isActive ? colors.forestDeep : colors.muted} />
              <Text style={[styles.label, isActive && styles.labelActive]}>{t.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingBottom: 24, paddingTop: 10, backgroundColor: 'transparent' },
  bar: { marginHorizontal: 16, height: 60, borderRadius: 22, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, shadowColor: 'rgba(31,61,56,0.06)', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 1, shadowRadius: 24, elevation: 6, flexDirection: 'row', alignItems: 'center' },
  item: { flex: 1, alignItems: 'center', gap: 3 },
  label: { fontSize: 10, fontWeight: '500', color: colors.muted, letterSpacing: 0.2 },
  labelActive: { color: colors.forestDeep, fontWeight: '600' },
});
