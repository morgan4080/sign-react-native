import {Dispatch, SetStateAction, useState} from "react";

function useGenericState<T>(customObject: T): [T | {}, Dispatch<SetStateAction<T | {}>>] {
    const [data, setData] = useState<T | {}>({})
    return [data, setData]
}

export default useGenericState