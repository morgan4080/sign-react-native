import {Text, TouchableOpacity, View, StyleSheet} from "react-native";
import Checkbox from 'expo-checkbox';
import {AntDesign, MaterialIcons} from "@expo/vector-icons";
import {useState} from "react";
import cloneDeep from "lodash/cloneDeep";
import {
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium, Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Poppins_900Black,
    useFonts
} from "@expo-google-fonts/poppins";
type categoryType = {code: string, name: string, options: {code: string, name: string, selected: boolean, options: {code: string, name: string, selected: boolean}[]}[]}
interface propsInterface {
    category: categoryType,
    componentIndex: number,
    currentOpenIndex: number,
    isOpen: any,
    setFormData: any,
}
export default function LoanPurposeTile({category, componentIndex, currentOpenIndex, isOpen, setFormData}: propsInterface) {

    const [selectedCategory, setSelectedCategory] = useState<categoryType | null>();
    const [expanded, setExpanded] = useState('-1');

    let [fontsLoaded] = useFonts({
        Poppins_900Black,
        Poppins_500Medium,
        Poppins_800ExtraBold,
        Poppins_700Bold,
        Poppins_600SemiBold,
        Poppins_400Regular,
        Poppins_300Light
    });

    const setSelected = () => {
        isOpen(componentIndex)
        setSelectedCategory(category)
    }

    const deselect = () => {
        isOpen(-1)
        setSelectedCategory(null)
    }

    const updateCopyCategory = (selVal: boolean, index: number) => {
        let copyCategory = cloneDeep(selectedCategory);

        if (copyCategory) {
            copyCategory.options[index].selected = selVal;
            setSelectedCategory(copyCategory)
        }
    }

    const updateSubCopyCategory = (checkBoxVal: boolean, index: number, i: number) => {
        let copyCategory = cloneDeep(selectedCategory)

        if (copyCategory) {
            copyCategory.options[index].selected = true;
            copyCategory.options[index].options[i].selected = checkBoxVal;
            setSelectedCategory(copyCategory)
            setFormData(copyCategory)
        }
    }

    return (
        <>
            <TouchableOpacity style={styles.tile} onPress={() => currentOpenIndex === componentIndex ? deselect() : setSelected()}>
                <Text allowFontScaling={false} style={{color: '#ADADAD', fontFamily: 'Poppins_400Regular', fontSize: 13, maxWidth: 250}}>{ category.name }</Text>
                {currentOpenIndex !== componentIndex && <MaterialIcons name="keyboard-arrow-right" size={40} color="#ADADAD" />}
                {currentOpenIndex === componentIndex && <MaterialIcons name="keyboard-arrow-down" size={40} color="#ADADAD" />}
            </TouchableOpacity>
            {
                currentOpenIndex === componentIndex && (
                    <View style={styles.categoryOption}>
                        { selectedCategory && selectedCategory.options.map((op, i) => (
                            <View key={op.code} collapsable={false}>
                                <View style={styles.checkboxContainer}>
                                    <TouchableOpacity onPress={() => {
                                        op.code === expanded ? setExpanded('-1') : setExpanded(op.code)
                                        updateCopyCategory(op.code !== expanded, i)
                                    }} style={{display: 'flex', flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(204,204,204,0.24)', width: '100%', borderRadius: 25 }}>
                                        <Text allowFontScaling={false} style={{...styles.label, fontFamily: 'Poppins_600SemiBold', marginRight: 4, marginLeft: 18, fontSize: 12}}>{ op.name }</Text>
                                        {expanded !== op.code && <AntDesign name="caretright" size={10} color="white"/>}
                                        {expanded === op.code && <AntDesign name="caretdown" size={10} color="white"/>}
                                    </TouchableOpacity>
                                </View>

                                <View style={{marginBottom: expanded === op.code ? 20 : 0}}>
                                    {
                                        expanded === op.code  && op.options.map((o, index) => {
                                            return (
                                                <View key={o.code} style={{ display: 'flex', flexDirection: 'row' }} collapsable={false}>
                                                    <Checkbox
                                                        style={styles.checkbox}
                                                        value={o.selected}
                                                        onValueChange={(newValue) => updateSubCopyCategory(newValue, i, index)}
                                                        color={o.selected ? 'rgb(141,141,141)' : '#FFFFFF'}
                                                    />
                                                    <Text allowFontScaling={false} style={{ ...styles.label, fontSize: 12, letterSpacing: 1 }}>{ o.name }</Text>
                                                </View>
                                            )
                                        })
                                    }
                                </View>
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
        paddingTop: 30,
        paddingBottom: 10,
        marginTop: -15,
        backgroundColor: '#489AAB',
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
        marginBottom: 10,
        paddingVertical: 5
    },
    checkbox: {
        alignSelf: "center",
        height: 20,
        width: 20
    },
    label: {
        margin: 8,
        color: '#FFFFFF',
        fontFamily: 'Poppins_400Regular'
    },
})
