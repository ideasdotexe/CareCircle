import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { colors, spacing } from '../theme';
import { CCLogo, IconApple, IconGoogle, IconMail, IconShield } from '../components/Icons';
import { supabase } from '../lib/supabase';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
WebBrowser.maybeCompleteAuthSession();
export default function WelcomeScreen({
  navigation
}) {
  const [loadingApple, setLoadingApple] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  // ── Apple Sign In ──────────────────────────────────────
  const handleApple = async () => {
    setLoadingApple(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME, AppleAuthentication.AppleAuthenticationScope.EMAIL]
      });
      if (!credential.identityToken) throw new Error('No identity token from Apple');
      const {
        data,
        error
      } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken
      });
      if (error) throw error;
      if (data.user) {
        await supabase.from('profiles').update({
          last_login: new Date().toISOString()
        }).eq('id', data.user.id);
      }
    } catch (e) {
      if (e.code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert('Sign in failed', e.message ?? 'Could not sign in with Apple.');
      }
    } finally {
      setLoadingApple(false);
    }
  };

  // ── Google OAuth ───────────────────────────────────────
  const handleGoogle = async () => {
    setLoadingGoogle(true);
    try {
      const redirectUrl = makeRedirectUri({
        scheme: 'carecircle',
        path: 'auth/callback'
      });
      const {
        data,
        error
      } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true
        }
      });
      if (error) throw error;
      if (!data.url) throw new Error('No OAuth URL returned');
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
      if (result.type === 'success' && result.url) {
        // Parse tokens from the redirect URL hash
        const hashParams = new URLSearchParams(result.url.split('#')[1] ?? '');
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        if (accessToken && refreshToken) {
          const {
            data: sessionData,
            error: sessionError
          } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          if (sessionError) throw sessionError;
          if (sessionData.user) {
            await supabase.from('profiles').update({
              last_login: new Date().toISOString()
            }).eq('id', sessionData.user.id);
          }
        }
      }
    } catch (e) {
      const msg = e.message ?? '';
      if (msg.includes('provider is not enabled') || msg.includes('Unsupported provider')) {
        Alert.alert('Google sign-in not configured', 'Enable the Google provider in your Supabase dashboard under Authentication → Providers.');
      } else {
        Alert.alert('Sign in failed', msg || 'Could not sign in with Google.');
      }
    } finally {
      setLoadingGoogle(false);
    }
  };
  return /*#__PURE__*/_jsx(SafeAreaView, {
    style: styles.safe,
    children: /*#__PURE__*/_jsxs(View, {
      style: styles.container,
      children: [/*#__PURE__*/_jsxs(View, {
        style: styles.brand,
        children: [/*#__PURE__*/_jsx(CCLogo, {
          size: 26,
          color: colors.forest
        }), /*#__PURE__*/_jsx(Text, {
          style: styles.brandName,
          children: "CareCircle"
        })]
      }), /*#__PURE__*/_jsxs(View, {
        style: styles.hero,
        children: [/*#__PURE__*/_jsx(Text, {
          style: styles.heroDisplay,
          children: 'Care,\nkept close.'
        }), /*#__PURE__*/_jsx(Text, {
          style: styles.heroSub,
          children: "One quiet place for the people you look after \u2014 medications, doctors, and what matters next."
        })]
      }), /*#__PURE__*/_jsx(View, {
        style: {
          flex: 1
        }
      }), /*#__PURE__*/_jsxs(View, {
        style: styles.authArea,
        children: [/*#__PURE__*/_jsx(TouchableOpacity, {
          style: styles.btnApple,
          onPress: handleApple,
          activeOpacity: 0.88,
          disabled: loadingApple,
          children: loadingApple ? /*#__PURE__*/_jsx(ActivityIndicator, {
            color: "#fff"
          }) : /*#__PURE__*/_jsxs(_Fragment, {
            children: [/*#__PURE__*/_jsx(IconApple, {
              color: "#fff"
            }), /*#__PURE__*/_jsx(Text, {
              style: styles.btnAppleText,
              children: "Continue with Apple"
            })]
          })
        }), /*#__PURE__*/_jsx(TouchableOpacity, {
          style: styles.btnGoogle,
          onPress: handleGoogle,
          activeOpacity: 0.88,
          disabled: loadingGoogle,
          children: loadingGoogle ? /*#__PURE__*/_jsx(ActivityIndicator, {
            color: colors.ink
          }) : /*#__PURE__*/_jsxs(_Fragment, {
            children: [/*#__PURE__*/_jsx(IconGoogle, {}), /*#__PURE__*/_jsx(Text, {
              style: styles.btnGoogleText,
              children: "Continue with Google"
            })]
          })
        }), /*#__PURE__*/_jsxs(TouchableOpacity, {
          style: styles.btnEmail,
          onPress: () => navigation.navigate('Login'),
          activeOpacity: 0.88,
          children: [/*#__PURE__*/_jsx(IconMail, {
            color: colors.forest
          }), /*#__PURE__*/_jsx(Text, {
            style: styles.btnEmailText,
            children: "Continue with email"
          })]
        }), /*#__PURE__*/_jsxs(View, {
          style: styles.trustRow,
          children: [/*#__PURE__*/_jsx(IconShield, {
            color: colors.muted
          }), /*#__PURE__*/_jsx(Text, {
            style: styles.trustText,
            children: "Stored in Canada \xB7 Encrypted at rest"
          })]
        }), /*#__PURE__*/_jsxs(Text, {
          style: styles.legal,
          children: ["By continuing you agree to our", ' ', /*#__PURE__*/_jsx(Text, {
            style: styles.legalLink,
            children: "Terms"
          }), " and", ' ', /*#__PURE__*/_jsx(Text, {
            style: styles.legalLink,
            children: "Privacy"
          }), "."]
        }), /*#__PURE__*/_jsx(TouchableOpacity, {
          onPress: () => navigation.navigate('EmailSignup'),
          style: styles.signinRow,
          children: /*#__PURE__*/_jsxs(Text, {
            style: styles.signinText,
            children: ["New here?", ' ', /*#__PURE__*/_jsx(Text, {
              style: styles.signinLink,
              children: "Create an account"
            })]
          })
        })]
      })]
    })
  });
}
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.cream
  },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingBottom: 28
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 36
  },
  brandName: {
    fontSize: 21,
    fontWeight: '500',
    letterSpacing: -0.3,
    color: colors.forest
  },
  hero: {
    paddingTop: 64
  },
  heroDisplay: {
    fontSize: 44,
    lineHeight: 46,
    fontWeight: '400',
    letterSpacing: -1.2,
    color: colors.forestDeep
  },
  heroSub: {
    marginTop: 18,
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted,
    maxWidth: 280,
    letterSpacing: -0.1
  },
  authArea: {
    gap: 10
  },
  btnApple: {
    height: 54,
    borderRadius: 16,
    backgroundColor: colors.forestDeep,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10
  },
  btnAppleText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    letterSpacing: -0.2
  },
  btnGoogle: {
    height: 54,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10
  },
  btnGoogleText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.ink,
    letterSpacing: -0.2
  },
  btnEmail: {
    height: 54,
    borderRadius: 16,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10
  },
  btnEmailText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.forest,
    letterSpacing: -0.2
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8
  },
  trustText: {
    fontSize: 12,
    color: colors.muted,
    letterSpacing: 0.1
  },
  legal: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.mutedSoft,
    lineHeight: 18
  },
  legalLink: {
    color: colors.forest,
    textDecorationLine: 'underline'
  },
  signinRow: {
    alignItems: 'center',
    paddingVertical: spacing.sm
  },
  signinText: {
    fontSize: 14,
    color: colors.muted
  },
  signinLink: {
    color: colors.forest,
    fontWeight: '600'
  }
});