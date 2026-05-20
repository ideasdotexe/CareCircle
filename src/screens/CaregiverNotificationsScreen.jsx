import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Path, Circle } from 'react-native-svg';
import { supabase } from '../lib/supabase';
import { colors } from '../theme';

const C = {
  cream: '#F6F1EA', ink: '#1A1F1D', forest: '#1F3D38', forestDeep: '#15302C',
  terracotta: '#C66E4E', terracottaSoft: '#E9CFC1', sageSoft: '#DDE4D6',
  muted: '#6B6862', mutedSoft: '#9A968F', line: '#E8E0D2', lineSoft: '#EFE8DA',
};

function IBack() {
  return (
    <Svg width={9} height={16} viewBox="0 0 9 16" fill="none">
      <Path d="M8 1L1 8l7 7" stroke={C.ink} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ICheck() {
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
      <Path d="M2 7l4 4 6-6" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function IClose() {
  return (
    <Svg width={12} height={12} viewBox="0 0 12 12" fill="none">
      <Path d="M2 2l8 8M10 2l-8 8" stroke={C.terracotta} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function timeAgo(ts) {
  if (!ts) return '';
  const diff = (Date.now() - new Date(ts).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function RequestCard({ req, onAccept, onReject }) {
  const [acting, setActing] = useState(false);

  const handle = async (action) => {
    setActing(true);
    await (action === 'accept' ? onAccept(req) : onReject(req));
    setActing(false);
  };

  return (
    <View style={s.requestCard}>
      <View style={s.requestHeader}>
        <View style={s.requestAvatar}>
          <Text style={s.requestAvatarText}>
            {(req.owner_name || req.owner_email || '?')[0].toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.requestTitle}>Care request</Text>
          <Text style={s.requestSub} numberOfLines={1}>
            From {req.owner_name || req.owner_email || 'a family'}
          </Text>
        </View>
        <Text style={s.requestTime}>{timeAgo(req.created_at)}</Text>
      </View>
      {!!req.message && (
        <Text style={s.requestMsg} numberOfLines={2}>{req.message}</Text>
      )}
      <View style={s.requestActions}>
        <TouchableOpacity
          style={[s.rejectBtn, acting && { opacity: 0.5 }]}
          onPress={() => handle('reject')}
          disabled={acting}
          activeOpacity={0.8}
        >
          <IClose />
          <Text style={s.rejectBtnText}>Decline</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.acceptBtn, acting && { opacity: 0.5 }]}
          onPress={() => handle('accept')}
          disabled={acting}
          activeOpacity={0.8}
        >
          {acting ? <ActivityIndicator color="#fff" size="small" /> : (
            <>
              <ICheck />
              <Text style={s.acceptBtnText}>Accept</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ActivityRow({ item, isLast }) {
  const icons = {
    medication: '💊',
    vitals: '📊',
    note: '📝',
    appointment: '📅',
    document: '📄',
  };
  return (
    <View style={[s.actRow, !isLast && s.actRowBorder]}>
      <View style={s.actDot}>
        <Text style={{ fontSize: 13 }}>{icons[item.activity_type] || '🔔'}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.actTitle}>{item.title || item.activity_type}</Text>
        {!!item.note && <Text style={s.actNote} numberOfLines={1}>{item.note}</Text>}
      </View>
      <Text style={s.actTime}>{timeAgo(item.created_at)}</Text>
    </View>
  );
}

export default function CaregiverNotificationsScreen({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Pending requests — two separate queries, merge results
      const userEmail = (user.email || '').toLowerCase();

      const [{ data: byId }, { data: byEmail }] = await Promise.all([
        supabase
          .from('caregiver_requests')
          .select('*')
          .eq('caregiver_id', user.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false }),
        supabase
          .from('caregiver_requests')
          .select('*')
          .eq('caregiver_email', userEmail)
          .eq('status', 'pending')
          .order('created_at', { ascending: false }),
      ]);

      // Merge + deduplicate by id
      const seen = new Set();
      const reqs = [...(byId || []), ...(byEmail || [])]
        .filter(r => !seen.has(r.id) && seen.add(r.id))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      // Backfill caregiver_id on email-matched rows
      const unlinked = reqs.filter(r => !r.caregiver_id);
      if (unlinked.length) {
        await Promise.all(unlinked.map(r =>
          supabase.from('caregiver_requests')
            .update({ caregiver_id: user.id })
            .eq('id', r.id)
            .catch(() => {})
        ));
      }

      // Enrich with owner name
      if (reqs?.length) {
        const ownerIds = [...new Set(reqs.map(r => r.owner_id).filter(Boolean))];
        const { data: owners } = ownerIds.length
          ? await supabase.from('profiles').select('id, full_name').in('id', ownerIds)
          : { data: [] };
        const ownerMap = {};
        (owners || []).forEach(o => {
          ownerMap[o.id] = o.full_name || '';
        });
        setRequests(reqs.map(r => ({ ...r, owner_name: ownerMap[r.owner_id] || '' })));
      } else {
        setRequests([]);
      }

      // In-app notifications from notifications table (best-effort)
      try {
        const { data: notifs } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);
        setNotifications(notifs || []);
      } catch (_) { setNotifications([]); }

      // Recent activity for assigned persons
      const { data: rels } = await supabase
        .from('caregiver_relationships')
        .select('person_id')
        .eq('caregiver_id', user.id)
        .neq('access_revoked', true);

      const personIds = (rels || []).map(r => r.person_id).filter(Boolean);
      if (personIds.length) {
        const { data: acts } = await supabase
          .from('activity_log')
          .select('*')
          .in('person_id', personIds)
          .order('created_at', { ascending: false })
          .limit(30);
        setActivity(acts || []);
      } else {
        setActivity([]);
      }
    } catch (_) {}
    finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const markNotifRead = async (id) => {
    try {
      await supabase.from('notifications').update({ read: true }).eq('id', id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (_) {}
  };

  const confirmAction = (message, onConfirm) => {
    if (Platform.OS === 'web') {
      if (window.confirm(message)) onConfirm();
    } else {
      Alert.alert('Confirm', message, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes', onPress: onConfirm },
      ]);
    }
  };

  const handleAccept = async (req) => {
    try {
      const caregiverId = req.caregiver_id || (await supabase.auth.getUser()).data.user?.id;
      // Accept this request and cancel all other pending ones from the same owner to prevent duplicates
      await supabase.from('caregiver_requests').update({ status: 'accepted' }).eq('id', req.id);
      await supabase
        .from('caregiver_requests')
        .update({ status: 'cancelled' })
        .eq('owner_id', req.owner_id)
        .eq('caregiver_email', (req.caregiver_email || '').toLowerCase())
        .eq('status', 'pending')
        .neq('id', req.id);
      // Try to create caregiver_relationships — may be blocked by RLS, owner will also write it on assign
      try {
        const { data: existing } = await supabase
          .from('caregiver_relationships')
          .select('id')
          .eq('caregiver_id', caregiverId)
          .eq('profile_owner_id', req.owner_id)
          .maybeSingle();
        if (!existing) {
          await supabase.from('caregiver_relationships').insert({
            caregiver_id: caregiverId,
            profile_owner_id: req.owner_id,
            person_id: req.person_id || null,
            role: req.role || 'caregiver',
            caregiver_email: req.caregiver_email || null,
            permissions: req.permissions || null,
            access_revoked: false,
          });
        }
      } catch (_) {}
      // Notify owner that request was accepted (best-effort)
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const { data: cgProfile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .maybeSingle();
        const cgName = cgProfile?.full_name || 'Your caregiver';
        await supabase.from('notifications').insert({
          user_id: req.owner_id,
          type: 'request_accepted',
          title: 'Care request accepted',
          body: `${cgName} has accepted your care request.`,
          data: { caregiver_id: user.id },
          read: false,
        });
      } catch (_) {}
      setRequests(prev => prev.filter(r => r.id !== req.id));
    } catch (e) {
      Alert.alert('Error', e.message || 'Could not accept request.');
    }
  };

  const handleReject = async (req) => {
    confirmAction('Decline this request?', async () => {
      try {
        await supabase.from('caregiver_requests').update({ status: 'rejected' }).eq('id', req.id);
        setRequests(prev => prev.filter(r => r.id !== req.id));
      } catch (e) {
        Alert.alert('Error', e.message || 'Could not decline request.');
      }
    });
  };

  const unreadNotifs = notifications.filter(n => !n.read && n.type !== 'care_request'); // care_request shown as cards

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.modeStrip} />
      <View style={s.topBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <IBack />
        </TouchableOpacity>
        <Text style={s.topTitle}>Notifications</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <ActivityIndicator color={C.forest} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>

          {/* ── Pending requests ── */}
          {requests.length > 0 && (
            <View style={{ marginBottom: 24 }}>
              <Text style={s.groupLabel}>Care requests</Text>
              {requests.map(req => (
                <RequestCard key={req.id} req={req} onAccept={handleAccept} onReject={handleReject} />
              ))}
            </View>
          )}

          {/* ── Other notifications ── */}
          {unreadNotifs.length > 0 && (
            <View style={{ marginBottom: 24 }}>
              <Text style={s.groupLabel}>Notifications</Text>
              <View style={s.card}>
                {unreadNotifs.map((n, i) => (
                  <TouchableOpacity
                    key={n.id}
                    style={[s.notifRow, i < unreadNotifs.length - 1 && s.actRowBorder]}
                    onPress={() => markNotifRead(n.id)}
                    activeOpacity={0.75}
                  >
                    <View style={[s.actDot, { backgroundColor: n.read ? C.cream : '#DDE4D6' }]}>
                      <Text style={{ fontSize: 14 }}>🔔</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.actTitle}>{n.title}</Text>
                      {!!n.body && <Text style={s.actNote} numberOfLines={2}>{n.body}</Text>}
                    </View>
                    <Text style={s.actTime}>{timeAgo(n.created_at)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* ── Activity feed ── */}
          <Text style={s.groupLabel}>Recent activity</Text>
          {activity.length === 0 ? (
            <View style={s.emptyCard}>
              <Text style={s.emptyText}>No recent activity yet.</Text>
              <Text style={s.emptySub}>Updates from your assigned people will appear here.</Text>
            </View>
          ) : (
            <View style={s.card}>
              {activity.map((item, i) => (
                <ActivityRow key={item.id || i} item={item} isLast={i === activity.length - 1} />
              ))}
            </View>
          )}

          {requests.length === 0 && activity.length === 0 && unreadNotifs.length === 0 && (
            <View style={s.emptyCard}>
              <Text style={s.emptyText}>All caught up</Text>
              <Text style={s.emptySub}>New care requests and activity updates will appear here.</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.cream },
  modeStrip: { height: 4, backgroundColor: C.terracotta, opacity: 0.85 },
  topBar: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: C.lineSoft, backgroundColor: C.cream },
  backBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
  topTitle: { fontFamily: 'Georgia', fontSize: 17, color: C.forestDeep, fontWeight: '500' },
  groupLabel: { fontSize: 11, fontWeight: '700', color: C.muted, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 },
  // Request card
  requestCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: C.line, padding: 16, marginBottom: 10 },
  requestHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  requestAvatar: { width: 40, height: 40, borderRadius: 12, backgroundColor: C.forestDeep, alignItems: 'center', justifyContent: 'center' },
  requestAvatarText: { color: '#fff', fontFamily: 'Georgia', fontSize: 16, fontWeight: '500' },
  requestTitle: { fontSize: 14, fontWeight: '600', color: C.ink },
  requestSub: { fontSize: 11.5, color: C.muted, marginTop: 1 },
  requestTime: { fontSize: 10.5, color: C.mutedSoft },
  requestMsg: { fontSize: 12.5, color: C.muted, marginBottom: 12, lineHeight: 18, backgroundColor: C.cream, borderRadius: 8, padding: 10 },
  requestActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  rejectBtn: { flex: 1, height: 40, borderRadius: 10, borderWidth: 1, borderColor: '#F0D0C8', backgroundColor: '#FDF4F2', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  rejectBtnText: { fontSize: 13, color: C.terracotta, fontWeight: '600' },
  acceptBtn: { flex: 1, height: 40, borderRadius: 10, backgroundColor: C.forestDeep, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  acceptBtnText: { fontSize: 13, color: '#fff', fontWeight: '600' },
  // Activity
  card: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: C.line, overflow: 'hidden' },
  notifRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, paddingHorizontal: 16 },
  actRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, paddingHorizontal: 16 },
  actRowBorder: { borderBottomWidth: 1, borderBottomColor: C.lineSoft },
  actDot: { width: 34, height: 34, borderRadius: 10, backgroundColor: C.cream, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  actTitle: { fontSize: 13.5, fontWeight: '500', color: C.ink },
  actNote: { fontSize: 11.5, color: C.muted, marginTop: 2 },
  actTime: { fontSize: 10.5, color: C.mutedSoft, flexShrink: 0 },
  // Empty
  emptyCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: C.line, padding: 28, alignItems: 'center' },
  emptyText: { fontFamily: 'Georgia', fontSize: 16, color: C.forestDeep, fontWeight: '500' },
  emptySub: { marginTop: 6, fontSize: 12.5, color: C.muted, textAlign: 'center', lineHeight: 18 },
});
