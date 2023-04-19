import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {useEffect, useState} from "react";
import {debounce} from 'lodash';
import {
    Dimensions,
    View,
    StyleSheet,
    StatusBar,
    SafeAreaView,
    Text,
    TextInput,
    Pressable
} from "react-native";
import {
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_800ExtraBold,
    Poppins_900Black,
    useFonts
} from "@expo-google-fonts/poppins";
import {RotateView} from "../Auth/VerifyOTP";
import {AntDesign} from "@expo/vector-icons";
import CountrySectionList from "../../components/CountrySectionList";
import {Controller, useForm} from "react-hook-form";
import {getCountries} from "../../utils/useCountries";

type NavigationProps = NativeStackScreenProps<any>;

const { width, height } = Dimensions.get("window");

const Countries = ({ navigation, route }: NavigationProps) => {
    let [fontsLoaded] = useFonts({
        Poppins_900Black,
        Poppins_500Medium,
        Poppins_800ExtraBold,
        Poppins_600SemiBold,
        Poppins_400Regular,
        Poppins_300Light
    });

    const [countriesData, setCountriesData] = useState<{title: string, data: {name: string, code: string, numericCode: string, alpha2Code: string, flag: any}[]}[]>([]);

    useEffect(() => {
        (async () => {
            let countriesJson: any = await getCountries();
            if (countriesJson) {
                let countries: {name: string, code: string, numericCode: string, alpha2Code: string}[] = countriesJson;
                const countries_data: {name: string, code: string, numericCode: string, alpha2Code: string, flag: any}[] = countries.reduce((acc: {name: string, code: string, numericCode: string, alpha2Code: string, flag: any}[], country: {name: string, code: string, numericCode: string, alpha2Code: string}) => {
                    acc.push({
                        ...country,
                        flag: `https://flagcdn.com/28x21/${country.alpha2Code.toLowerCase()}.png`
                    });
                    return acc
                }, []);
                setCountriesData([{
                    title: "Choose a country",
                    data: countries_data
                }])
            }
        })()
    }, [])

    const [searching, setSearching] = useState<boolean>(false);

    const handleSearch = (event: string) => {
        const debouncedSave = debounce(async () =>{
            type countryType = {name: string, code: string, numericCode: string, alpha2Code: string, flag: any}
            if (countriesData.length > 0) {
                const filtered = countriesData[0].data.reduce((acc: countryType[], country: countryType) => {
                    if (country.name.toLowerCase().indexOf((event || '').toLowerCase()) > -1) {
                        acc.push(country)
                    }
                    return acc;
                }, []);

                setCountriesData([
                    {
                        title: countriesData[0].title,
                        data: filtered
                    }
                ]);
            } else {
                let countriesJson: any = await getCountries();
                if (countriesJson) {
                    let countries: {name: string; code: string; numericCode: string; alpha2Code: string;}[] = countriesJson;
                    const countries_data: {name: string; code: string; numericCode: string; alpha2Code: string; flag: any;}[] = countries.reduce((acc: {name: string, code: string, numericCode: string, alpha2Code: string, flag: any}[], country: {name: string, code: string, numericCode: string, alpha2Code: string}) => {
                        acc.push({
                            ...country,
                            flag: `https://flagcdn.com/28x21/${country.alpha2Code.toLowerCase()}.png`
                        });
                        return acc
                    }, []);
                    const filtered =  countries_data.reduce((acc: countryType[], country: countryType) => {
                        if (country.name.toLowerCase().indexOf((event || '').toLowerCase()) > -1) {
                            acc.push(country)
                        }
                        return acc;
                    }, []);
                    setCountriesData([{
                        title: "Choose a country",
                        data: filtered
                    }])
                }
            }

        }, 10);

        debouncedSave();
    }

    type FormData = {searchTerm: string}
    const {
        control,
        watch,
        formState: { errors }
    } = useForm<FormData>({

    });

    useEffect(() => {
        const subscription = watch((value, { name, type }) => {
            (async () => {
                switch (name) {
                    case 'searchTerm':
                        try {
                            handleSearch(`${value.searchTerm}`)
                        } catch (e: any) {
                            console.log("some error", e)
                        }
                        break;
                }
            })()
        });
        return () => subscription.unsubscribe();
    },[watch]);

    const navigationSet = (code: string, numericCode?: string, alpha2Code?: string, flag?: string): void => {
        if (route.params && route.params.previous) {
            navigation.navigate(route.params.previous, {
                code,
                numericCode,
                alpha2Code,
                flag
            })
        } else {
            navigation.navigate('GetTenants', {
                code,
                numericCode,
                alpha2Code,
            })
        }

    }

    if (fontsLoaded) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.searchableHeader}>
                    <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                        <Pressable style={{alignSelf: 'flex-start'}} onPress={() => {
                            if (searching) {
                                setSearching(!searching);
                            } else {
                                navigation.goBack();
                            }
                        }}>
                            <AntDesign name="arrowleft" size={24} color="rgba(0,0,0,0.89)" />
                        </Pressable>

                        {
                            searching ?

                                <Controller
                                    control={control}
                                    render={( { field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            allowFontScaling={false}
                                            style={{paddingLeft: 20, fontFamily: 'Poppins_500Medium', fontSize: 14, minWidth: width/1.5}}
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            value={value}
                                            placeholder="Search Country"
                                            autoFocus={true}
                                        />
                                    )}
                                    name="searchTerm"
                                />

                                : <Text allowFontScaling={false} style={styles.header}>Select a country</Text>
                        }
                    </View>

                    <Pressable onPress={() => {
                        setSearching(!searching);
                    }}>
                        <AntDesign style={{paddingHorizontal: 10}} name="search1" size={20} color="rgba(0,0,0,0.89)" />
                    </Pressable>
                </View>
                <CountrySectionList countriesData={countriesData} searching={searching} navigationSet={navigationSet}/>
            </SafeAreaView>
        );
    } else {
        return (
            <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height, width }}>
                <RotateView/>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: StatusBar.currentHeight,
        marginHorizontal: 0
    },
    searchableHeader: {
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: "#FFFFFF",
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15
    },
    item: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: "#FFFFFF",
        padding: 20
    },
    header: {
        fontSize: 22,
        color: 'rgba(0,0,0,0.89)',
        paddingLeft: 20,
        fontFamily: 'Poppins_500Medium'
    },
    title: {
        fontSize: 20,
        fontFamily: 'Poppins_400Regular'
    }
});

export default Countries;
