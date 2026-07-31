export const DASHBOARD_QUERIES = Object.freeze({
    API_HR_Dashboard_GetBranches: Object.freeze({ procedure: 'API_HR_Dashboard_GetBranches' }),
    API_HR_Dashboard_OverviewToday: Object.freeze({ procedure: 'API_HR_Dashboard_OverviewToday' }),
    API_HR_Dashboard_Demographics: Object.freeze({ procedure: 'API_HR_Dashboard_Demographics' }),
    API_HR_Dashboard_Department: Object.freeze({ procedure: 'API_HR_Dashboard_Department' }),
    API_HR_Dashboard_Birthdays: Object.freeze({ procedure: 'API_HR_Dashboard_Birthdays' }),
    API_HR_Dashboard_Payroll: Object.freeze({
        procedure: 'API_HR_Dashboard_Payroll',
        period: true
    }),
    API_HR_Dashboard_ContractsExpiring: Object.freeze({
        procedure: 'API_HR_Dashboard_ContractsExpiring',
        days: true
    })
});

export function getDashboardQuery(queryName) {
    return DASHBOARD_QUERIES[String(queryName || '').trim()] || null;
}
