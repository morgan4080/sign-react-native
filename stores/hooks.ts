import {TypedUseSelectorHook, useDispatch, useSelector} from "react-redux";
import {ApplicationDispatch, ApplicationState} from "./store";

export const useAppSelector: TypedUseSelectorHook<ApplicationState> = useSelector;

export const useAppDispatch: () => ApplicationDispatch = useDispatch;
export const useClientSettings = () => {
    const clientSettings = useAppSelector(state => state.auth.clientSettings);
    return [clientSettings] as const
}
export const useSelectedTenant = () => {
    const selectedTenant = useAppSelector(state => state.auth.selectedTenant);
    return [selectedTenant] as const
}
export const useOrganisations = () => {
    const organisations = useAppSelector(state => state.auth.organisations);
    return [organisations] as const
}
export const useLoading = () => {
    const loading = useAppSelector(state => state.auth.loading);
    return [loading] as const
}
export const useLoanRequest = () => {
    const loanRequest = useAppSelector(state => state.auth.loanRequest);
    return [loanRequest] as const
}
export const useAppInitialized = () => {
    const appInitialized = useAppSelector(state => state.auth.appInitialized);
    return [appInitialized] as const
}
export const useMember = () => {
    const member = useAppSelector(state => state.auth.member);
    return [member] as const
}
export const useUser = () => {
    const user = useAppSelector(state => state.auth.user);
    return [user] as const
}
export const useTenants = () => {
    const tenants = useAppSelector(state => state.auth.tenants);
    return [tenants] as const
}
export const useLoggedInState = () => {
    const isLoggedIn = useAppSelector(state => state.auth.isLoggedIn);
    return [isLoggedIn] as const
}
export const useSelectedTenantId = () => {
    const selectedTenantId = useAppSelector(state => state.auth.selectedTenantId);
    return [selectedTenantId] as const
}
export const useTenant = () => {
    const [tenants] = useTenants();
    const [selectedTenantId] = useSelectedTenantId();
    const tenant = tenants.find(t => t.id === selectedTenantId);
    return [tenant] as const
}
export const useSettings = () => {
    const [organisations] = useOrganisations();
    const [tenant] = useTenant(); // FETCH TENANTS, FETCH ORGANISATIONS, FETCH USER
    const [user] = useUser();
    const settings = organisations.find(org => org.tenantId === (tenant ? tenant.tenantId : user?.tenantId));
    return [settings] as const
}
export const useStyle = () => {
    const tabStyle = useAppSelector(state => state.auth.tabStyle);
    return [tabStyle] as const
}
export const useLoanRequests = () => {
    const loanRequests = useAppSelector(state => state.auth.loanRequests);
    return [loanRequests] as const
}
export const useActorChanged = () => {
    const actorChanged = useAppSelector(state => state.auth.actorChanged);
    return [actorChanged] as const
}