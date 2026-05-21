import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

// Auth
import WelcomeScreen from '../screens/WelcomeScreen';
import EmailSignupScreen from '../screens/EmailSignupScreen';
import LoginScreen from '../screens/LoginScreen';

// Onboarding
import OnboardingScreen from '../screens/OnboardingScreen';

// Owner main + detail
import DashboardScreen from '../screens/DashboardScreen';
import PeopleScreen from '../screens/PeopleScreen';
import CareScreen from '../screens/CareScreen';
import AccountScreen from '../screens/AccountScreen';
import AddPersonScreen from '../screens/AddPersonScreen';
import ProfileScreen from '../screens/ProfileScreen';
import BasicInfoScreen from '../screens/BasicInfoScreen';
import MedicationsScreen from '../screens/MedicationsScreen';
import ConditionsScreen from '../screens/ConditionsScreen';
import AllergiesScreen from '../screens/AllergiesScreen';
import CareTeamScreen from '../screens/CareTeamScreen';
import EmergencyContactsScreen from '../screens/EmergencyContactsScreen';
import VitalsEntryScreen from '../screens/VitalsEntryScreen';
import VitalsHistoryScreen from '../screens/VitalsHistoryScreen';
import DocumentUploadScreen from '../screens/DocumentUploadScreen';
import DocumentReviewScreen from '../screens/DocumentReviewScreen';
import LabResultsScreen from '../screens/LabResultsScreen';
import DocsHomeScreen from '../screens/DocsHomeScreen';
import ActivityFeedScreen from '../screens/ActivityFeedScreen';
import AppointmentsScreen from '../screens/AppointmentsScreen';
import AddAppointmentScreen from '../screens/AddAppointmentScreen';
import ManageCaregiversScreen from '../screens/ManageCaregiversScreen';
import InviteCaregiverScreen from '../screens/InviteCaregiverScreen';
import FindCaregiverScreen from '../screens/FindCaregiverScreen';
import CaregiverPublicProfileScreen from '../screens/CaregiverPublicProfileScreen';

// Caregiver side
import CaregiverTodayScreen from '../screens/CaregiverTodayScreen';
import CaregiverPeopleScreen from '../screens/CaregiverPeopleScreen';
import CaregiverProfileScreen from '../screens/CaregiverProfileScreen';
import CaregiverEditProfileScreen from '../screens/CaregiverEditProfileScreen';
import CaregiverVisitScreen from '../screens/CaregiverVisitScreen';
import CaregiverVisitNoteScreen from '../screens/CaregiverVisitNoteScreen';
import CaregiverMedConfirmScreen from '../screens/CaregiverMedConfirmScreen';
import CaregiverVitalsLogScreen from '../screens/CaregiverVitalsLogScreen';
import CaregiverNotificationsScreen from '../screens/CaregiverNotificationsScreen';
import OwnerNotificationsScreen from '../screens/OwnerNotificationsScreen';

const Stack = createNativeStackNavigator();

const Loading = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.cream }}>
    <ActivityIndicator size="large" color={colors.forest} />
  </View>
);

function AuthStack() {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="EmailSignup" component={EmailSignupScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
    </Stack.Navigator>
  );
}

function OwnerStack({ initialRoute }) {
  return (
    <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      {/* tab destinations behave like full pages */}
      <Stack.Screen name="OwnerTabs" component={DashboardScreen} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="PeopleTab" component={PeopleScreen} />
      <Stack.Screen name="CareScreen" component={CareScreen} />
      <Stack.Screen name="Account" component={AccountScreen} />
      {/* details */}
      <Stack.Screen name="AddPerson" component={AddPersonScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="BasicInfo" component={BasicInfoScreen} />
      <Stack.Screen name="Medications" component={MedicationsScreen} />
      <Stack.Screen name="Conditions" component={ConditionsScreen} />
      <Stack.Screen name="Allergies" component={AllergiesScreen} />
      <Stack.Screen name="CareTeam" component={CareTeamScreen} />
      <Stack.Screen name="EmergencyContacts" component={EmergencyContactsScreen} />
      <Stack.Screen name="VitalsEntry" component={VitalsEntryScreen} />
      <Stack.Screen name="VitalsHistory" component={VitalsHistoryScreen} />
      <Stack.Screen name="DocumentUpload" component={DocumentUploadScreen} />
      <Stack.Screen name="DocumentReview" component={DocumentReviewScreen} />
      <Stack.Screen name="LabResults" component={LabResultsScreen} />
      <Stack.Screen name="DocsHome" component={DocsHomeScreen} />
      <Stack.Screen name="ActivityFeed" component={ActivityFeedScreen} />
      <Stack.Screen name="AppointmentsScreen" component={AppointmentsScreen} />
      <Stack.Screen name="AddAppointment" component={AddAppointmentScreen} />
      <Stack.Screen name="ManageCaregivers" component={ManageCaregiversScreen} />
      <Stack.Screen name="InviteCaregiver" component={InviteCaregiverScreen} />
      <Stack.Screen name="FindCaregiver" component={FindCaregiverScreen} />
      <Stack.Screen name="CaregiverPublicProfile" component={CaregiverPublicProfileScreen} />
      <Stack.Screen name="OwnerNotifications" component={OwnerNotificationsScreen} />
    </Stack.Navigator>
  );
}

function CaregiverStack({ initialRoute }) {
  return (
    <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CaregiverToday" component={CaregiverTodayScreen} />
      <Stack.Screen name="CaregiverPeople" component={CaregiverPeopleScreen} />
      <Stack.Screen name="CaregiverProfile" component={CaregiverProfileScreen} />
      <Stack.Screen name="CaregiverEditProfile" component={CaregiverEditProfileScreen} />
      <Stack.Screen name="CaregiverVisit" component={CaregiverVisitScreen} />
      <Stack.Screen name="CaregiverVisitNote" component={CaregiverVisitNoteScreen} />
      <Stack.Screen name="CaregiverMedConfirm" component={CaregiverMedConfirmScreen} />
      <Stack.Screen name="CaregiverVitalsLog" component={CaregiverVitalsLogScreen} />
      <Stack.Screen name="CaregiverNotifications" component={CaregiverNotificationsScreen} />
      {/* shared details */}
      <Stack.Screen name="VitalsHistory" component={VitalsHistoryScreen} />
      <Stack.Screen name="VitalsEntry" component={VitalsEntryScreen} />
      <Stack.Screen name="Medications" component={MedicationsScreen} />
      <Stack.Screen name="AppointmentsScreen" component={AppointmentsScreen} />
      <Stack.Screen name="AddAppointment" component={AddAppointmentScreen} />
      <Stack.Screen name="DocsHome" component={DocsHomeScreen} />
      <Stack.Screen name="DocumentUpload" component={DocumentUploadScreen} />
      <Stack.Screen name="DocumentReview" component={DocumentReviewScreen} />
      <Stack.Screen name="LabResults" component={LabResultsScreen} />
      <Stack.Screen name="CareTeam" component={CareTeamScreen} />
    </Stack.Navigator>
  );
}

function RoleRouter() {
  const [state, setState] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setState({ kind: 'owner', initial: 'Onboarding' }); return; }

        const metaRole = user.user_metadata?.role;

        // Check if owner (has persons)
        let isOwner = false;
        try {
          const { data: persons } = await supabase.from('persons').select('id').eq('user_id', user.id).limit(1);
          isOwner = Array.isArray(persons) && persons.length > 0;
        } catch (_) {}

        // Check if caregiver (has caregiver relationships)
        let isCaregiver = false;
        try {
          const { data: rels } = await supabase
            .from('caregiver_relationships')
            .select('id')
            .eq('caregiver_id', user.id)
            .neq('status', 'revoked')
            .limit(1);
          isCaregiver = Array.isArray(rels) && rels.length > 0;
        } catch (_) {}

        if (isOwner) {
          setState({ kind: 'owner', initial: 'OwnerTabs' });
        } else if (isCaregiver) {
          setState({ kind: 'caregiver', initial: 'CaregiverToday' });
        } else if (metaRole === 'caregiver') {
          setState({ kind: 'caregiver', initial: 'CaregiverProfile' });
        } else {
          setState({ kind: 'owner', initial: 'Onboarding' });
        }
      } catch (_) {
        setState({ kind: 'owner', initial: 'Onboarding' });
      }
    })();
  }, []);

  if (!state) return <Loading />;
  return state.kind === 'caregiver'
    ? <CaregiverStack initialRoute={state.initial} />
    : <OwnerStack initialRoute={state.initial} />;
}

export default function AppNavigator() {
  const { session, loading } = useAuth();
  if (loading) return <Loading />;
  return (
    <NavigationContainer>
      {session ? <RoleRouter /> : <AuthStack />}
    </NavigationContainer>
  );
}
