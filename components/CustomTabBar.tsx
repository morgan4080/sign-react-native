import {TouchableOpacity, View, Text, StyleSheet} from "react-native";
import {BottomTabBarProps} from "@react-navigation/bottom-tabs";
import {Poppins_300Light,useFonts} from "@expo-google-fonts/poppins";
import {useStyle} from "../stores/hooks";

const CustomTabBar = ({ state, descriptors, navigation }:  BottomTabBarProps) => {
    const [tabStyle] = useStyle();
    useFonts({
        Poppins_300Light
    })
    return (
        <View style={[tabStyle, { display: "flex", flexDirection: "column", alignItems: "center" }]}>
            <View style={[styles.bottomContainer]}>
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const TabIcon: any = options.tabBarIcon;
                    let label: any =
                        options.tabBarLabel !== undefined
                            ? options.tabBarLabel
                            : options.title !== undefined
                                ? options.title
                                : route.name;

                    const labelArray = label.split(" ");

                    label = labelArray[labelArray.length - 1];

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
                            style={{ flex: 1, backgroundColor: isFocused ? "rgba(72,154,171,0.1)" : "#FFFFFF", borderRadius: 12, marginHorizontal: 1, padding: 5 }}
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
        marginHorizontal: 16,
        marginBottom: 10,
        borderRadius: 12,
        backgroundColor: 'transparent',
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