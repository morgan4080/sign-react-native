import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {useEffect} from "react";
import {NativeModules} from "react-native";
const { CountriesModule } = NativeModules;

type NavigationProps = NativeStackScreenProps<any>;

const Countries = ({ navigation }: NavigationProps) => {
    useEffect(() => {
        (async () => {
            let countriesJson = await CountriesModule.getCountries();
            if (countriesJson) {
                let countries: {name: string, code: string, numericCode: string, alpha2Code: string}[] = JSON.parse(countriesJson);
                const countries_data: {name: string, code: string, numericCode: string, alpha2Code: string, flag: any}[] = countries.reduce((acc: {name: string, code: string, numericCode: string, alpha2Code: string, flag: any}[], country: {name: string, code: string, numericCode: string, alpha2Code: string}) => {
                    acc.push({
                        ...country,
                        flag: `https://flagcdn.com/28x21/${country.alpha2Code.toLowerCase()}.png`
                    });
                    return acc
                }, []);

                console.log("all", countries_data);
            }
        })()
    })
    return (
        <>
        </>
    );
}

export default Countries;
