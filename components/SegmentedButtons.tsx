import {ScrollView, StyleSheet, TouchableOpacity, Text, View} from "react-native";
import {useFonts, Poppins_600SemiBold} from "@expo-google-fonts/poppins";
import {Dispatch, useState} from "react";
import {cloneDeep} from "lodash";
interface ComponentProps {
    buttons: {
        id: number;
        label: string;
        selected: boolean;
    }[],
    toggleButton: (payload: { id: number; label: string; selected: boolean; }) => void
}
const SegmentedButtons = ({buttons, toggleButton}: ComponentProps) => {
    useFonts({
        Poppins_600SemiBold
    })
    return (
        <ScrollView contentContainerStyle={{flex: 1}} style={styles.scroll} horizontal>
            {
                buttons.map((button, i) => {
                   return (
                        <TouchableOpacity onPress={() => toggleButton(button)} key={i}
                                          style={[styles.button, {backgroundColor: button.selected ? "#489bab" : "rgba(72,155,171,0)"}]}>
                            <Text allowFontScaling={false}
                                  style={[styles.buttonText, {color: button.selected ? "#FFFFFF" : "rgba(0,0,0,0.47)"}]}>{button.label}</Text>
                        </TouchableOpacity>
                    )
                })
            }
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    scroll: {
        marginTop: 20,
        padding: 5,
        marginBottom: 10,
        marginHorizontal: 16,
        borderRadius: 22,
        backgroundColor: "rgba(72,154,171,0.25)"
    },
    button: {
        borderRadius: 22,
        paddingHorizontal: 20,
        paddingVertical: 5
    },
    buttonText: {
        fontSize: 15,
        fontFamily: "Poppins_600SemiBold"
    }
})

export default SegmentedButtons