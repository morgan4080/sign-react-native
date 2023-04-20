import {
  Dimensions,
  StyleSheet
} from 'react-native';
import {editMember, logoutUser} from "../stores/auth/authSlice";
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
import {FieldError, useForm} from "react-hook-form";
import {useEffect, useRef, useState} from "react";
import Container from "../components/Container";
import TextField from "../components/TextField";
import SwitchField from "../components/SwitchField";
import {showSnack} from "../utils/immediateUpdate";
import {useAppDispatch, useLoading, useMember, useUser} from "../stores/hooks";
import TouchableButton from "../components/TouchableButton";

const { width } = Dimensions.get("window");

type FormData = {
  firstName: string,
  lastName: string,
  idNumber: string,
  phoneNumber: string,
  email: any,
  fingerPrint: false,
}

export default function ModalScreen() {
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
      type memberPayloadType = {firstName: string, lastName: string, phoneNumber: string, idNumber: string, email: string, refId?: string}

      const payload: memberPayloadType = {
        firstName,
        lastName,
        idNumber,
        phoneNumber,
        email,
        refId: member?.refId
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

  return (
      <Container>
        <TextField field={"firstName"} label={"First Name"} val={getValues} watch={watch} control={control} error={errors.firstName} required={true}/>
        <TextField field={"lastName"} label={"Last Name"} val={getValues} watch={watch} control={control} error={errors.lastName}  required={true}/>
        <TextField field={"phoneNumber"} label={"Phone Number"} val={getValues} watch={watch} control={control} error={errors.phoneNumber} required={true}/>
        <TextField field={"idNumber"} label={"ID Number"} val={getValues} watch={watch} control={control} error={errors.idNumber} required={true}/>
        <TextField field={"email"} label={"Email"} val={getValues} watch={watch} control={control} error={errors.email as FieldError} required={true}/>
        <SwitchField label={"Enable finger print"} field={"fingerPrint"} watch={watch} control={control}/>
        <TouchableButton loading={loading} label={"SUBMIT"} onPress={handleSubmit(onSubmit)} />
      </Container>
  );
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
