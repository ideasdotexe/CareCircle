import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { supabase } from '../lib/supabase';

const C = {
  cream: '#F6F1EA', ink: '#1A1F1D', forest: '#1F3D38', forestDeep: '#15302C',
  terracotta: '#C66E4E', terracottaSoft: '#E9CFC1', sageSoft: '#DDE4D6',
  muted: '#6B6862', mutedSoft: '#9A968F', line: '#E8E0D2', lineSoft: '#EFE8DA',
};

// ── Icons ─────────────────────────────────────────────────────────────────────

function IBack() {
  return (
    <Svg width={9} height={16} viewBox="0 0 9 16" fill="none">
      <Path d="M8 1L1 8l7 7" stroke={C.ink} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function ICheck() {
  return (
    <Svg width={12} height={10} viewBox="0 0 12 10" fill="none">
      <Path d="M1 5l3 3 7-7" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IClose() {
  return (
    <Svg width={10} height={10} viewBox="0 0 10 10" fill="none">
      <Path d="M2 2l6 6M8 2l-6 6" stroke={C.terracotta} strokeWidth={1.7} strokeLinecap="round" />
    </Svg>
  );
}
function IPill() {
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
      <Rect x="1" y="4.5" width="12" height="5" rx="2.5" stroke={C.forest} strokeWidth={1.3} />
      <Path d="M7 4.5v5" stroke={C.forest} strokeWidth={1.3} />
    </Svg>
  );
}
function IPulse() {
  return (
    <Svg width={14} height={12} viewBox="0 0 14 12" fill="none">
      <Path d="M1 6h2.5L5 1l3 10 1.5-5H13" stroke={C.forest} strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function INote() {
  return (
    <Svg width={13} height={14} viewBox="0 0 13 14" fill="none">
      <Path d="M1.5 1h7l3.5 3.5V13h-10.5V1z" stroke={C.forest} strokeWidth={1.3} strokeLinejoin="round" />
      <Path d="M4 7h5M4 10h4" stroke={C.forest} strokeWidth={1.3} strokeLinecap="round" />
    </Svg>
  );
}
function ICalendar() {
  return (
    <Svg width={13} height={14} viewBox="0 0 14 14" fill="none">
      <Rect x="1" y="2" width="12" height="11" rx="2" stroke={C.forest} strokeWidth={1.3} />
      <Path d="M5 1v2M9 1v2M1 6h12" stroke={C.forest} strokeWidth={1.3} strokeLinecap="round" />
    </Svg>
  );
}
function IDoc() {
  return (
    <Svg width={13} height={14} viewBox="0 0 13 14" fill="none">
      <Path d="M1.5 1h6.5l3.5 3.5V13h-10V1z" stroke={C.forest} strokeWidth={1.3} strokeLinejoin="round" />
    </Svg>
  );
}
function IBell() {
  return (
    <Svg width={14} height={15} viewBox="0 0 16 18" fill="none">
      <Path d="M8 1.5v1.5M3 7a5 5 0 1110 0v3l1 2.5H2L3 10V7z" stroke={C.forest} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
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

function getInitials(name) {
  if (!name) return '?';
  return name.split(/\s+/).map(w => w[0]).filter(Boolean).join('').slice(0, 2).toUpperCase();
}

// ── Activity type → icon config ───────────────────────────────────────────────

const ACT_META = {
  medication:  { Icon: IPill,     bg: '#E9DEC4', fg: C.forest },
  vitals:      { Icon: IPulse,    bg: C.sageSoft, fg: C.forest },
  note:        { Icon: INote,     bg: C.terracottaSoft, fg: C.terracotta },
  visit:       { Icon: INote,     bg: C.terracottaSoft, fg: C.terracotta },
  appointment: { Icon: ICalendar, bg: C.sageSoft, fg: C.forest },
  document:    { Icon: IDoc,      bg: C.lineSoft, fg: C.muted },
};

function actMeta(type) {
  return ACT_META[type] || { Icon: IBell, bg: C.cream, fg: C.muted };
}

// ── Section label ─────────────────────────────────────────────────────────────

function SectionLabel({ title, count }) {
  return (
    <View style={s.sectionLabelRow}>
      <Text style={s.sectionLabelText}>{title}</Text>
      {count != null && (
        <Text style={s.sectionLabelCount}>{String(count).padStart(2, '0')}</Text>
      )}
    </View>
  );
}

// ── Request card ──────────────────────────────────────────────────────────────

function RequestCard({ req, onAccept, onReject }) {
  const [acting, setActing] = useState(false);

  const handle = async (action) => {
    setActing(true);
    await (action === 'accept' ? onAccept(req) : onReject(req));
    setActing(false);
  };

  const initials = getInitials(req.owner_name || req.owner_email || '?');
  const tints = ['#3F5D54', '#C66E4E', '#7A6650', '#2E4942'];
  const tint = tints[(initials.charCodeAt(0) || 0) % tints.length];

  return (
    <View style={s.reqCard}>
      {/* Header */}
      <View style={s.reqHeader}>
        <View style={[s.reqAvatar, { backgroundColor: tint }]}>
          <Text style={s.reqAvatarText}>{initials}</Text>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={s.reqName} numberOfLines={1}>
            {req.owner_name || req.owner_email || 'Someone'}
          </Text>
          <Text style={s.reqSub} numberOfLines={1}>
            Invited you to help care{req.person_name ? ` for ${req.person_name}` : ''}
          </Text>
        </View>
        <Text style={s.reqTime}>{timeAgo(req.created_at)}</Text>
      </View>

      {/* Message */}
      {!!req.message && (
        <View style={s.reqMsgBox}>
          <Text style={s.reqMsgText} numberOfLines={3}>{req.message}</Text>
        </View>
      )}

      {/* Actions */}
      <View style={s.reqActions}>
        <TouchableOpacity
          style={[s.declineBtn, acting && { opacity: 0.5 }]}
          onPress={() => handle('reject')}
          disabled={acting}
          activeOpacity={0.75}
        >
          <IClose />
          <Text style={s.declineBtnText}>Decline</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.acceptBtn, acting && { opacity: 0.5 }]}
          onPress={() => handle('accept')}
          disabled={acting}
          activeOpacity={0.75}
        >
          {acting
            ? <ActivityIndicator color="#fff" size="small" />
            : (<><ICheck /><Text style={s.acceptBtnText}>Accept</Text></>)
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Activity feed item (FeedItem design) ──────────────────────────────────────

function FeedItem({ item, isLast }) {
  const meta = actMeta(item.activity_type);
  const { Icon, bg } = meta;
  const initials = getInitials(item.actor_name || item.logged_by_name || '');
  const tints = ['#3F5D54', '#C66E4E', '#7A6650', '#2E4942'];
  const tint = tints[(initials.charCodeAt(0) || 65) % tints.length];
  const title = item.title || item.activity_type || 'Update';
  const detail = item.note || item.detail || '';

  return (
    <View style={[s.feedRow, isLast && { paddingBottom: 0 }]}>
      {/* Spine column */}
      <View style={s.feedSpine}>
        <View style={[s.feedAvatar, { backgroundColor: tint }]}>
          <Text style={s.feedAvatarText}>{initials || '?'}</Text>
        </View>
        {!isLast && <View style={s.feedLine} />}
      </View>

      {/* Content card */}
      <View style={s.feedCard}>
        <View style={s.feedCardTop}>
          <View style={[s.feedIconBadge, { backgroundColor: bg }]}>
            <Icon />
          </View>
          <Text style={s.feedWho} numberOfLines={1}>
            <Text style={{ color: C.ink, fontWeight: '600' }}>
              {item.actor_name || item.logged_by_name || 'Someone'}
            </Text>
            {'  ·  '}{timeAgo(item.created_at)}
          </Text>
        </View>
        <Text style={s.feedSummary}>{title}</Text>
        {!!detail && (
          <Text style={s.feedDetail} numberOfLines={2}>{detail}</Text>
        )}
      </View>
    </View>
  );
}

// ── Notification row ──────────────────────────────────────────────────────────

function NotifRow({ item, onRead, isLast }) {
  return (
    <TouchableOpacity
      style={[s.notifRow, !isLast && s.rowBorder]}
      onPress={() => onRead(item.id)}
      activeOpacity={0.75}
    >
      <View style={[s.notifDot, { backgroundColor: item.read ? C.cream : C.sageSoft }]}>
        <IBell />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.notifTitle}>{item.title}</Text>
        {!!item.body && <Text style={s.notifBody} numberOfLines={2}>{item.body}</Text>}
      </View>
      <Text style={s.notifTime}>{timeAgo(item.created_at)}</Text>
    </TouchableOpacity>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function CaregiverNotificationsScreen({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const userEmail = (user.email || '').toLowerCase();

      // Try SECURITY DEFINER RPC first — bypasses caregiver_requests RLS entirely
      let byId = null, byEmail = null;
      try {
        const { data: rpcData, error: rpcErr } = await supabase
          .rpc('get_caregiver_requests', { p_email: userEmail, p_caregiver_id: user.id });
        if (!rpcErr && rpcData) {
          byId = rpcData;
        }
      } catch (_) {}

      // Fallback to direct queries if RPC not available
      if (!byId) {
        const [res1, res2] = await Promise.all([
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
        if (res1.error || res2.error) {
          console.warn('caregiver_requests RLS error:', res1.error?.message || res2.error?.message);
        }
        byId = res1.data;
        byEmail = res2.data;
      }

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
        unlinked.forEach(r => { r.caregiver_id = user.id; });
      }

      if (reqs.length) {
        const personIds  = [...new Set(reqs.map(r => r.person_id).filter(Boolean))];
        // For old requests where owner_name wasn't stored, fall back to profiles query
        const missingOwnerIds = [...new Set(
          reqs.filter(r => !r.owner_name).map(r => r.owner_id).filter(Boolean)
        )];

        const [personsResult, ownersResult] = await Promise.all([
          personIds.length
            ? supabase.from('persons').select('id, name').in('id', personIds)
            : Promise.resolve({ data: [] }),
          missingOwnerIds.length
            ? supabase.from('profiles').select('id, full_name').in('id', missingOwnerIds)
            : Promise.resolve({ data: [] }),
        ]);

        const personMap = {};
        const ownerMap  = {};
        (personsResult.data || []).forEach(p => { personMap[p.id] = p.name || ''; });
        (ownersResult.data  || []).forEach(o => { ownerMap[o.id]  = o.full_name || ''; });

        setRequests(reqs.map(r => ({
          ...r,
          owner_name:  r.owner_name || ownerMap[r.owner_id] || '',
          person_name: personMap[r.person_id] || '',
        })));
      } else {
        setRequests([]);
      }

      // In-app notifications
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
      const { data: { user } } = await supabase.auth.getUser();
      const caregiverId = user?.id;  // Always use current user's id

      // Fetch own name up-front so we can store it in the relationship row
      let cgName = '';
      try {
        const { data: cgProfile } = await supabase
          .from('profiles').select('full_name').eq('id', user?.id).maybeSingle();
        cgName = cgProfile?.full_name || '';
      } catch (_) {}

      // Accept and ensure caregiver_id is set to current user
      await supabase.from('caregiver_requests')
        .update({ status: 'accepted', caregiver_id: caregiverId })
        .eq('id', req.id);

      await supabase
        .from('caregiver_requests')
        .update({ status: 'cancelled' })
        .eq('owner_id', req.owner_id)
        .eq('caregiver_email', (req.caregiver_email || '').toLowerCase())
        .eq('status', 'pending')
        .neq('id', req.id);

      if (req.person_id && caregiverId) {
        try {
          const { data: existing } = await supabase
            .from('caregiver_relationships')
            .select('id')
            .eq('caregiver_id', caregiverId)
            .eq('person_id', req.person_id)
            .maybeSingle();

          if (!existing) {
            await supabase.from('caregiver_relationships').insert({
              caregiver_id: caregiverId,
              profile_owner_id: req.owner_id,
              person_id: req.person_id,
              role: req.role || 'caregiver',
              caregiver_name: cgName,
              caregiver_email: req.caregiver_email || '',
              permissions: req.permissions || {},
              access_revoked: false,
            });
          } else {
            await supabase.from('caregiver_relationships')
              .update({ access_revoked: false, permissions: req.permissions || {}, caregiver_name: cgName })
              .eq('id', existing.id)
              .catch(() => {});
          }
        } catch (relErr) {
          console.warn('caregiver_relationships insert failed:', relErr?.message);
        }
      }

      // Notify the owner
      try {
        await supabase.from('notifications').insert({
          user_id: req.owner_id,
          type: 'request_accepted',
          title: 'Care request accepted',
          body: `${cgName || 'Your caregiver'} has accepted your care request.`,
          data: { caregiver_id: user?.id },
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

  const unreadNotifs = notifications.filter(n => !n.read && n.type !== 'care_request');
  const isEmpty = requests.length === 0 && activity.length === 0 && unreadNotifs.length === 0;

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* Caregiver mode strip */}
      <View style={s.modeStrip} />

      {/* Top bar */}
      <View style={s.topBar}>
        <TouchableOpacity style={s.backPill} onPress={() => navigation.goBack()}>
          <IBack />
        </TouchableOpacity>
        <Text style={s.topTitle}>Notifications</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <ActivityIndicator color={C.forest} style={{ marginTop: 48 }} />
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Care requests ── */}
          {requests.length > 0 && (
            <View style={s.section}>
              <SectionLabel title="Care requests" count={requests.length} />
              {requests.map(req => (
                <RequestCard key={req.id} req={req} onAccept={handleAccept} onReject={handleReject} />
              ))}
            </View>
          )}

          {/* ── Notifications ── */}
          {unreadNotifs.length > 0 && (
            <View style={s.section}>
              <SectionLabel title="Notifications" count={unreadNotifs.length} />
              <View style={s.listCard}>
                {unreadNotifs.map((n, i) => (
                  <NotifRow
                    key={n.id}
                    item={n}
                    onRead={markNotifRead}
                    isLast={i === unreadNotifs.length - 1}
                  />
                ))}
              </View>
            </View>
          )}

          {/* ── Recent activity ── */}
          {activity.length > 0 && (
            <View style={s.section}>
              <SectionLabel title="Recent activity" />
              <View style={s.feedList}>
                {activity.map((item, i) => (
                  <FeedItem key={item.id || i} item={item} isLast={i === activity.length - 1} />
                ))}
              </View>
            </View>
          )}

          {/* ── Empty ── */}
          {isEmpty && (
            <View style={s.emptyCard}>
              <View style={s.emptyIconBox}>
                <IBell />
              </View>
              <Text style={s.emptyTitle}>All caught up</Text>
              <Text style={s.emptySub}>
                New care requests and updates from your assigned people will appear here.
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container:   { flex: 1, backgroundColor: C.cream },
  modeStrip:   { height: 4, backgroundColor: C.terracotta, opacity: 0.85 },
  topBar: {
    paddingHorizontal: 20, paddingTop: 14, paddingBottom: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  backPill: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: '#fff', borderWidth: 1, borderColor: C.line,
    alignItems: 'center', justifyContent: 'center',
  },
  topTitle: { fontFamily: 'Georgia', fontSize: 16, color: C.forestDeep, fontWeight: '500', letterSpacing: -0.2 },

  scroll: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 60 },
  section: { marginBottom: 28 },

  sectionLabelRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 12 },
  sectionLabelText: { fontFamily: 'Georgia', fontSize: 17, color: C.forestDeep, fontWeight: '500', letterSpacing: -0.3 },
  sectionLabelCount: { fontSize: 11, color: C.muted, fontVariant: ['tabular-nums'], letterSpacing: 0.4 },

  // Request card
  reqCard: {
    backgroundColor: '#fff', borderRadius: 16,
    borderWidth: 1, borderColor: C.line,
    padding: 14, marginBottom: 8,
  },
  reqHeader:     { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  reqAvatar:     { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  reqAvatarText: { color: '#fff', fontFamily: 'Georgia', fontSize: 17, fontWeight: '500' },
  reqName:       { fontSize: 14.5, fontWeight: '600', color: C.ink, letterSpacing: -0.1 },
  reqSub:        { fontSize: 11.5, color: C.muted, marginTop: 2 },
  reqTime:       { fontSize: 10.5, color: C.mutedSoft, flexShrink: 0, alignSelf: 'flex-start' },
  reqMsgBox:     { backgroundColor: C.cream, borderRadius: 10, padding: 10, marginBottom: 12 },
  reqMsgText:    { fontSize: 12.5, color: C.muted, lineHeight: 18 },
  reqActions:    { flexDirection: 'row', gap: 8, paddingTop: 10, borderTopWidth: 1, borderTopColor: C.lineSoft },
  declineBtn:    { flex: 1, height: 40, borderRadius: 12, borderWidth: 1.5, borderColor: '#F0D0C8', backgroundColor: '#FDF4F2', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  declineBtnText:{ fontSize: 13, color: C.terracotta, fontWeight: '600' },
  acceptBtn:     { flex: 1, height: 40, borderRadius: 12, backgroundColor: C.forestDeep, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  acceptBtnText: { fontSize: 13, color: '#fff', fontWeight: '600' },

  // Notification rows
  listCard:  { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: C.line, overflow: 'hidden' },
  notifRow:  { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: C.lineSoft },
  notifDot:  { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  notifTitle:{ fontSize: 13.5, fontWeight: '500', color: C.ink },
  notifBody: { fontSize: 11.5, color: C.muted, marginTop: 2, lineHeight: 16 },
  notifTime: { fontSize: 10.5, color: C.mutedSoft, flexShrink: 0 },

  // Feed items (avatar + spine + card)
  feedList: { gap: 0 },
  feedRow:  { flexDirection: 'row', gap: 12, paddingBottom: 12, position: 'relative' },
  feedSpine: { width: 38, flexShrink: 0, alignItems: 'center' },
  feedAvatar: { width: 36, height: 36, borderRadius: 99, alignItems: 'center', justifyContent: 'center' },
  feedAvatarText: { color: '#fff', fontFamily: 'Georgia', fontSize: 13, fontWeight: '500' },
  feedLine:  { position: 'absolute', top: 38, bottom: -12, width: 1.5, backgroundColor: C.line },
  feedCard:  { flex: 1, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: C.line, padding: 12 },
  feedCardTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  feedIconBadge: { width: 22, height: 22, borderRadius: 6, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  feedWho:   { flex: 1, fontSize: 12, color: C.muted },
  feedSummary: { fontSize: 13.5, fontWeight: '600', color: C.ink, letterSpacing: -0.1 },
  feedDetail:  { marginTop: 4, fontSize: 12, color: C.muted, lineHeight: 16 },

  // Empty
  emptyCard:    { marginTop: 40, alignItems: 'center', padding: 32 },
  emptyIconBox: { width: 52, height: 52, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle:   { fontFamily: 'Georgia', fontSize: 18, color: C.forestDeep, fontWeight: '500', marginBottom: 8 },
  emptySub:     { fontSize: 13, color: C.muted, textAlign: 'center', lineHeight: 19, maxWidth: 280 },
});
