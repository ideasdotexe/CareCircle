import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Path, Circle, Rect, Polygon } from 'react-native-svg';
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
function IWarn() {
  return (
    <Svg width={11} height={11} viewBox="0 0 11 11" fill="none">
      <Polygon points="5.5,1 10,10 1,10" stroke="#fff" strokeWidth={1.2} fill="#fff" />
      <Path d="M5.5 4.5v2" stroke={C.terracotta} strokeWidth={1.2} strokeLinecap="round" />
      <Circle cx="5.5" cy="8" r="0.5" fill={C.terracotta} />
    </Svg>
  );
}
function IClock() {
  return (
    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={C.muted} strokeWidth={1.8} />
      <Path d="M12 7v5l3 3" stroke={C.muted} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function timeAgo(ts) {
  if (!ts) return '';
  const diff = (Date.now() - new Date(ts).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  const days = Math.floor(diff / 86400);
  return days === 1 ? 'yesterday' : `${days}d ago`;
}

function getInitials(name) {
  if (!name) return '?';
  return name.split(/\s+/).map(w => w[0]).filter(Boolean).join('').slice(0, 2).toUpperCase();
}

const ACT_META = {
  medication:  { Icon: IPill,     bg: '#E9DEC4' },
  vitals:      { Icon: IPulse,    bg: C.sageSoft },
  note:        { Icon: INote,     bg: C.terracottaSoft },
  visit:       { Icon: INote,     bg: C.terracottaSoft },
  appointment: { Icon: ICalendar, bg: C.sageSoft },
  document:    { Icon: IDoc,      bg: C.lineSoft },
};
function actMeta(type) {
  return ACT_META[type] || { Icon: IBell, bg: C.cream };
}

const ACTOR_TINTS = ['#3F5D54', '#C66E4E', '#7A6650', '#2E4942'];
function actorTint(name) {
  const c = (name || '?').charCodeAt(0) || 65;
  return ACTOR_TINTS[c % ACTOR_TINTS.length];
}

// ── Section label ─────────────────────────────────────────────────────────────

function SectionLabel({ title, count, action, onAction }) {
  return (
    <View style={s.sectionRow}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
        <Text style={s.sectionTitle}>{title}</Text>
        {count != null && <Text style={s.sectionCount}>{String(count).padStart(2, '0')}</Text>}
      </View>
      {!!action && (
        <TouchableOpacity onPress={onAction}>
          <Text style={s.sectionAction}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── Date label ────────────────────────────────────────────────────────────────

function DateLabel({ label }) {
  return <Text style={s.dateLabel}>{label}</Text>;
}

// ── Pending invite card ───────────────────────────────────────────────────────

function PendingInviteCard({ req }) {
  const initials = getInitials(req.caregiver_name || req.caregiver_email || '?');
  const tint = actorTint(initials);

  return (
    <View style={[s.inviteCard, s.inviteCardDashed]}>
      <View style={s.inviteRow}>
        <View style={[s.inviteAvatar, { backgroundColor: tint }]}>
          <Text style={s.inviteAvatarText}>{initials}</Text>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={s.inviteNameRow}>
            <Text style={s.inviteName} numberOfLines={1}>
              {req.caregiver_name || req.caregiver_email || 'Caregiver'}
            </Text>
            <View style={s.pendingBadge}>
              <Text style={s.pendingBadgeText}>PENDING</Text>
            </View>
          </View>
          <Text style={s.inviteSub} numberOfLines={1}>
            {req.role || 'Caregiver'}{req.person_name ? ` · for ${req.person_name}` : ''}
          </Text>
        </View>
        <Text style={s.inviteTime}>{timeAgo(req.created_at)}</Text>
      </View>
      <View style={s.inviteFooter}>
        <IClock />
        <Text style={s.inviteFooterText}>Awaiting response · Sent {timeAgo(req.created_at)}</Text>
        <Text style={s.resendText}>Resend</Text>
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

// ── Feed item (avatar + spine + card) ─────────────────────────────────────────

function FeedItem({ item, isLast }) {
  const meta = actMeta(item.activity_type);
  const { Icon, bg } = meta;
  const actorName = item.actor_name || item.logged_by_name || '';
  const initials = getInitials(actorName);
  const tint = actorTint(actorName);
  const title = item.title || item.activity_type || 'Update';
  const detail = item.note || item.detail || '';

  return (
    <View style={[s.feedRow, isLast && { paddingBottom: 0 }]}>
      <View style={s.feedSpine}>
        <View style={[s.feedAvatar, { backgroundColor: tint }]}>
          <Text style={s.feedAvatarText}>{initials || '?'}</Text>
        </View>
        {!isLast && <View style={s.feedLine} />}
      </View>
      <View style={s.feedCard}>
        <View style={s.feedCardTop}>
          <View style={[s.feedIconBadge, { backgroundColor: bg }]}>
            <Icon />
          </View>
          <Text style={s.feedWho} numberOfLines={1}>
            <Text style={{ color: C.ink, fontWeight: '600' }}>{actorName || 'Someone'}</Text>
            {'  ·  '}{timeAgo(item.created_at)}
          </Text>
          {item.flagged && (
            <View style={s.flagBadge}><Text style={s.flagText}>FLAGGED</Text></View>
          )}
        </View>
        <Text style={s.feedSummary}>{title}</Text>
        {!!detail && <Text style={s.feedDetail} numberOfLines={2}>{detail}</Text>}
      </View>
    </View>
  );
}

// ── Awaiting review banner ────────────────────────────────────────────────────

function ReviewBanner({ count }) {
  if (!count) return null;
  return (
    <View style={s.reviewBanner}>
      <View style={s.reviewIconBox}>
        <IWarn />
      </View>
      <Text style={s.reviewText}>
        <Text style={{ fontWeight: '700' }}>{count} upload{count > 1 ? 's' : ''} awaiting your review.</Text>
        <Text style={{ color: 'rgba(255,255,255,0.65)' }}> Tap to review.</Text>
      </Text>
      <View style={s.reviewBtn}>
        <Text style={s.reviewBtnText}>Review</Text>
      </View>
    </View>
  );
}

// ── Group activity by date ────────────────────────────────────────────────────

function groupByDate(items) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);

  const groups = {};
  items.forEach(item => {
    const d = new Date(item.created_at); d.setHours(0, 0, 0, 0);
    let key;
    if (d.getTime() === today.getTime()) key = 'Today';
    else if (d.getTime() === yesterday.getTime()) key = 'Yesterday';
    else {
      const diff = Math.floor((today - d) / 86400000);
      key = diff < 7 ? 'This week' : 'Earlier';
    }
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });

  const ORDER = ['Today', 'Yesterday', 'This week', 'Earlier'];
  return ORDER.filter(k => groups[k]).map(k => ({ label: k, items: groups[k] }));
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function OwnerNotificationsScreen({ navigation }) {
  const [pendingInvites, setPendingInvites] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [awaitingReview, setAwaitingReview] = useState(0);

  const load = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Pending invites I sent (awaiting caregiver response)
      const { data: invites } = await supabase
        .from('caregiver_requests')
        .select('*')
        .eq('owner_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      // Enrich invites with person names
      const invitePersonIds = [...new Set((invites || []).map(r => r.person_id).filter(Boolean))];
      let personMap = {};
      if (invitePersonIds.length) {
        const { data: ps } = await supabase.from('persons').select('id, name').in('id', invitePersonIds);
        (ps || []).forEach(p => { personMap[p.id] = p.name; });
      }
      setPendingInvites((invites || []).map(r => ({
        ...r,
        person_name: personMap[r.person_id] || '',
      })));

      // In-app notifications for this owner
      try {
        const { data: notifs } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);
        setNotifications(notifs || []);
      } catch (_) { setNotifications([]); }

      // My persons' activity feed
      const { data: persons } = await supabase
        .from('persons')
        .select('id')
        .eq('owner_id', user.id);

      const personIds = (persons || []).map(p => p.id);
      if (personIds.length) {
        const { data: acts } = await supabase
          .from('activity_log')
          .select('*')
          .in('person_id', personIds)
          .order('created_at', { ascending: false })
          .limit(50);
        const actList = acts || [];
        setActivity(actList);
        setAwaitingReview(actList.filter(a => a.awaiting_review).length);
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

  const unreadNotifs = notifications.filter(n => !n.read);
  const actGroups = groupByDate(activity);
  const isEmpty = pendingInvites.length === 0 && unreadNotifs.length === 0 && activity.length === 0;

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* Top bar */}
      <View style={s.topBar}>
        <TouchableOpacity style={s.backPill} onPress={() => navigation.goBack()}>
          <IBack />
        </TouchableOpacity>
        <Text style={s.topTitle}>Activity</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Hero heading */}
      <View style={s.hero}>
        <Text style={s.heroTitle}>What's happening</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={C.forest} style={{ marginTop: 48 }} />
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Awaiting review banner ── */}
          <ReviewBanner count={awaitingReview} />

          {/* ── Pending invites ── */}
          {pendingInvites.length > 0 && (
            <View style={s.section}>
              <SectionLabel
                title="Pending invites"
                count={pendingInvites.length}
                action="Manage"
                onAction={() => navigation.navigate('CareScreen')}
              />
              {pendingInvites.map(req => (
                <PendingInviteCard key={req.id} req={req} />
              ))}
            </View>
          )}

          {/* ── In-app notifications ── */}
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

          {/* ── Activity timeline ── */}
          {actGroups.length > 0 && (
            <View style={s.section}>
              <SectionLabel title="Caregiver activity" />
              {actGroups.map(group => (
                <View key={group.label}>
                  <DateLabel label={group.label} />
                  <View style={s.feedList}>
                    {group.items.map((item, i) => (
                      <FeedItem
                        key={item.id || i}
                        item={item}
                        isLast={i === group.items.length - 1}
                      />
                    ))}
                  </View>
                  <View style={{ height: 16 }} />
                </View>
              ))}
            </View>
          )}

          {/* ── Empty ── */}
          {isEmpty && (
            <View style={s.emptyCard}>
              <View style={s.emptyIconBox}>
                <IBell />
              </View>
              <Text style={s.emptyTitle}>All quiet</Text>
              <Text style={s.emptySub}>
                Caregiver activity and pending invites will appear here.
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
  container: { flex: 1, backgroundColor: C.cream },

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

  hero:      { paddingHorizontal: 24, paddingBottom: 12 },
  heroTitle: { fontFamily: 'Georgia', fontSize: 26, color: C.forestDeep, fontWeight: '400', letterSpacing: -0.6, lineHeight: 30 },

  scroll: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 60 },
  section: { marginBottom: 28 },

  sectionRow:    { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle:  { fontFamily: 'Georgia', fontSize: 17, color: C.forestDeep, fontWeight: '500', letterSpacing: -0.3 },
  sectionCount:  { fontSize: 11, color: C.muted, letterSpacing: 0.4 },
  sectionAction: { fontSize: 12, color: C.forest, fontWeight: '500' },

  dateLabel: { fontSize: 10.5, color: C.muted, letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: '600', marginBottom: 10, paddingLeft: 2 },

  // Review banner
  reviewBanner:  { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.forestDeep, borderRadius: 14, padding: 12, marginBottom: 20 },
  reviewIconBox: { width: 26, height: 26, borderRadius: 8, backgroundColor: C.terracotta, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  reviewText:    { flex: 1, fontSize: 12, color: '#fff', lineHeight: 16 },
  reviewBtn:     { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.14)' },
  reviewBtnText: { fontSize: 11, color: '#fff', fontWeight: '600', letterSpacing: -0.1 },

  // Pending invite cards
  inviteCard:       { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: C.line, padding: 14, marginBottom: 8 },
  inviteCardDashed: { borderStyle: 'dashed' },
  inviteRow:        { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  inviteAvatar:     { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  inviteAvatarText: { color: '#fff', fontFamily: 'Georgia', fontSize: 17, fontWeight: '500' },
  inviteNameRow:    { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  inviteName:       { fontSize: 14.5, fontWeight: '600', color: C.ink, letterSpacing: -0.1 },
  pendingBadge:     { backgroundColor: C.terracottaSoft, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 99 },
  pendingBadgeText: { fontSize: 9.5, fontWeight: '700', color: '#7A3F2A', letterSpacing: 0.4, textTransform: 'uppercase' },
  inviteSub:        { fontSize: 11.5, color: C.muted, marginTop: 2 },
  inviteTime:       { fontSize: 10.5, color: C.mutedSoft, flexShrink: 0, alignSelf: 'flex-start' },
  inviteFooter:     { flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 10, borderTopWidth: 1, borderTopColor: C.lineSoft },
  inviteFooterText: { flex: 1, fontSize: 11, color: C.muted },
  resendText:       { fontSize: 11, color: C.terracotta, fontWeight: '600', letterSpacing: 0.2, textTransform: 'uppercase' },

  // Notification rows
  listCard:  { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: C.line, overflow: 'hidden' },
  notifRow:  { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: C.lineSoft },
  notifDot:  { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  notifTitle:{ fontSize: 13.5, fontWeight: '500', color: C.ink },
  notifBody: { fontSize: 11.5, color: C.muted, marginTop: 2, lineHeight: 16 },
  notifTime: { fontSize: 10.5, color: C.mutedSoft, flexShrink: 0 },

  // Feed
  feedList:   { gap: 0 },
  feedRow:    { flexDirection: 'row', gap: 12, paddingBottom: 12 },
  feedSpine:  { width: 38, flexShrink: 0, alignItems: 'center' },
  feedAvatar: { width: 36, height: 36, borderRadius: 99, alignItems: 'center', justifyContent: 'center' },
  feedAvatarText: { color: '#fff', fontFamily: 'Georgia', fontSize: 13, fontWeight: '500' },
  feedLine:   { position: 'absolute', top: 38, bottom: -12, width: 1.5, backgroundColor: C.line },
  feedCard:   { flex: 1, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: C.line, padding: 12 },
  feedCardTop:{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  feedIconBadge: { width: 22, height: 22, borderRadius: 6, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  feedWho:    { flex: 1, fontSize: 12, color: C.muted },
  feedSummary:{ fontSize: 13.5, fontWeight: '600', color: C.ink, letterSpacing: -0.1 },
  feedDetail: { marginTop: 4, fontSize: 12, color: C.muted, lineHeight: 16 },
  flagBadge:  { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 99, backgroundColor: '#FBE3D9' },
  flagText:   { fontSize: 9, fontWeight: '700', color: C.terracotta, letterSpacing: 0.4 },

  // Empty
  emptyCard:    { marginTop: 40, alignItems: 'center', padding: 32 },
  emptyIconBox: { width: 52, height: 52, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle:   { fontFamily: 'Georgia', fontSize: 18, color: C.forestDeep, fontWeight: '500', marginBottom: 8 },
  emptySub:     { fontSize: 13, color: C.muted, textAlign: 'center', lineHeight: 19, maxWidth: 280 },
});
