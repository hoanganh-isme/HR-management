/*
 * Registered lookup APIs are execution allow-lists, not form metadata.
 * Form contracts and rollout state are resolved exclusively from the DB registry.
 */
const REGISTERED_LOOKUPS = Object.freeze({
    'wa_calamviecfrm|shiftidthu2': Object.freeze({
        webFormName: 'WA_CaLamViecFrm',
        fieldName: 'ShiftIDThu2',
        registeredList: 'API_HR_DropdownShifts',
        valueField: 'ShiftID',
        displayField: 'ShiftName'
    })
});

export function getRegisteredLookupContract(webFormName, fieldName) {
    const key = `${String(webFormName || '').trim().toLowerCase()}|${String(fieldName || '').trim().toLowerCase()}`;
    return REGISTERED_LOOKUPS[key];
}
