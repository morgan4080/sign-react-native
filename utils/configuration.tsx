// import {getSecureKey} from "./secureStore";


const config = () => {
    /*getSecureKey('access_token').then()

    const myHeaders = new Headers();

    myHeaders.append("Authorization", `Bearer ${key}`);
    myHeaders.append("Content-Type", 'application/json');

    await fetch('https://eguarantorship-api.presta.co.ke/api/v1/clientSettings/loan-settings', {
        method: 'POST',
        headers: myHeaders
    })*/
    return [
        {
            tenantId: 't72767',
            employerInfo: false,
            guarantors: 'count',
            witness: true,
            repaymentDisbursementModes: false,
            amounts: false,
            selfGuarantee: false
        },
        {
            tenantId: 't74411',
            employerInfo: true,
            guarantors: 'value',
            witness: false,
            repaymentDisbursementModes: true,
            amounts: true,
            selfGuarantee: true
        }
    ]
}

export default config()
