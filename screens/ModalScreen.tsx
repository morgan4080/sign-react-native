import {
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  NativeModules
} from 'react-native';
// import {Camera, CameraCapturedPicture} from 'expo-camera';
import { Text, View } from 'react-native';
import {editMember, logoutUser, storeState} from "../stores/auth/authSlice";
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
import {
  Raleway_600SemiBold,
  useFonts as useRaleway
} from "@expo-google-fonts/raleway";
import {useDispatch, useSelector} from "react-redux";
import {store} from "../stores/store";
import {Controller, useForm} from "react-hook-form";
import {useEffect, useRef, useState} from "react";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {RotateView} from "./Auth/VerifyOTP";
import Container from "../components/Container";
import TextField from "../components/TextField";
import SwitchField from "../components/SwitchField";
import {showSnack} from "../utils/immediateUpdate";
import {useAppDispatch, useLoading, useMember, useUser} from "../stores/hooks";
import TouchableButton from "../components/TouchableButton";

const { width, height } = Dimensions.get("window");

type FormData = {
  firstName: string,
  lastName: string,
  idNumber: string,
  phoneNumber: string,
  email: any,
  fingerPrint: false,
}

type NavigationProps = NativeStackScreenProps<any>;

export default function ModalScreen({ navigation }: NavigationProps) {
  const [takingPhoto, setTakingPhoto] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const [user] = useUser();
  const [member] = useMember();
  const [loading] = useLoading();

  useFonts({
    Poppins_900Black,
    Poppins_500Medium,
    Poppins_800ExtraBold,
    Poppins_700Bold,
    Poppins_600SemiBold,
    Poppins_400Regular,
    Poppins_300Light
  });
  useRaleway({
    Raleway_600SemiBold
  });
  const [hasPermission, setHasPermission] = useState<any>(null);

  useEffect(() => {
    let permCheck = true
    if (permCheck) {
      (async () => {
        setTakingPhoto(false);
        // const { status } = await Camera.requestCameraPermissionsAsync();
        // setHasPermission(status === 'granted');
        setHasPermission(false);
      })();
    }
    return () => {
      setTakingPhoto(false)
      permCheck = false
    }
  }, []);

  const {
    control,
    watch,
    handleSubmit,
    getValues,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      firstName: member?.firstName,
      lastName: member?.lastName,
      idNumber: member?.idNumber,
      phoneNumber: user?.phoneNumber ? user?.phoneNumber : user?.username,
      email: member?.email,
      fingerPrint: false,
    }
  })

  const [firstName, setFirstName] = useState<string>(member?.firstName as string);
  const [lastName, setLastName] = useState<string>(member?.lastName as string);
  const [idNumber, setIdNumber] = useState<string>(member?.idNumber as string);
  const [phoneNumber, setPhoneNumber] = useState<string>(member?.phoneNumber as string);
  const [email, setEmail] = useState<string>(member?.email as string);

  useEffect(() => {
    const subscription = watch((value, {name, type}) => {
      (async () => {
        switch (name) {
          case 'firstName':
            setFirstName(value.firstName as string);
            break;
          case 'lastName':
            setLastName(value.lastName as string);
            break;
          case 'idNumber':
            setIdNumber(value.idNumber as string);
            break;
          case 'phoneNumber':
            setPhoneNumber(value.phoneNumber as string);
            break;
          case 'email':
            setEmail(value.email as string);
            break;
        }
      })()
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const onSubmit = async (): Promise<void> => {
    try {
      type memberPayloadType = {firstName: string, lastName: string, phoneNumber: string, idNumber: string, email: string, memberRefId?: string}

      const payload: memberPayloadType = {
        firstName,
        lastName,
        idNumber,
        phoneNumber,
        email,
        memberRefId: member?.refId
      }

      const {type, error}: any = await dispatch(editMember(payload));

      if (type === 'editMember/rejected' && error) {
        if (error.message === "Network request failed") {
          showSnack("Network request failed", "ERROR");
        } else if (error.message === "401") {
          await dispatch(logoutUser())
        } else {
          showSnack(error.message, "ERROR");
        }
      } else {
        showSnack('User profile updated successfully', "SUCCESS");
      }
    } catch(e: any) {
      console.log(e.message)
    }
  };
  const [photo, setPhoto] = useState<any>(undefined)

  const cameraRef = useRef<any>()

  const takePic = async () => {
      setTakingPhoto(true)
  }

  /*if (takingPhoto) {
    return (
        <Camera ratio="16:9" style={{...styles.container, width, height}} ref={cameraRef}>
          <View style={{position: 'absolute', bottom: 20, width, display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
            <TouchableOpacity
              onPress={() => {
                let options = {
                  quality: 1,
                  base64: true,
                  exif: false
                }

                cameraRef.current.takePictureAsync(options).then((newPhoto: CameraCapturedPicture) => {
                  setPhoto(newPhoto);
                  setTakingPhoto(false);
                })
              }}
              accessibilityLabel="Take Selfie"
              style={{backgroundColor: '#FFFFFF', width: 75, height: 75, borderRadius: 50}}
            />
          </View>
        </Camera>
    );
  } else {*/
    return (
        /*<View style={styles.container}>
          <ScrollView contentContainerStyle={{display: 'flex', alignItems: 'center', paddingBottom: 50}}>
            {/!*<View style={{paddingTop: 50, width, display: 'flex', alignItems: 'center'}}>
              {photo ? <TouchableOpacity onPress={() => {
                    // takePic()
                    console.log("disabled camera")
                  }} style={{...styles.userPicBtn, overflow: 'hidden'}}>
                    <Image style={{width: 108, height: 108, borderRadius: 50}} source={{ uri: "data:image/jpg;base64," + photo?.base64 }} />
                  </TouchableOpacity>
                  :
                  <TouchableOpacity onPress={() => takePic()} style={styles.userPicBtn}>
                    <MaterialCommunityIcons name="account" color="#FFFFFF" size={50}/>
                    <Ionicons style={{position: 'absolute', right: '-10%', backgroundColor: "#FFFFFF", bottom: 10, paddingHorizontal: 5, paddingVertical: 5, borderRadius: 100}} name="add-circle-sharp" size={24} color="#489bab" />
                  </TouchableOpacity>}
              <Text allowFontScaling={false} style={styles.titleText}>{`${member?.firstName} ${member?.lastName}`}</Text>
              <Text allowFontScaling={false} style={styles.subTitleText}>{`Member No: ${member?.memberNumber}`}</Text>
              <Text allowFontScaling={false} style={styles.subTitleText}>{`${user?.companyName}`}</Text>
            </View>
            <Text allowFontScaling={false} style={styles.subtitle}>EDIT PROFILE</Text>*!/}


          </ScrollView>
          {/!* Use a light status bar on iOS to account for the black space above the modal *!/}
          <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
        </View>*/
        <Container>
          <TextField field={"firstName"} label={"First Name"} val={getValues} watch={watch} control={control} error={errors.firstName} required={true}/>
          <TextField field={"lastName"} label={"Last Name"} val={getValues} watch={watch} control={control} error={errors.lastName}  required={true}/>
          <TextField field={"phoneNumber"} label={"Phone Number"} val={getValues} watch={watch} control={control} error={errors.phoneNumber} required={true}/>
          <TextField field={"idNumber"} label={"ID Number"} val={getValues} watch={watch} control={control} error={errors.idNumber} required={true}/>
          <TextField field={"email"} label={"Email"} val={getValues} watch={watch} control={control} error={errors.email} required={true}/>
          <SwitchField label={"Enable finger print"} field={"fingerPrint"} watch={watch} control={control}/>
          <TouchableButton loading={loading} label={"SUBMIT"} onPress={handleSubmit(onSubmit)} />
          {/*<View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: width-90, marginTop: 25}}>
              <Text allowFontScaling={false} style={{fontSize: 14, color: '#767577', fontFamily: 'Poppins_500Medium'}}>Allow witness requests</Text>
              <Controller
                  control={control}
                  rules={{
                    required: true,
                  }}
                  render={( {field: {onChange, onBlur, value}}) => (
                      <Switch
                          trackColor={{false: "#767577", true: "#489AAB"}}
                          thumbColor={isEnabled ? "#FFFFFF" : "#f4f3f4"}
                          onValueChange={toggleSwitch}
                          value={isEnabled}
                      />
                  )}
                  name="fingerPrint"
              />
            </View>

            <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: width-90, marginTop: 20}}>
              <Text allowFontScaling={false} style={{fontSize: 14, color: '#767577', fontFamily: 'Poppins_500Medium'}}>Allow guarantorship requests</Text>
              <Controller
                  control={control}
                  rules={{
                    required: true,
                  }}
                  render={( {field: {onChange, onBlur, value}}) => (
                      <Switch
                          trackColor={{false: "#767577", true: "#489AAB"}}
                          thumbColor={isEnabled ? "#FFFFFF" : "#f4f3f4"}
                          onValueChange={toggleSwitch}
                          value={isEnabled}
                      />
                  )}
                  name="fingerPrint"
              />
            </View>

            <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: width-90, marginTop: 20}}>
              <Text allowFontScaling={false} style={{fontSize: 14, color: '#767577', fontFamily: 'Poppins_500Medium'}}>Enable finger print</Text>
              <Controller
                  control={control}
                  rules={{
                    required: true,
                  }}
                  render={( {field: {onChange, onBlur, value}}) => (
                      <Switch
                          trackColor={{false: "#767577", true: "#489AAB"}}
                          thumbColor={isEnabled ? "#FFFFFF" : "#f4f3f4"}
                          onValueChange={toggleSwitch}
                          value={isEnabled}
                      />
                  )}
                  name="fingerPrint"
              />
            </View>

            <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: width-90, marginTop: 20}}>
              <Text allowFontScaling={false} style={{fontSize: 14, color: '#767577', fontFamily: 'Poppins_500Medium'}}>Enable push notifications</Text>
              <Controller
                  control={control}
                  rules={{
                    required: true,
                  }}
                  render={( {field: {onChange, onBlur, value}}) => (
                      <Switch
                          trackColor={{false: "#767577", true: "#489AAB"}}
                          thumbColor={isEnabled ? "#FFFFFF" : "#f4f3f4"}
                          onValueChange={toggleSwitch}
                          value={isEnabled}
                      />
                  )}
                  name="fingerPrint"
              />
            </View>*/}
        </Container>
    );
  /*}*/
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
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
    fontSize: 13,
    textAlign: 'center',
    color: '#489AAB',
    fontFamily: 'Poppins_500Medium',
    marginTop: 2
  },
  organisationText: {
    fontSize: 13,
    textAlign: 'center',
    color: '#489AAB',
    fontFamily: 'Poppins_500Medium',
  },
  label: {
    fontSize: 13,
    color: '#2791B5',
    fontFamily: 'Raleway_600SemiBold'
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  userPicBtn: {
    marginVertical: 20,
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
  subtitle: {
    textAlign: 'left',
    alignSelf: 'flex-start',
    color: '#489AAB',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    marginTop: 16
  },
  buttonActive: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#489bab',
    marginTop: 54,
    width: "100%",
    height: 45,
    borderRadius: 12,
    marginBottom: 34
  },
  buttonText: {
    fontSize: 16,
    letterSpacing: 0.15,
    textAlign: 'center',
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
  },
});
