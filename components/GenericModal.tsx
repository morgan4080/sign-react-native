import React, {Dispatch, useState} from 'react';
import {Modal, StyleSheet, Text, Pressable, View, useWindowDimensions, TouchableOpacity} from 'react-native';
import {Raleway_600SemiBold, Raleway_400Regular, useFonts as useRale} from "@expo-google-fonts/raleway";
import {ErrorsType} from "../screens/Loans/LoanConfirmation";
import {Ionicons} from "@expo/vector-icons";
interface ComponentProps {
    modalVisible: boolean;
    setModalVisible: Dispatch<any>
    title: string;
    description: string;
    lrErrors?: ErrorsType;
    cb: (option?: {context: string; option?: {name: string, value: string, selected: boolean}}) => void;
    options?: {name: string, value: string, selected: boolean}[] | null;
}
const GenericModal = ({modalVisible, setModalVisible, title, description, lrErrors, cb, options = null}: ComponentProps) => {
    console.log(options)
    const {width, height} = useWindowDimensions()
    useRale({
        Raleway_600SemiBold,
        Raleway_400Regular
    })
    return (
        <View style={styles.centeredView}>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text allowFontScaling={false} style={[styles.modalText, {fontFamily: "Raleway_600SemiBold", textTransform: "uppercase" }]}>{title}</Text>
                        {description !== "" ? <Text allowFontScaling={false} style={styles.modalText}>{description}</Text> : null}
                        {
                            lrErrors && lrErrors.map((err, index) => (
                                <Text allowFontScaling={false} key={index} style={styles.modalText}>{err.code}: {err.message ? err.message : "Your Loan Request has been received successfully but it's in a pending state. One of our agents will follow up within 48 hours."}</Text>
                            ))
                        }
                        <View style={{display: "flex", flexDirection: "column", width: width * 0.5, marginBottom: 20}}>
                            {
                                options && options.map((option, index) => (
                                    <TouchableOpacity key={index} style={styles.options} onPress={() => {
                                        cb({context: 'option', option});
                                        setModalVisible(!modalVisible);
                                    }}>
                                        {option.selected ?
                                            <Ionicons style={{position: "absolute", right: 8}} name="radio-button-on-sharp" size={24} color="black"/> :
                                            <View style={{position: "absolute", right: 8, width: 22, height: 22, borderWidth: 1, borderRadius: 50, borderColor: '#CCCCCC'}}/>
                                        }
                                        <Text allowFontScaling={false} style={{fontFamily: 'Raleway_600SemiBold', fontSize: 14}}>{option.name}</Text>
                                    </TouchableOpacity>
                                ))
                            }
                        </View>
                        <View style={{display: "flex", flexDirection: "row"}}>
                            <Pressable
                                style={[styles.button, styles.buttonClose]}
                                onPress={() => {
                                    cb({context: 'dismiss'})
                                    setModalVisible(!modalVisible)
                                }}>
                                <Text allowFontScaling={false} style={styles.textStyle}>Dismiss</Text>
                            </Pressable>
                            <Pressable
                                style={[styles.button, styles.buttonProceed]}
                                onPress={() => {
                                    cb({context: 'proceed'})
                                    setModalVisible(!modalVisible)
                                }}>
                                <Text allowFontScaling={false} style={styles.textStyle}>Proceed</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    options: {
        display: "flex",
        justifyContent: "center",
        position: "relative",
        width: "100%",
        borderRadius: 12,
        borderColor: 'rgba(204,204,204,0.54)',
        borderWidth: 1,
        padding: 10,
        marginBottom: 10
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    button: {
        borderRadius: 20,
        paddingVertical: 10,
        elevation: 2,
        marginHorizontal: 20,
        paddingHorizontal: 15,
        fontFamily: "Raleway_600SemiBold"
    },
    buttonClose: {
        backgroundColor: '#ff4a4a',
    },
    buttonProceed: {
        backgroundColor: '#0082A0',
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
        fontFamily: "Raleway_400Regular"
    },
});

export default GenericModal;