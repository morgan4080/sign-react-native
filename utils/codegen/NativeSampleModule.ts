import type { TurboModule } from "react-native";
import { TurboModuleRegistry } from "react-native";

export interface Spec extends TurboModule {
    getCounty(code: string): {name: string, code: string, flag: string};
    getCountries(): {name: string, code: string, flag: string}[];
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeSampleModule');
