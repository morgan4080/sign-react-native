/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */

import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {LoanRequestData} from "./screens/User/LoanRequests";
import {GuarantorshipRequestType, LoanProduct} from "./stores/auth/authSlice";
import {accountHistoryType} from "./screens/Guarantorship/GuarantorshipRequests";

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type RootStackParamList = {
  Modal: NavigatorScreenParams<RootTabParamList> | undefined;
  NotFound: NavigatorScreenParams<RootTabParamList> | undefined;
  GetStarted: NavigatorScreenParams<RootTabParamList> | undefined;
  KYC: NavigatorScreenParams<RootTabParamList> | undefined;
  SetTenant: { selectedTenant?: any; code?: "254"; numericCode?: string; alpha2Code?: string; flag?: string; } | undefined;
  Organisations: NavigatorScreenParams<RootTabParamList> | undefined;
  OnboardingOTP: NavigatorScreenParams<RootTabParamList> | undefined;
  LoanProducts: NavigatorScreenParams<RootTabParamList> | undefined;
  MyAccount: NavigatorScreenParams<RootTabParamList> | undefined;
  LoanProduct: { loanProduct?: LoanProduct; } | undefined;
  GuarantorsHome: NavigatorScreenParams<RootTabParamList> | undefined;
  ReplaceActor: NavigatorScreenParams<RootTabParamList> | undefined;
  WitnessesHome: NavigatorScreenParams<RootTabParamList> | undefined;
  LoanConfirmation: NavigatorScreenParams<RootTabParamList> | undefined;
  LoanRequest: NavigatorScreenParams<RootTabParamList> | undefined;
  Login: { countryCode?: string; phoneNumber?: string; email?: string } | undefined;
  ShowTenants: NavigatorScreenParams<RootTabParamList> | undefined;
  GetTenants: NavigatorScreenParams<RootTabParamList> | undefined;
  Countries: { previous: string; } | undefined;
  PinLogin: NavigatorScreenParams<RootTabParamList> | undefined;
  SetPin: NavigatorScreenParams<RootTabParamList> | undefined;
  SelectTenant: NavigatorScreenParams<RootTabParamList> | undefined;
  LoanPurpose: { loanProduct: LoanProduct; loanDetails: {desiredAmount: string | undefined; desiredPeriod: string | undefined;} } | undefined;
  Forgot: NavigatorScreenParams<RootTabParamList> | undefined;
  ProfileMain: NavigatorScreenParams<RootTabParamList> | undefined;
  GuarantorshipRequests: NavigatorScreenParams<RootTabParamList> | { pressed?: boolean } | undefined;
  WitnessRequests: NavigatorScreenParams<RootTabParamList> | undefined;
  GuarantorshipStatus: { accepted: boolean; guarantor: accountHistoryType | null | undefined; loanRequest: GuarantorshipRequestType | undefined; } | undefined;
  WitnessStatus: NavigatorScreenParams<RootTabParamList> | undefined;
  SignDocumentRequest: { guarantorshipRequest:  GuarantorshipRequestType | undefined; guarantor?: boolean; witness?: boolean; } | undefined;
  SignStatus: NavigatorScreenParams<RootTabParamList> | undefined;
  FavouriteGuarantors: NavigatorScreenParams<RootTabParamList> | undefined;
  VerifyOTP: NavigatorScreenParams<RootTabParamList> | undefined;
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  Screen
>;

export type RootTabParamList = {
  UserProfile: undefined;
  LoanRequests: { loan?: LoanRequestData } | undefined;
  History: undefined;
  Account: undefined;
  ModalScreen: undefined;
};

export type RootTabScreenProps<Screen extends keyof RootTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, Screen>,
  NativeStackScreenProps<RootStackParamList>
>;
