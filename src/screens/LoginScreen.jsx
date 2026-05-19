import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { colors } from '../theme';
import { CCLogo, IconApple, IconGoogle, IconMail, IconShield } from '../components/Icons';
import { supabase } from '../lib/supabase';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({ navigation }) {
  const [role, setRole] = useState('dear'); // 'dear' | 'pro'
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const isPro = role === 'pro';
  const heroTitle1 = isPro ? 'Care, kept' : 'Care,';
  const heroTitle2 = isPro ? 'on the record.' : 'kept close.';
  const heroSub = isPro
    ? 'Your roster, shift notes, and family channel — one calm tool for the work you do every day.'
    : 'One quiet place for the people you look after — medications, doctors, and what matters next.';

  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
    } catch (e) {
      Alert.alert('Sign in failed', e.message ?? 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (credential.identityToken) {
        await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: credential.identityToken,
        });
        // Save selected role
        try {
          await supabase.auth.updateUser({ data: { role: isPro ? 'caregiver' : 'owner' } });
        } catch (_) {}
      }
    } catch (e) {
      if (e.code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert('Apple sign in failed', e.message);
      }
    }
  };

  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    if (googleLoading) return;
    setGoogleLoading(true);
    try {
      if (Platform.OS === 'web') {
        // Web: full-page redirect — Supabase handles session from URL on return
        await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: window.location.origin },
        });
        return; // page will navigate away
      }

      // Mobile: in-app browser flow
      const redirectUri = AuthSession.makeRedirectUri({ native: 'carecircle://' });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: redirectUri, skipBrowserRedirect: true },
      });
      if (error || !data?.url) {
        Alert.alert('Sign-in error', error?.message ?? 'Could not start Google sign-in.');
        return;
      }

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);
      if (result.type !== 'success' || !result.url) return;

      const returnUrl = result.url;

      // Handle PKCE flow — code in query params
      if (returnUrl.includes('code=')) {
        const { error: exchErr } = await supabase.auth.exchangeCodeForSession(returnUrl);
        if (exchErr) {
          Alert.alert('Sign-in failed', exchErr.message);
          return;
        }
      } else if (returnUrl.includes('access_token=')) {
        // Handle implicit flow — tokens in URL hash
        const hash = returnUrl.split('#')[1] ?? returnUrl.split('?')[1] ?? '';
        const params = Object.fromEntries(new URLSearchParams(hash));
        if (params.access_token && params.refresh_token) {
          const { error: setErr } = await supabase.auth.setSession({
            access_token: params.access_token,
            refresh_token: params.refresh_token,
          });
          if (setErr) {
            Alert.alert('Sign-in failed', setErr.message);
            return;
          }
        }
      } else {
        Alert.alert('Sign-in failed', 'Unexpected response from Google. Please try again.');
        return;
      }

      // Save chosen role so RoleRouter knows where to land
      try {
        await supabase.auth.updateUser({ data: { role: isPro ? 'caregiver' : 'owner' } });
      } catch (_) {}

    } catch (e) {
      Alert.alert('Google sign-in failed', e.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleEmailNav = () => {
    navigation.navigate('EmailSignup', { role: isPro ? 'caregiver' : 'owner' });
  };

  if (showEmail) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ padding: 24 }}>
            <TouchableOpacity onPress={() => setShowEmail(false)} style={styles.backPill}>
              <Text style={{ fontSize: 14, color: colors.ink }}>{'<'} Back</Text>
            </TouchableOpacity>
            <Text style={styles.heroTitle}>Sign in</Text>
            <Text style={styles.heroSub}>{`Welcome back. Signing in as ${isPro ? 'a caregiver' : 'family'}.`}</Text>

            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="you@email.com"
              placeholderTextColor={colors.mutedSoft}
              style={styles.input}
            />
            <Text style={styles.fieldLabel}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor={colors.mutedSoft}
              style={styles.input}
            />
            <TouchableOpacity onPress={handleEmailLogin} style={styles.primaryBtn} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Sign in</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={handleEmailNav} style={{ marginTop: 16, alignItems: 'center' }}>
              <Text style={{ color: colors.forest, fontWeight: '600' }}>Create a new account</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.brand}>
        <CCLogo size={26} />
        <Text style={styles.brandText}>CareCircle</Text>
      </View>

      <View style={styles.heroWrap}>
        <Text style={styles.heroTitle}>{heroTitle1}{'\n'}{heroTitle2}</Text>
        <Text style={styles.heroSub}>{heroSub}</Text>
      </View>

      <View style={{ flex: 1 }} />

      <View style={{ paddingHorizontal: 24, paddingBottom: 14 }}>
        <Text style={styles.eyebrow}>I AM SIGNING IN AS</Text>
        <View style={styles.tabsRow}>
          {[
            { k: 'dear', label: 'Dear ones', sub: 'family' },
            { k: 'pro', label: 'Caregiver', sub: 'professional' },
          ].map(t => {
            const active = role === t.k;
            return (
              <TouchableOpacity key={t.k} onPress={() => setRole(t.k)} style={[styles.tabBtn, active && styles.tabBtnActive]}>
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{t.label}</Text>
                <Text style={[styles.tabSub, active && styles.tabSubActive]}>{t.sub.toUpperCase()}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={{ paddingHorizontal: 24, paddingBottom: 22 }}>
        {Platform.OS === 'ios' && (
          <TouchableOpacity onPress={handleAppleLogin} style={[styles.signBtn, { backgroundColor: colors.forestDeep }]}>
            <IconApple color="#fff" />
            <Text style={[styles.signBtnText, { color: '#fff' }]}>Continue with Apple</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={handleGoogleLogin} style={[styles.signBtn, styles.signBtnWhite]} disabled={googleLoading}>
          {googleLoading ? <ActivityIndicator size="small" color={colors.forest} /> : <IconGoogle />}
          <Text style={styles.signBtnText}>{googleLoading ? 'Signing in…' : 'Continue with Google'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowEmail(true)} style={[styles.signBtn, styles.signBtnOutline]}>
          <IconMail />
          <Text style={[styles.signBtnText, { color: colors.forest }]}>Continue with email</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleEmailNav} style={{ marginTop: 10, alignItems: 'center' }}>
          <Text style={styles.newHereText}>
            New here? <Text style={{ color: colors.forest, fontWeight: '600', textDecorationLine: 'underline' }}>Create an account</Text>
          </Text>
        </TouchableOpacity>

        <View style={styles.badge}>
          <IconShield />
          <Text style={styles.badgeText}>{isPro ? 'PHIPA-compliant · Stored in Canada' : 'Stored in Canada · Encrypted at rest'}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  brand: { paddingHorizontal: 28, paddingTop: 16, flexDirection: 'row', alignItems: 'center' },
  brandText: { marginLeft: 10, fontFamily: 'Georgia', fontSize: 21, color: colors.forest, fontWeight: '500' },
  heroWrap: { paddingHorizontal: 28, paddingTop: 52 },
  heroTitle: { fontFamily: 'Georgia', fontSize: 42, lineHeight: 44, color: colors.forestDeep, fontWeight: '400', letterSpacing: -1.2 },
  heroSub: { marginTop: 16, fontSize: 15, lineHeight: 22, color: colors.muted, maxWidth: 320 },
  eyebrow: { fontSize: 11, color: colors.mutedSoft, letterSpacing: 1, marginBottom: 8, paddingLeft: 4 },
  tabsRow: { height: 50, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: colors.line, padding: 4, flexDirection: 'row' },
  tabBtn: { flex: 1, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginHorizontal: 2 },
  tabBtnActive: { backgroundColor: colors.forestDeep },
  tabLabel: { fontSize: 14, fontWeight: '600', color: colors.ink },
  tabLabelActive: { color: '#fff' },
  tabSub: { fontSize: 10, fontWeight: '500', color: colors.muted, marginTop: 1, letterSpacing: 0.3 },
  tabSubActive: { color: 'rgba(255,255,255,0.7)' },
  signBtn: { height: 52, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 9 },
  signBtnText: { fontSize: 15, fontWeight: '500', color: colors.ink, marginLeft: 10 },
  signBtnWhite: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line },
  signBtnOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.line },
  newHereText: { fontSize: 13, color: colors.muted },
  badge: { marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  badgeText: { marginLeft: 6, fontSize: 11.5, color: colors.muted },
  backPill: { alignSelf: 'flex-start', marginBottom: 16, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.line, backgroundColor: '#fff' },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: colors.muted, letterSpacing: 0.5, marginTop: 16, marginBottom: 6 },
  input: { height: 48, borderRadius: 13, borderWidth: 1, borderColor: colors.line, backgroundColor: '#fff', paddingHorizontal: 14, fontSize: 16, color: colors.ink },
  primaryBtn: { marginTop: 22, height: 52, borderRadius: 14, backgroundColor: colors.forestDeep, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
