import {Text, TouchableOpacity, View, StyleSheet} from "react-native";
import Checkbox from 'expo-checkbox';
import {MaterialIcons} from "@expo/vector-icons";
import * as React from "react";
import {useState} from "react";
type categoryType = {name: string, options: {name: string, selected: boolean}[]}
interface propsInterface {
    category: categoryType,
    componentIndex: number,
    currentOpenIndex: number,
    isOpen: any,
    setFormData: any,
}
export default function LoanPurposeTile({category, componentIndex, currentOpenIndex, isOpen, setFormData}: propsInterface) {

    const [selectedCategory, setSelectedCategory] = useState<categoryType | null>();

    const setSelected = () => {
        isOpen(componentIndex)
        setSelectedCategory(category)
    }

    const deselect = () => {
        isOpen(-1)
        setSelectedCategory(null)
    }

    const updateCopyCategory = (checkBoxVal: boolean, index: number) => {
        let copyCategory = Object.assign({}, selectedCategory);

        copyCategory.options[index].selected = checkBoxVal;

        setSelectedCategory(copyCategory)

        setFormData(copyCategory)
    }

    return (
        <>
            <TouchableOpacity style={styles.tile} onPress={() => currentOpenIndex === componentIndex ? deselect() : setSelected()}>
                <Text style={{color: '#ADADAD', fontFamily: 'Poppins_400Regular'}}>{ category.name }</Text>
                {currentOpenIndex !== componentIndex && <MaterialIcons name="keyboard-arrow-right" size={40} color="#ADADAD" />}
                {currentOpenIndex === componentIndex && <MaterialIcons name="keyboard-arrow-down" size={40} color="#ADADAD" />}
            </TouchableOpacity>
            {
                currentOpenIndex === componentIndex && (
                    <View style={styles.categoryOption}>
                        { selectedCategory && selectedCategory.options.map((op, i) => (
                            <View key={i} style={styles.checkboxContainer} collapsable={false}>
                                <Checkbox
                                    style={styles.checkbox}
                                    value={op.selected}
                                    onValueChange={(newValue) => updateCopyCategory(newValue, i) }
                                    color={op.selected ? 'rgb(141,141,141)' : '#FFFFFF'}
                                />
                                <Text style={styles.label}>{ op.name }</Text>
                            </View>
                        ))}
                    </View>
                )
            }
        </>
    )
}

const styles = StyleSheet.create({
    tile: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 20,
        marginTop: 20,
        height: 74,
        paddingHorizontal: 20,
        shadowColor: 'rgba(0,0,0, .4)', // IOS
        shadowOffset: { height: 1, width: 1 }, // IOS
        shadowOpacity: 1, // IOS
        shadowRadius: 1, //IOS
        backgroundColor: '#FFFFFF',
        elevation: 10, // Android
    },
    categoryOption: {
        display: 'flex',
        flexDirection: 'column',
        paddingHorizontal: 50,
        paddingTop: 40,
        paddingBottom: 10,
        marginTop: -15,
        backgroundColor: '#323492',
        borderBottomRightRadius: 25,
        borderBottomLeftRadius: 25,
        shadowColor: 'rgba(0,0,0, .4)', // IOS
        shadowOffset: { height: 1, width: 1 }, // IOS
        shadowOpacity: 1, // IOS
        shadowRadius: 1, //IOS
        elevation: 8, // Android
    },
    checkboxContainer: {
        display: 'flex',
        flexDirection: "row",
        marginBottom: 20,
        paddingTop: 5
    },
    checkbox: {
        alignSelf: "center",
    },
    label: {
        margin: 8,
        color: '#FFFFFF'
    },
})
