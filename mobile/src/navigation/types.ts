import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

// Tab Navigator
export type TabParamList = {
  Home: undefined;
  Opportunities: undefined;
  Scan: undefined;
  Profile: undefined;
};

// Main Stack (contains tab navigator and other screens)
export type MainStackParamList = {
  MainTabs: undefined;
  IdVerification: undefined;
  MyTickets: undefined;
  EventTicket: {
    ticketId: string;
  };
  TicketScanner: {
    eventId?: string;
    eventTitle?: string;
  };
};

// Combined navigation prop types
export type AuthScreenProps<T extends keyof AuthStackParamList> = 
  NativeStackScreenProps<AuthStackParamList, T>;

export type TabScreenProps<T extends keyof TabParamList> = 
  BottomTabScreenProps<TabParamList, T>;

export type MainStackScreenProps<T extends keyof MainStackParamList> = 
  NativeStackScreenProps<MainStackParamList, T>;

// Declare global navigation types for TypeScript
declare global {
  namespace ReactNavigation {
    interface RootParamList extends MainStackParamList {}
  }
}