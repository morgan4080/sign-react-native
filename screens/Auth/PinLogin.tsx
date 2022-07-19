import {getSecureKey} from "../../utils/secureStore";
import {useEffect, useState} from "react";
import {loginUser, loginUserType, storeState} from "../../stores/auth/authSlice";
import {useDispatch, useSelector} from "react-redux";
import {store} from "../../stores/store";
import {Dimensions, NativeModules, SafeAreaView, ScrollView, StyleSheet, View} from "react-native";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
type NavigationProps = NativeStackScreenProps<any>;

const { width, height } = Dimensions.get("window");

const PinLogin = ({ navigation }: NavigationProps) => {
    const [phoneNumber, setPhoneNumber] = useState<string | undefined>('');

    const { isLoggedIn, loading } = useSelector((state: { auth: storeState }) => state.auth);
    type AppDispatch = typeof store.dispatch;
    const CSTM = NativeModules.CSTM;

    const dispatch : AppDispatch = useDispatch();
    useEffect(() => {
        (async () => {
            const phoneNo = await getSecureKey('phone_number');
            if (phoneNo) {
                setPhoneNumber(phoneNo);
            } else {
                // navigate to Login
                navigation.navigate('UserEducation');
            }
        })()
    },[]);

    const onSubmit = async (value: any): Promise<void> => {
        if (value) {
            const payload: loginUserType = {
                phoneNumber: parseInt(`${phoneNumber}`),
                pin: value.pin,
            }

            try {
                const { type, error }: any = await dispatch(loginUser(payload))
                if (type === 'loginUser/rejected' && error) {
                    if (error.message === "Network request failed") {
                        CSTM.showToast('No Internet');
                    } else {
                        CSTM.showToast(error.message);
                    }
                }
                if (type === 'loginUser/fulfilled') {
                    CSTM.showToast("Login Successful");
                }
            } catch (e: any) {
                // console.log("login error", e)
                console.log('errorssss', e);
            }
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, width, height: 8/12 * height, backgroundColor: '#489AAB' }}>
            <ScrollView contentContainerStyle={styles.container}>

            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        height: height
    },
})


export default PinLogin;
