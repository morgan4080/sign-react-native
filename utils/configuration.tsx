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
            tenantName: 'Imarisha Sacco',
            tenantId: 't72767',
            clientSecret: '238c4949-4c0a-4ef2-a3de-fa39bae8d9ce',
            employerInfo: false,
            guarantors: 'count',
            witness: true,
            repaymentDisbursementModes: true,
            amounts: false,
            selfGuarantee: false,
            minGuarantors: 4
        },
        {
            tenantName: 'Wanaanga Sacco',
            tenantId: 't74411',
            clientSecret: '25dd3083-d494-4af5-89a1-104fa02ef782',
            employerInfo: true,
            guarantors: 'value',
            witness: false,
            repaymentDisbursementModes: true,
            amounts: true,
            selfGuarantee: true,
            minGuarantors: 1
        }
    ]
}

export default config()
