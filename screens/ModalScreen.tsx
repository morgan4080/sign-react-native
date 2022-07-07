import { StatusBar } from 'expo-status-bar';
import { Dimensions, Platform, StyleSheet, TextInput, TouchableOpacity, Switch, SafeAreaView, ScrollView, StatusBar as Bar } from 'react-native';
import { Camera } from 'expo-camera';
import { Text, View } from 'react-native';
import {logoutUser, storeState} from "../stores/auth/authSlice";
import {
  Poppins_300Light,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
  Poppins_900Black,
  useFonts
} from "@expo-google-fonts/poppins";
import {useDispatch, useSelector} from "react-redux";
import {store} from "../stores/store";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import {Controller, useForm} from "react-hook-form";
import {useEffect, useState} from "react";
import {NativeStackScreenProps} from "@react-navigation/native-stack";

const { width, height } = Dimensions.get("window");

type FormData = {
  fullName: string,
  phoneNumber: string,
  fingerPrint: false,
}

type NavigationProps = NativeStackScreenProps<any>;

export default function ModalScreen({ navigation }: NavigationProps) {
  const { isLoggedIn, user, member } = useSelector((state: { auth: storeState }) => state.auth);

  type AppDispatch = typeof store.dispatch;

  const dispatch : AppDispatch = useDispatch();
  let [fontsLoaded] = useFonts({
    Poppins_900Black,
    Poppins_500Medium,
    Poppins_800ExtraBold,
    Poppins_700Bold,
    Poppins_600SemiBold,
    Poppins_400Regular,
    Poppins_300Light
  });
  const [hasPermission, setHasPermission] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const logout = async () => {
    await Promise.all([
      dispatch(logoutUser())
    ])
  };

  useEffect(() => {
    if (!isLoggedIn) {
      navigation.navigate('GetTenants')
    }
  }, [isLoggedIn]);

  const getPic = () => {
    // console.log("pull up camera")
  }
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      fullName: member?.fullName,
      phoneNumber: user?.phoneNumber ? user?.phoneNumber : user?.username,
      fingerPrint: false,
    }
  })
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled((previousState: boolean) => !previousState);
  return (
    <View style={styles.container}>
      <View style={{ position: 'absolute', top: -190, backgroundColor: 'rgba(50,52,146,0.12)', paddingHorizontal: 5, paddingVertical: 5, borderRadius: 15, width: width, height: 200 }} />
      <View style={{ position: 'absolute', left: -100, top: '25%', backgroundColor: 'rgba(50,52,146,0.12)', paddingHorizontal: 5, paddingVertical: 5, borderRadius: 100, width: 200, height: 200 }} />
      <View style={{ position: 'absolute', right: -80, top: '32%', backgroundColor: 'rgba(50,52,146,0.12)', paddingHorizontal: 5, paddingVertical: 5, borderRadius: 100, width: 150, height: 150 }} />
      <TouchableOpacity onPress={() => getPic()} style={styles.userPicBtn}>
        <MaterialCommunityIcons name="account" color="#FFFFFF" size={100}/>
        <View style={{ position: 'absolute', left: '90%', bottom: 10, backgroundColor: '#336DFF', paddingHorizontal: 5, paddingVertical: 5, borderRadius: 100 }}>
          <MaterialCommunityIcons name="camera" color="#FFFFFF" size={20} />
        </View>
      </TouchableOpacity>
      <Text allowFontScaling={false} style={styles.titleText}>{ `${ member?.fullName }` }</Text>
      <Text allowFontScaling={false} style={styles.subTitleText}>{ `Member NO: ${member?.memberNumber}` }</Text>
      <Text allowFontScaling={false} style={styles.organisationText}>{ `${user?.companyName}` }</Text>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff', marginTop: 30, borderTopLeftRadius: 25, borderTopRightRadius: 25, width: width-20, height: height/2 }}>
        <ScrollView contentContainerStyle={{ display: 'flex', alignItems: 'center', paddingBottom: 50 }}>
          <Controller
              control={control}
              rules={{
                required: true,
              }}
              render={( { field: { onChange, onBlur, value } }) => (
                  <TextInput
                      allowFontScaling={false}
                      style={styles.input}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      editable={false}
                      selectTextOnFocus={false}
                  />
              )}
              name="fullName"
          />
          <Controller
              control={control}
              rules={{
                required: true,
              }}
              render={( { field: { onChange, onBlur, value } }) => (
                  <TextInput
                      allowFontScaling={false}
                      style={styles.input}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      editable={false}
                      selectTextOnFocus={false}
                  />
              )}
              name="phoneNumber"
          />

          <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: width-90, marginTop: 50 }}>
            <Text allowFontScaling={false} style={{ fontSize: 14, color: '#767577', fontFamily: 'Poppins_500Medium' }}>Enable Fingerprint Protection</Text>
            <Controller
                control={control}
                rules={{
                  required: true,
                }}
                render={( { field: { onChange, onBlur, value } }) => (
                    <Switch
                        trackColor={{ false: "#767577", true: "#489AAB" }}
                        thumbColor={isEnabled ? "#FFFFFF" : "#f4f3f4"}
                        onValueChange={toggleSwitch}
                        value={isEnabled}
                    />
                )}
                name="fingerPrint"
            />
          </View>

          <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: width-90, marginTop: 20 }}>
            <Text allowFontScaling={false} style={{ fontSize: 14, color: '#767577', fontFamily: 'Poppins_500Medium' }}>Allow Guarantorship requests</Text>
            <Controller
                control={control}
                rules={{
                  required: true,
                }}
                render={( { field: { onChange, onBlur, value } }) => (
                    <Switch
                        trackColor={{ false: "#767577", true: "#489AAB" }}
                        thumbColor={isEnabled ? "#FFFFFF" : "#f4f3f4"}
                        onValueChange={toggleSwitch}
                        value={isEnabled}
                    />
                )}
                name="fingerPrint"
            />
          </View>

          <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: width-90, marginTop: 20 }}>
            <Text allowFontScaling={false} style={{ fontSize: 14, color: '#767577', fontFamily: 'Poppins_500Medium' }}>Enable push notifications</Text>
            <Controller
                control={control}
                rules={{
                  required: true,
                }}
                render={( { field: { onChange, onBlur, value } }) => (
                    <Switch
                        trackColor={{ false: "#767577", true: "#489AAB" }}
                        thumbColor={isEnabled ? "#FFFFFF" : "#f4f3f4"}
                        onValueChange={toggleSwitch}
                        value={isEnabled}
                    />
                )}
                name="fingerPrint"
            />
          </View>

          <TouchableOpacity onPress={() => console.log('navigate to change pin')} style={styles.helpLink}>
            <Text allowFontScaling={false} style={{ fontSize: 14, color: '#F26141', fontFamily: 'Poppins_500Medium' }} >
              Change your pin
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => logout()} style={styles.helpLink}>
            <Text allowFontScaling={false} style={{ fontSize: 14, color: '#F26141', fontFamily: 'Poppins_500Medium' }} >
              Log Out
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    position: "relative"
  },
  title: {
    fontSize: 16,
    paddingTop: 20,
    color: '#489AAB',
    fontFamily: 'Poppins_600SemiBold'
  },
  titleText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#489AAB',
    fontFamily: 'Poppins_600SemiBold',
    marginTop: 5,
  },
  subTitleText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#489AAB',
    fontFamily: 'Poppins_400Regular',
  },
  organisationText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#489AAB',
    fontFamily: 'Poppins_400Regular',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 20,
    height: 54,
    width: width-80,
    marginTop: 30,
    paddingHorizontal: 20,
    fontSize: 15,
    color: '#767577',
    fontFamily: 'Poppins_400Regular'
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  userPicBtn: {
    marginTop: 20,
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderColor: '#489AAB',
    borderWidth: 2,
    borderRadius: 100,
    backgroundColor: '#EDEDED',
    position: 'relative'
  },
  helpLink: {
    marginTop: 20,
    width: width-90
  },
});
