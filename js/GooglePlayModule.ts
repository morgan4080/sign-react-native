import type { TurboModule } from "react-native";
import { TurboModuleRegistry } from "react-native";

export interface Spec extends TurboModule {
    startInAppUpdate(requestCode: number): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('GooglePlayModule');