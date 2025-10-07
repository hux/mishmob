import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { Icon } from '../components/common/Icon';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Main Screens
import HomeScreen from '../screens/main/HomeScreen';
import OpportunitiesScreen from '../screens/main/OpportunitiesScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import ScanScreen from '../screens/main/ScanScreen';
import IdVerificationScreen from '../screens/main/IdVerificationScreen';
import TestScreen from '../screens/main/TestScreen';
import MyTicketsScreen from '../screens/main/MyTicketsScreen';

// Event Screens
import { EventTicketScreen } from '../screens/events/EventTicketScreen';
import { EventScannerScreen } from '../screens/events/EventScannerScreen';
import { TicketScannerScreen } from '../screens/main/TicketScannerScreen';

// Host Screens
import HostEventsScreen from '../screens/host/HostEventsScreen';
import HostScannerScreen from '../screens/host/HostScannerScreen';

const AuthStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const MainStack = createNativeStackNavigator();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function VolunteerTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Opportunities':
              iconName = 'magnify';
              break;
            case 'Profile':
              iconName = 'account';
              break;
            default:
              iconName = 'help';
          }

          return <Icon library="MaterialCommunityIcons" name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Opportunities" component={OpportunitiesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function HostTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Dashboard':
              iconName = 'view-dashboard';
              break;
            case 'Events':
              iconName = 'calendar-multiple';
              break;
            case 'Scanner':
              iconName = 'qrcode-scan';
              break;
            case 'Profile':
              iconName = 'account';
              break;
            default:
              iconName = 'help';
          }

          return <Icon library="MaterialCommunityIcons" name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Dashboard" component={HomeScreen} />
      <Tab.Screen name="Events" component={HostEventsScreen} options={{ title: 'My Events' }} />
      <Tab.Screen name="Scanner" component={HostScannerScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function MainNavigator() {
  const { isHost } = useAuth();

  return (
    <MainStack.Navigator>
      <MainStack.Screen
        name="MainTabs"
        component={isHost ? HostTabNavigator : VolunteerTabNavigator}
        options={{ headerShown: false }}
      />
      <MainStack.Screen
        name="IdVerification"
        component={IdVerificationScreen}
        options={{ 
          title: 'Verify Identity',
          headerBackTitle: 'Back'
        }}
      />
      <MainStack.Screen
        name="MyTickets"
        component={MyTicketsScreen}
        options={{ 
          title: 'My Tickets',
          headerBackTitle: 'Back'
        }}
      />
      <MainStack.Screen
        name="EventTicket"
        component={EventTicketScreen}
        options={{ 
          title: 'Event Ticket',
          headerBackTitle: 'Back'
        }}
      />
      <MainStack.Screen
        name="EventScanner"
        component={EventScannerScreen}
        options={{ 
          title: 'QR Scanner',
          headerBackTitle: 'Back'
        }}
      />
      <MainStack.Screen
        name="TicketScanner"
        component={TicketScannerScreen}
        options={{ 
          title: 'Ticket Scanner',
          headerBackTitle: 'Back',
          headerShown: false
        }}
      />
    </MainStack.Navigator>
  );
}

export default function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return isAuthenticated ? <MainNavigator /> : <AuthNavigator />;
}