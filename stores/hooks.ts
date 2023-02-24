import {TypedUseSelectorHook, useDispatch, useSelector} from "react-redux";
import {ApplicationDispatch, ApplicationState} from "./store";
import {useMemo} from "react";

export const useAppSelector: TypedUseSelectorHook<ApplicationState> = useSelector;

export const useAppDispatch: () => ApplicationDispatch = useDispatch;
export const useClientSettings = () => {
    const clientSettings = useAppSelector(state => state.auth.clientSettings)
    return useMemo(() => [clientSettings] as const, [clientSettings])
}
export const useOrganisations = () => {
    const organisations = useAppSelector(state => state.auth.organisations)
    return useMemo(() => [organisations] as const, [organisations])
}
export const useLoading = () => {
    const loading = useAppSelector(state => state.auth.loading)
    return useMemo(() => [loading] as const, [loading])
}
export const useMember = () => {
    const member = useAppSelector(state => state.auth.member)
    return useMemo(() => [member] as const, [member])
}
export const useUser = () => {
    const user = useAppSelector(state => state.auth.user)
    return useMemo(() => [user] as const, [user])
}