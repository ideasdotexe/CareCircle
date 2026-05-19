import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { jsx as _jsx } from "react/jsx-runtime";
const AuthContext = /*#__PURE__*/createContext({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {}
});
export function AuthProvider({
  children
}) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
    // Restore existing session on launch
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setSession(session);
        setLoading(false);
      }
    });
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        setSession(session);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);
  const signOut = async () => {
    await supabase.auth.signOut();
  };
  return /*#__PURE__*/_jsx(AuthContext.Provider, {
    value: {
      session,
      user: session?.user ?? null,
      loading,
      signOut
    },
    children: children
  });
}
export const useAuth = () => useContext(AuthContext);