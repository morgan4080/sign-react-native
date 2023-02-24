import {Controller, FieldError} from "react-hook-form";
import {Switch, View, Text, StyleSheet} from "react-native";
import {useEffect, useState} from "react";
import {Control, UseFormWatch} from "react-hook-form/dist/types/form";
import {Poppins_300Light, Poppins_500Medium, useFonts} from "@expo-google-fonts/poppins";

interface SProps<T> {
    label: string;
    field: any;
    watch: UseFormWatch<Record<string, any>>;
    control: Control<any>;
}
const SwitchField = <T extends object>({label, field, watch, control}: SProps<T>) => {
    const [isEnabled, setIsEnabled] = useState(false);
    const toggleSwitch = () => setIsEnabled((previousState: boolean) => !previousState);
    const [value, setValue] = useState("");

    useFonts({
        Poppins_500Medium,
        Poppins_300Light
    })

    useEffect(() => {
        const subscription = watch((value, { name, type }) => {
            switch (name) {
                case 'field':
                    setValue(value.field as string);
                    break;
            }
        });
        return () => subscription.unsubscribe();
    }, [watch])
    return(
        <View style={styles.switchContainer}>
            <Text allowFontScaling={false} style={styles.label}>{`${label}`}</Text>
            <Controller
                control={control}
                render={( {field: {onChange, onBlur, value}}) => (
                    <Switch
                        trackColor={{false: "#767577", true: "#489AAB"}}
                        thumbColor={isEnabled ? "#FFFFFF" : "#f4f3f4"}
                        onValueChange={toggleSwitch}
                        value={isEnabled}
                    />
                )}
                name={field}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    label: {fontSize: 14, color: '#767577', fontFamily: 'Poppins_500Medium'},
    switchContainer: {display: "flex", flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 10, marginTop: 30}
})

export default SwitchField