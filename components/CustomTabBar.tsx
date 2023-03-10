import {TouchableOpacity, View, Text, StyleSheet} from "react-native";
import {BottomTabBarProps} from "@react-navigation/bottom-tabs";
import {Poppins_300Light,useFonts} from "@expo-google-fonts/poppins";
import {useAppDispatch, useStyle} from "../stores/hooks";
import {setTabStyle} from "../stores/auth/authSlice";
import {AntDesign} from "@expo/vector-icons";

const CustomTabBar = ({ state, descriptors, navigation }:  BottomTabBarProps) => {
    const dispatch = useAppDispatch()
    const [tabStyle] = useStyle();
    useFonts({
        Poppins_300Light
    })
    return (
        <View style={[tabStyle, { display: "flex", flexDirection: "column", alignItems: "center" }]}>
            <TouchableOpacity
                style={{ marginBottom: -25, zIndex: 1, backgroundColor: "#FFFFFF", borderRadius: 100 }}
                onPress={() => navigation.navigate("LoanProducts")}
            >
                <AntDesign name="pluscircle" size={50} color="#489AABFF" style={{ padding: 5 }} />
            </TouchableOpacity>
            <View style={[styles.bottomContainer]}>
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const TabIcon: any = options.tabBarIcon;
                    // if (options.tabBarStyle) dispatch(setTabStyle(options.tabBarStyle));
                    const label: any =
                        options.tabBarLabel !== undefined
                            ? options.tabBarLabel
                            : options.title !== undefined
                                ? options.title
                                : route.name;

                    const isFocused = state.index === index;

                    const onPress = () => {
                        const payload: any = {
                            type: 'tabPress',
                            target: route.key,
                        }
                        const event: any = navigation.emit(payload);

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    const onLongPress = () => {
                        navigation.emit({
                            type: 'tabLongPress',
                            target: route.key,
                        });
                    };

                    return (
                        <TouchableOpacity
                            key={index}
                            accessibilityRole="button"
                            accessibilityState={isFocused ? { selected: true } : {}}
                            accessibilityLabel={options.tabBarAccessibilityLabel}
                            testID={options.tabBarTestID}
                            onPress={onPress}
                            onLongPress={onLongPress}
                            style={{ flex: 1, backgroundColor: isFocused ? "rgba(72,154,171,0.1)" : "#FFFFFF", borderRadius: 12, padding: 5 }}
                        >
                            <View style={{ display: "flex", flexDirection: "column", alignItems: "center", position: 'relative' }}>
                                <TabIcon focused={isFocused} color={isFocused ? 'rgb(72,154,171)' : '#222'} size={20}/>
                                <Text allowFontScaling={false} style={[styles.label, {color: isFocused ? 'rgb(72,154,171)' : '#222'}]}>
                                    {label}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    bottomContainer: {
        flexDirection: 'row',
        padding: 8,
        backgroundColor: "#FFFFFF",
        marginHorizontal: 16,
        marginBottom: 10,
        borderRadius: 12,
        elevation: 6
    },
    label: {
        fontFamily: "Poppins_300Light",
        letterSpacing: 0.6,
        fontSize: 12,
        marginTop: 5
    }
})

export default CustomTabBar;