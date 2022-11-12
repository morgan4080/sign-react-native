/**
 * If you are not familiar with React Navigation, refer to the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import {AntDesign} from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import ModalScreen from '../screens/ModalScreen';
import NotFoundScreen from '../screens/NotFoundScreen';
import GetStarted from "../screens/Landing/GetStarted";
import Login from "../screens/Auth/Login";
import VerifyOTP from "../screens/Auth/VerifyOTP";
import GetTenants from "../screens/Tenants/GetTenants";
import Countries from "../screens/Tenants/Countries";
import ShowTenants from "../screens/Tenants/ShowTenants";
import UserProfile from "../screens/User/UserProfile";
import LoanRequests from "../screens/User/LoanRequests";
import GuarantorshipRequests from "../screens/Guarantorship/GuarantorshipRequests";
import FavouriteGuarantors from "../screens/Guarantorship/FavouriteGuarantors";
import GuarantorsHome from "../screens/Guarantorship/GuarantorsHome";
import WitnessesHome from "../screens/Guarantorship/WitnessesHome";
import Account from "../screens/User/Account";

import LoanProducts from "../screens/Loans/LoanProducts";
import LoanProduct from "../screens/Loans/LoanProduct";
import LoanPurpose from "../screens/Loans/LoanPurpose";
import LoanConfirmation from "../screens/Loans/LoanConfirmation";
import LoanRequest from "../screens/Loans/LoanRequest";
import { RootStackParamList, RootTabParamList, RootTabScreenProps } from '../types';
import LinkingConfiguration from './LinkingConfiguration';
import GuarantorshipStatus from "../screens/Guarantorship/GuarantorshipStatus";
import SignDocumentRequest from "../screens/Guarantorship/SignDocumentRequest";
import WitnessRequests from "../screens/Guarantorship/WitnessRequests";
import WitnessStatus from "../screens/Guarantorship/WitnessStatus";
import SignStatus from "../screens/Guarantorship/SignStatus";
import SelectTenant from "../screens/Auth/SelectTenant";
import SetPin from "../screens/Auth/SetPin";
import {useSelector} from "react-redux";
import {storeState} from "../stores/auth/authSlice";
import ReplaceActor from "../screens/Guarantorship/ReplaceActor";
import SetTenant from "../screens/Onboarding/SetTenant";
import OnboardingOTP from "../screens/Onboarding/OnboardingOTP";

const Navigation = () => {
  const MyTheme = {
     ...DefaultTheme,
     colors: {
        ...DefaultTheme.colors,
        primary: 'rgb(255, 45, 85)',
     },
  };

  return (
    <NavigationContainer
      linking={LinkingConfiguration}
      theme={MyTheme}
    >
      <RootNavigator />
    </NavigationContainer>
  );
};

export default Navigation;

/**
 * A root stack navigator is often used for displaying modals on top of all other content.
 * https://reactnavigation.org/docs/modal
 */
const Stack = createNativeStackNavigator<RootStackParamList>();

const NonAuthNavigation = () => {
    return (
        <Stack.Navigator initialRouteName="GetStarted">

            {/*Before login*/}
            <Stack.Screen name="GetStarted" component={GetStarted} options={{ headerShown: false }} />
            <Stack.Screen name="SetTenant" component={SetTenant} options={{ headerShown: false }} />
            <Stack.Screen name="OnboardingOTP" component={OnboardingOTP} options={{ headerShown: false }} />
            <Stack.Screen name="GetTenants" component={GetTenants} options={{ headerShown: false }} />
            <Stack.Screen name="SelectTenant" component={SelectTenant} options={{
                headerShown: true,
                title: 'Select Organization',
                headerShadowVisible: false,
                headerStyle: {
                    backgroundColor: '#FFFFFF',
                },
                headerTintColor: '#489AAB',
                headerTitleStyle: {
                    fontSize: 20,
                    fontFamily: 'Poppins_600SemiBold'
                }
            }} />
            <Stack.Screen name="SetPin" component={SetPin} options={{
                headerShown: true,
                title: 'Set Account Pin',
                headerShadowVisible: false,
                headerStyle: {
                    backgroundColor: '#FFFFFF',
                },
                headerTintColor: '#489AAB',
                headerTitleStyle: {
                    fontSize: 20,
                    fontFamily: 'Poppins_600SemiBold'
                }
            }} />
            <Stack.Screen name="Countries" component={Countries} options={{ headerShown: false }} />
            <Stack.Screen name="ShowTenants" component={ShowTenants} options={{headerShown: false}} />
            <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
            <Stack.Screen name="VerifyOTP" component={VerifyOTP} options={{ headerShown: false }} />
        </Stack.Navigator>
    )
}

const AuthNavigation = () => {
    return (
        <Stack.Navigator initialRouteName="ProfileMain">
            {/*After login*/}

            <Stack.Screen name="ProfileMain" component={BottomTabNavigator} options={{ headerShown: false }} />
            <Stack.Screen name="LoanProducts" component={LoanProducts} options={{ headerShown: false }} />
            <Stack.Screen name="LoanProduct" component={LoanProduct} options={{ headerShown: false }} />
            <Stack.Screen name="LoanPurpose" component={LoanPurpose} options={{ headerShown: false }} />
            <Stack.Screen name="ReplaceActor" component={ReplaceActor} options={{ headerShown: false }} />
            <Stack.Screen name="GuarantorsHome" component={GuarantorsHome} options={{ headerShown: false }} />
            <Stack.Screen name="WitnessesHome" component={WitnessesHome} options={{ headerShown: false }} />
            <Stack.Screen name="LoanConfirmation" component={LoanConfirmation} options={{ headerShown: false }} />
            <Stack.Screen name="LoanRequest" component={LoanRequest} options={{ headerShown: false }} />
            <Stack.Screen name="SignStatus" component={SignStatus} options={{ headerShown: false }} />
            <Stack.Screen name="GuarantorshipRequests" component={GuarantorshipRequests} options={{
                headerShown: true,
                title: 'Guarantorship Requests',
                headerShadowVisible: false,
                headerStyle: {
                    backgroundColor: 'rgba(204,204,204,0.28)',
                },
                headerTintColor: '#489AAB',
                headerTitleStyle: {
                    fontSize: 20,
                    fontFamily: 'Poppins_600SemiBold'
                }
            }} />
            <Stack.Screen name="WitnessRequests" component={WitnessRequests} options={{
                headerShown: true,
                title: 'Witness Requests',
                headerShadowVisible: false,
                headerStyle: {
                    backgroundColor: 'rgba(204,204,204,0.28)',
                },
                headerTintColor: '#489AAB',
                headerTitleStyle: {
                    fontSize: 20,
                    fontFamily: 'Poppins_600SemiBold'
                }
            }} />
            <Stack.Screen name="GuarantorshipStatus" component={GuarantorshipStatus} options={{
                headerShown: true,
                title: '',
                headerShadowVisible: false,
                headerStyle: {
                    backgroundColor: 'rgba(204,204,204,0.28)',
                },
                headerTintColor: '#489AAB',
                headerTitleStyle: {
                    fontSize: 20,
                    fontFamily: 'Poppins_600SemiBold'
                }
            }} />
            <Stack.Screen name="WitnessStatus" component={WitnessStatus} options={{
                headerShown: true,
                title: '',
                headerShadowVisible: false,
                headerStyle: {
                    backgroundColor: 'rgba(204,204,204,0.28)',
                },
                headerTintColor: '#489AAB',
                headerTitleStyle: {
                    fontSize: 20,
                    fontFamily: 'Poppins_600SemiBold'
                }
            }} />
            <Stack.Screen name="FavouriteGuarantors" component={FavouriteGuarantors} options={{
                headerShown: true,
                title: 'Favourite Guarantors',
                headerShadowVisible: false,
                headerStyle: {
                    backgroundColor: 'rgba(204,204,204,0.28)',
                },
                headerTintColor: '#489AAB',
                headerTitleStyle: {
                    fontSize: 20,
                    fontFamily: 'Poppins_600SemiBold'
                }
            }} />
            <Stack.Screen name="SignDocumentRequest" component={SignDocumentRequest} options={{
                headerShown: true,
                title: '',
                headerShadowVisible: false,
                headerStyle: {
                    backgroundColor: 'rgba(204,204,204,0.28)',
                },
                headerTintColor: '#489AAB',
                headerTitleStyle: {
                    fontSize: 20,
                    fontFamily: 'Poppins_600SemiBold'
                }
            }} />
            <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ title: 'Oops!' }} />
            <Stack.Screen name="Modal" component={ModalScreen} options={{
                title: 'User Profile',
                headerStyle: {
                    backgroundColor: 'rgba(50,52,146,0.12)',
                },
                headerTintColor: '#489AAB',
                headerShadowVisible: false
            }}/>
        </Stack.Navigator>
    )
}


function RootNavigator() {
  const {isLoggedIn} = useSelector((state: { auth: storeState }) => state.auth);
  return isLoggedIn ? AuthNavigation() : NonAuthNavigation()
}

/**
 * A bottom tab navigator displays tab buttons on the bottom of the display to switch screens.
 * https://reactnavigation.org/docs/bottom-tab-navigator
 */
const BottomTab = createBottomTabNavigator<RootTabParamList>();

function BottomTabNavigator() {
  const colorScheme = useColorScheme();

  return (
    <BottomTab.Navigator
      initialRouteName="UserProfile"
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
      }}>
      <BottomTab.Screen
        name="UserProfile"
        component={UserProfile}
        options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
            headerShown: false
        }}
      />
      <BottomTab.Screen
        name="LoanRequests"
        component={LoanRequests}
        options={{
          title: 'Loan Requests',
          tabBarIcon: ({ color }) => <TabBarIcon name="filetext1" color={color} />,
            headerShown: false
        }}
      />
        <BottomTab.Screen
            name="Account"
            component={Account}
            options={{
                title: 'My Account',
                tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
                headerShown: false
            }}
        />
        <BottomTab.Screen
        name="ModalScreen"
        component={ModalScreen}
        options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => <TabBarIcon name="setting" color={color} />,
            headerShown: false
        }}
        />
    </BottomTab.Navigator>
  );
}

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 * <AntDesign name="home" size={24} color="black" />
 */
function TabBarIcon(props: {
    name: React.ComponentProps<typeof AntDesign>['name'];
    color: string;
}) {
    return <AntDesign size={30} style={{ marginBottom: -3 }} {...props} />;
}
