import type { TurboModule } from "react-native";
import { TurboModuleRegistry } from "react-native";

export interface Spec extends TurboModule {
    startInAppUpdate(requestCode: number): void;
    popSnackBarForUserConfirmation(message: string): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('GooglePlayModule');