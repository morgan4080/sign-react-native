import React, {Dispatch} from 'react';
import {Modal, StyleSheet, Text, Pressable, View, TouchableOpacity} from 'react-native';
import {Raleway_600SemiBold, Raleway_400Regular, Raleway_700Bold, useFonts as useRale} from "@expo-google-fonts/raleway";
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
    useRale({
        Raleway_600SemiBold,
        Raleway_400Regular,
        Raleway_700Bold
    })
    return (
        <View style={[styles.centeredView, {display: modalVisible ? 'flex' : 'none'}]}>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text allowFontScaling={false} style={[styles.modalText, {fontFamily: "Raleway_700Bold", textTransform: "uppercase", marginBottom: 2, fontSize: 20 }]}>{title}</Text>
                        {description !== "" ? <Text allowFontScaling={false} style={[styles.modalText, {marginBottom: 15}]}>{description}</Text> : null}
                        {
                            lrErrors && lrErrors.map((err, index) => (
                                <Text allowFontScaling={false} key={index} style={styles.modalText}>{err.code}: {err.message ? err.message : "Your Loan Request has been received successfully but it's in a pending state. One of our agents will follow up within 48 hours."}</Text>
                            ))
                        }
                        <View style={{display: "flex", flexDirection: "column", width: '100%', marginBottom: 20, paddingBottom: 10, borderBottomWidth: 1, borderColor: 'rgba(0,0,0,0.05)'}}>
                            {
                                options && options.map((option, index) => (
                                    <TouchableOpacity key={index} style={[styles.options, {backgroundColor: option.selected ? 'rgba(72,154,171,0.25)': '#f2f2f2' }]} onPress={() => {
                                        cb({context: 'option', option});
                                        // setModalVisible(!modalVisible);
                                    }}>
                                        {option.selected ?
                                            <Ionicons style={{position: "absolute", right: 8}} name="radio-button-on-sharp" size={24} color="black"/> :
                                            <View style={{position: "absolute", right: 8, width: 22, height: 22, borderWidth: 1, borderRadius: 50, borderColor: '#CCCCCC'}}/>
                                        }
                                        <Text allowFontScaling={false} style={{fontFamily: 'Raleway_400Regular', fontSize: 13}}>{option.name}</Text>
                                    </TouchableOpacity>
                                ))
                            }
                        </View>
                        <View style={{display: "flex", flexDirection: "row", justifyContent: 'space-between', width: '100%'}}>
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
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.26)'
    },
    options: {
        display: "flex",
        justifyContent: "center",
        position: "relative",
        width: "100%",
        borderRadius: 20,
        backgroundColor: '#f2f2f2',
        padding: 12,
        marginBottom: 12
    },
    modalView: {
        backgroundColor: 'white',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 20,
        alignItems: 'flex-start',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '90%'
    },
    button: {
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 15,
        fontFamily: "Raleway_600SemiBold"
    },
    buttonClose: {
        borderWidth: 1,
        borderColor: '#e2e2e2'
    },
    buttonProceed: {
        backgroundColor: 'rgba(72,154,171,0.25)',
    },
    textStyle: {
        color: '#464646',
        textAlign: 'center',
    },
    modalText: {
        marginBottom: 10,
        paddingHorizontal: 5,
        textAlign: 'left',
        fontFamily: "Raleway_400Regular"
    },
});

export default GenericModal;