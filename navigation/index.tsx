/**
 * If you are not familiar with React Navigation, refer to the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import {AntDesign, Ionicons} from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {NavigationContainer, DefaultTheme, RouteProp} from '@react-navigation/native';
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
import KYC from "../screens/User/KYC";
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
import { RootStackParamList, RootTabParamList } from '../types';
import LinkingConfiguration from './LinkingConfiguration';
import GuarantorshipStatus from "../screens/Guarantorship/GuarantorshipStatus";
import SignDocumentRequest from "../screens/Guarantorship/SignDocumentRequest";
import WitnessRequests from "../screens/Guarantorship/WitnessRequests";
import WitnessStatus from "../screens/Guarantorship/WitnessStatus";
import SignStatus from "../screens/Guarantorship/SignStatus";
import SelectTenant from "../screens/Auth/SelectTenant";
import SetPin from "../screens/Auth/SetPin";
import {useDispatch, useSelector} from "react-redux";
import {logoutUser, storeState} from "../stores/auth/authSlice";
import ReplaceActor from "../screens/Guarantorship/ReplaceActor";
import SetTenant from "../screens/Onboarding/SetTenant";
import OnboardingOTP from "../screens/Onboarding/OnboardingOTP";
import Organisations from "../screens/Onboarding/Organisations";
import {TouchableOpacity} from "react-native";
import {store} from "../stores/store";
import CustomTabBar from "../components/CustomTabBar";
type AppDispatch = typeof store.dispatch;
const Navigation = () => {
  const MyTheme = {
     ...DefaultTheme,
     colors: {
        ...DefaultTheme.colors,
        primary: 'rgb(255, 45, 85)',
        background: '#FFFFFF'
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
            <Stack.Screen name="Organisations" component={Organisations} options={{ headerShown: false }} />
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
            <Stack.Screen name="SetPin" component={SetPin} options={({navigation, route}) => {
                return({
                    headerShown: false,
                })
            }} />
            <Stack.Screen name="Countries" component={Countries} options={{ headerShown: false }} />
            <Stack.Screen name="ShowTenants" component={ShowTenants} options={{headerShown: false}} />
            <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
            <Stack.Screen name="VerifyOTP" component={VerifyOTP} options={{ headerShown: false }} />
        </Stack.Navigator>
    )
}

const AuthNavigation = ({dispatch}: { dispatch: AppDispatch }) => {
    return (
        <Stack.Navigator initialRouteName="ProfileMain">
            {/*After login*/}


            <Stack.Screen name="ProfileMain" component={BottomTabNavigator} options={{headerShown: false}} />
            <Stack.Screen name="KYC" component={KYC} options={({ navigation, route }) => {
                return ({
                    title: 'Confirm Information',
                    headerShown: true,
                    headerStyle: {
                        backgroundColor: '#FFFFFF'
                    },
                    headerTintColor: '#489AAB',
                    headerTitleStyle: {
                        fontFamily: 'Poppins_600SemiBold',
                        fontSize: 18
                    },
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.goBack()} style={{paddingHorizontal: 3, marginRight: 16, borderRadius: 15, backgroundColor: "rgba(72,154,171,0.25)"}}>
                            <Ionicons name="chevron-back-sharp" size={30} color="#489AAB" />
                        </TouchableOpacity>
                    ),
                    headerShadowVisible: false
                })
            }} />
            <Stack.Screen name="LoanProducts" component={LoanProducts} options={({navigation, route}) => {
                return {
                    title: "Select Loan Product",
                    headerShown: true,
                    headerStyle: {
                        backgroundColor: '#FFFFFF'
                    },
                    headerTintColor: '#489AAB',
                    headerTitleStyle: {
                        fontFamily: 'Poppins_600SemiBold',
                        fontSize: 18
                    },
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.goBack()} style={{paddingHorizontal: 3, marginRight: 16, borderRadius: 15, backgroundColor: "rgba(72,154,171,0.25)"}}>
                            <Ionicons name="chevron-back-sharp" size={30} color="#489AAB" />
                        </TouchableOpacity>
                    ),
                    headerShadowVisible: false
                }
            }} />
            {/*<Stack.Screen name="LoanProduct" component={LoanProduct} options={{ headerShown: false }} />*/}
            <Stack.Screen name="LoanProduct" component={LoanProduct} options={({navigation, route}) => {
                return {
                    title: "Enter Loan Details",
                    headerShown: true,
                    headerStyle: {
                        backgroundColor: '#FFFFFF'
                    },
                    headerTintColor: '#489AAB',
                    headerTitleStyle: {
                        fontFamily: 'Poppins_600SemiBold',
                        fontSize: 18
                    },
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.goBack()} style={{paddingHorizontal: 3, marginRight: 16, borderRadius: 15, backgroundColor: "rgba(72,154,171,0.25)"}}>
                            <Ionicons name="chevron-back-sharp" size={30} color="#489AAB" />
                        </TouchableOpacity>
                    ),
                    headerShadowVisible: false
                }
            }} />
            <Stack.Screen name="LoanPurpose" component={LoanPurpose} options={({navigation, route}) => {
                return {
                    title: "Select Loan Purpose",
                    headerShown: true,
                    headerStyle: {
                        backgroundColor: '#FFFFFF'
                    },
                    headerTintColor: '#489AAB',
                    headerTitleStyle: {
                        fontFamily: 'Poppins_600SemiBold',
                        fontSize: 18
                    },
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.goBack()} style={{paddingHorizontal: 3, marginRight: 16, borderRadius: 15, backgroundColor: "rgba(72,154,171,0.25)"}}>
                            <Ionicons name="chevron-back-sharp" size={30} color="#489AAB" />
                        </TouchableOpacity>
                    ),
                    headerShadowVisible: false
                }
            }} />
            <Stack.Screen name="ReplaceActor" component={ReplaceActor} options={{ headerShown: false }} />
            <Stack.Screen name="GuarantorsHome" component={GuarantorsHome} options={({navigation, route}) => {
                return ({
                    title: 'Add Guarantors',
                    headerShown: true,
                    headerStyle: {
                        backgroundColor: '#FFFFFF'
                    },
                    headerTintColor: '#489AAB',
                    headerTitleStyle: {
                        fontFamily: 'Poppins_600SemiBold',
                        fontSize: 18
                    },
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.goBack()} style={{paddingHorizontal: 3, marginRight: 16, borderRadius: 15, backgroundColor: "rgba(72,154,171,0.25)"}}>
                            <Ionicons name="chevron-back-sharp" size={30} color="#489AAB" />
                        </TouchableOpacity>
                    ),
                    headerShadowVisible: false
                })
            }} />
            <Stack.Screen name="LoanRequests" component={LoanRequests} options={({navigation, route}) => {
                return ({
                    title: 'Loan Requests',
                    headerShown: true,
                    headerStyle: {
                        backgroundColor: '#FFFFFF'
                    },
                    headerTintColor: '#489AAB',
                    headerTitleStyle: {
                        fontFamily: 'Poppins_600SemiBold',
                        fontSize: 18
                    },
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.goBack()} style={{paddingHorizontal: 3, marginRight: 16, borderRadius: 15, backgroundColor: "rgba(72,154,171,0.25)"}}>
                            <Ionicons name="chevron-back-sharp" size={30} color="#489AAB" />
                        </TouchableOpacity>
                    ),
                    headerShadowVisible: false
                })
            }} />
            <Stack.Screen name="WitnessesHome" component={WitnessesHome} options={({ navigation, route }) => {
                return ({
                    title: 'Add Witnesses',
                    headerShown: true,
                    headerStyle: {
                        backgroundColor: '#FFFFFF'
                    },
                    headerTintColor: '#489AAB',
                    headerTitleStyle: {
                        fontFamily: 'Poppins_600SemiBold',
                        fontSize: 18
                    },
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.goBack()} style={{paddingHorizontal: 3, marginRight: 16, borderRadius: 15, backgroundColor: "rgba(72,154,171,0.25)"}}>
                            <Ionicons name="chevron-back-sharp" size={30} color="#489AAB" />
                        </TouchableOpacity>
                    ),
                    headerShadowVisible: false
                })
            }} />
            <Stack.Screen name="LoanConfirmation" component={LoanConfirmation} options={({ navigation, route }) => {
                return ({
                    title: 'Confirmation',
                    headerShown: true,
                    headerStyle: {
                        backgroundColor: '#FFFFFF'
                    },
                    headerTintColor: '#489AAB',
                    headerTitleStyle: {
                        fontFamily: 'Poppins_600SemiBold',
                        fontSize: 18
                    },
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.goBack()} style={{paddingHorizontal: 3, marginRight: 16, borderRadius: 15, backgroundColor: "rgba(72,154,171,0.25)"}}>
                            <Ionicons name="chevron-back-sharp" size={30} color="#489AAB" />
                        </TouchableOpacity>
                    ),
                    headerShadowVisible: false
                })
            }} />
            <Stack.Screen name="LoanRequest" component={LoanRequest} options={{ headerShown: false }} />
            <Stack.Screen name="SignStatus" component={SignStatus} options={{ headerShown: false }} />
            <Stack.Screen name="GuarantorshipRequests" component={GuarantorshipRequests} options={({ navigation, route }) => {
                return ({
                    title: 'Guarantorship Requests',
                    headerShown: true,
                    headerStyle: {
                        backgroundColor: '#FFFFFF'
                    },
                    headerTintColor: '#489AAB',
                    headerTitleStyle: {
                        fontFamily: 'Poppins_600SemiBold',
                        fontSize: 18
                    },
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.goBack()} style={{paddingHorizontal: 3, marginRight: 16, borderRadius: 15, backgroundColor: "rgba(72,154,171,0.25)"}}>
                            <Ionicons name="chevron-back-sharp" size={30} color="#489AAB" />
                        </TouchableOpacity>
                    ),
                    headerShadowVisible: false
                })
            }} />
            <Stack.Screen name="WitnessRequests" component={WitnessRequests} options={({ navigation, route }) => {
                return ({
                    title: 'Witness Requests',
                    headerShown: true,
                    headerStyle: {
                        backgroundColor: '#FFFFFF'
                    },
                    headerTintColor: '#489AAB',
                    headerTitleStyle: {
                        fontFamily: 'Poppins_600SemiBold',
                        fontSize: 18
                    },
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.goBack()} style={{paddingHorizontal: 3, marginRight: 16, borderRadius: 15, backgroundColor: "rgba(72,154,171,0.25)"}}>
                            <Ionicons name="chevron-back-sharp" size={30} color="#489AAB" />
                        </TouchableOpacity>
                    ),
                    headerShadowVisible: false
                })
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
            <Stack.Screen name="FavouriteGuarantors" component={FavouriteGuarantors} options={({ navigation, route }) => {
                return ({
                    title: 'Favourite Guarantors',
                    headerShown: true,
                    headerStyle: {
                        backgroundColor: '#FFFFFF'
                    },
                    headerTintColor: '#489AAB',
                    headerTitleStyle: {
                        fontFamily: 'Poppins_600SemiBold',
                        fontSize: 18
                    },
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.goBack()} style={{paddingHorizontal: 3, marginRight: 16, borderRadius: 15, backgroundColor: "rgba(72,154,171,0.25)"}}>
                            <Ionicons name="chevron-back-sharp" size={30} color="#489AAB" />
                        </TouchableOpacity>
                    ),
                    headerShadowVisible: false
                })
            }}/>
            <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ title: 'Oops!' }} />
            <Stack.Screen name="Modal" component={ModalScreen} options={({ navigation, route }) => {
                return ({
                    title: 'User Profile',
                    headerShown: true,
                    headerStyle: {
                        backgroundColor: '#FFFFFF'
                    },
                    headerTintColor: '#489AAB',
                    headerTitleStyle: {
                        fontFamily: 'Poppins_600SemiBold',
                        fontSize: 18
                    },
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingHorizontal: 3, marginRight: 16, borderRadius: 15, backgroundColor: "rgba(72,154,171,0.18)"}}>
                            <Ionicons name="chevron-back-sharp" size={30} color="#489AAB" />
                        </TouchableOpacity>
                    ),
                    headerShadowVisible: false,
                    headerRight: () => {
                        return (
                            <TouchableOpacity onPress={async () => await dispatch(logoutUser())}>
                                <AntDesign name="logout" size={20} style={{paddingRight: 5}} color="#FF4A4AFF"/>
                            </TouchableOpacity>
                        )
                    },
                })
            }}/>
        </Stack.Navigator>
    )
}


function RootNavigator() {
    const dispatch : AppDispatch = useDispatch();

  const {isLoggedIn} = useSelector((state: { auth: storeState }) => state.auth);
  return isLoggedIn ? AuthNavigation({dispatch}) : NonAuthNavigation()
}

/**
 * A bottom tab navigator displays tab buttons on the bottom of the display to switch screens.
 * https://reactnavigation.org/docs/bottom-tab-navigator
 */
const BottomTab = createBottomTabNavigator<RootTabParamList>();

function BottomTabNavigator() {
  const colorScheme = useColorScheme();
  const dispatch : AppDispatch = useDispatch();
  return (
    <BottomTab.Navigator
      initialRouteName="UserProfile"
      detachInactiveScreens={true}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
        <BottomTab.Screen
            name="UserProfile"
            component={UserProfile}
            options={{
                title: 'Home',
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    iconName = focused
                        ? ''
                        : 'home';
                    return <TabBarIcon name="home" size={size} focused={focused} color={color}/>
                },
                headerShown: false
            }}
        />
        <BottomTab.Screen
            name="LoanRequests"
            component={LoanRequests}
            options={({ navigation, route }) => ({
                tabBarStyle: { display: "none" },
                title: 'Loan Requests',
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    iconName = focused
                        ? ''
                        : 'filetext1';
                    return <TabBarIcon name="filetext1" size={size} focused={focused} color={color}/>
                },
                headerShown: true,
                headerStyle: {
                    backgroundColor: '#FFFFFF'
                },
                headerTintColor: '#489AAB',
                headerTitleStyle: {
                    fontFamily: 'Poppins_600SemiBold',
                    fontSize: 18,
                    paddingTop: 5
                },
                headerLeft: () => (
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{paddingHorizontal: 3, marginLeft: 12, borderRadius: 15, backgroundColor: "rgba(72,154,171,0.27)"}}>
                        <Ionicons name="chevron-back-sharp" size={30} color="#489AAB" />
                    </TouchableOpacity>
                ),
                headerShadowVisible: false,
            })}
        />
        <BottomTab.Screen
            name="Account"
            component={Account}
            options={{
                title: 'Account',
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    iconName = focused
                        ? ''
                        : 'user';
                    return <TabBarIcon name="user" size={size} focused={focused} color={color}/>
                },
                headerShown: false
            }}
        />
        <BottomTab.Screen
            name="ModalScreen"
            component={ModalScreen}
            options={({ navigation, route }) => ({
                title: 'Settings',
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    iconName = focused
                        ? ''
                        : 'setting';
                    return <TabBarIcon name="setting" size={size} focused={focused} color={color}/>
                },
                headerShown: true,
                headerStyle: {
                    backgroundColor: '#FFFFFF'
                },
                headerTintColor: '#489AAB',
                headerTitleStyle: {
                    fontFamily: 'Poppins_600SemiBold',
                    fontSize: 18,
                    paddingTop: 5
                },
                headerLeft: () => (
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{paddingHorizontal: 3, marginLeft: 12, borderRadius: 15, backgroundColor: "rgba(72,154,171,0.27)"}}>
                        <Ionicons name="chevron-back-sharp" size={30} color="#489AAB" />
                    </TouchableOpacity>
                ),
                headerRight: () => {
                    return (
                        <TouchableOpacity onPress={async () => await dispatch(logoutUser())}>
                            <AntDesign name="logout" size={20} style={{paddingRight: 18}} color="#FF4A4AFF"/>
                        </TouchableOpacity>
                    )
                },
                headerShadowVisible: false,
            })}
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
    focused: boolean;
    size: number;
}) {
    return <AntDesign {...props} />;
}
