import {TypedUseSelectorHook, useDispatch, useSelector} from "react-redux";
import {ApplicationDispatch, ApplicationState} from "./store";
import {useMemo} from "react";

export const useAppSelector: TypedUseSelectorHook<ApplicationState> = useSelector;

export const useAppDispatch: () => ApplicationDispatch = useDispatch;
export const useClientSettings = () => {
    const clientSettings = useAppSelector(state => state.auth.clientSettings);
    return useMemo(() => [clientSettings] as const, [clientSettings]);
}
export const useOrganisations = () => {
    const organisations = useAppSelector(state => state.auth.organisations);
    return useMemo(() => [organisations] as const, [organisations]);
}
export const useLoading = () => {
    const loading = useAppSelector(state => state.auth.loading);
    return useMemo(() => [loading] as const, [loading]);
}
export const useMember = () => {
    const member = useAppSelector(state => state.auth.member);
    return useMemo(() => [member] as const, [member]);
}
export const useUser = () => {
    const user = useAppSelector(state => state.auth.user);
    return useMemo(() => [user] as const, [user]);
}
export const useTenants = () => {
    const tenants = useAppSelector(state => state.auth.tenants);
    return useMemo(() => [tenants] as const, [tenants]);
}
export const useSelectedTenantId = () => {
    const selectedTenantId = useAppSelector(state => state.auth.selectedTenantId);
    return useMemo(() => [selectedTenantId] as const, [selectedTenantId]);
}
export const useTenant = () => {
    const [tenants] = useTenants();
    const [selectedTenantId] = useSelectedTenantId();
    const tenant = tenants.find(t => t.id === selectedTenantId);
    return useMemo(() => [tenant] as const, [tenant])
}
export const useSettings = () => {
    const [organisations] = useOrganisations();
    const [tenant] = useTenant();
    const [user] = useUser();
    const settings = organisations.find(org => org.tenantId === (tenant ? tenant.tenantId : user?.tenantId));
    return useMemo(() => [settings] as const, [settings])
}
export const useStyle = () => {
    const tabStyle = useAppSelector(state => state.auth.tabStyle);
    return useMemo(() => [tabStyle] as const, [tabStyle]);
}
export const useLoanRequests = () => {
    const loanRequests = useAppSelector(state => state.auth.loanRequests);
    return useMemo(() => [loanRequests] as const, [loanRequests]);
}
export const useActorChanged = () => {
    const actorChanged = useAppSelector(state => state.auth.actorChanged);
    return useMemo(() => [actorChanged] as const, [actorChanged]);
}