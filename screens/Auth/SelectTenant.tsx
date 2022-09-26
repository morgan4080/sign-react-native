import {StyleSheet, View} from "react-native";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_800ExtraBold,
    Poppins_900Black,
    useFonts
} from "@expo-google-fonts/poppins";
import {useDispatch, useSelector} from "react-redux";
import {storeState} from "../../stores/auth/authSlice";
import {store} from "../../stores/store";
type NavigationProps = NativeStackScreenProps<any>;
import {Controller, useForm} from "react-hook-form";
import {RotateView} from "./VerifyOTP";
import {GestureHandlerRootView} from 'react-native-gesture-handler';

const SelectTenant = ({ navigation, route }: NavigationProps) => {
    let [fontsLoaded] = useFonts({
        Poppins_900Black,
        Poppins_500Medium,
        Poppins_800ExtraBold,
        Poppins_600SemiBold,
        Poppins_400Regular,
        Poppins_300Light
    });

    const {organisations} = useSelector((state: { auth: storeState }) => state.auth);

    type AppDispatch = typeof store.dispatch;

    const dispatch : AppDispatch = useDispatch();

    const onSubmit = () => {

    }


    if (fontsLoaded) {
        return (
            <GestureHandlerRootView style={styles.container}>

            </GestureHandlerRootView>
        )
    } else {
        return (
            <View style={{...styles.container, backgroundColor: '#489AAB'}}>
                <RotateView/>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
})

export default SelectTenant;
