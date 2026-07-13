window.DashboardModuleConfig = ModuleConfigNormalizer.normalize({
  FormName: 'HR_Dashboard',
  operations: {
    branches: { sp: 'API_HR_Dashboard_GetBranches', func: 'View' },
    overview: { sp: 'API_HR_Dashboard_OverviewToday', func: 'View' },
    demographics: { sp: 'API_HR_Dashboard_Demographics', func: 'View' },
    department: { sp: 'API_HR_Dashboard_Department', func: 'View' },
    birthdays: { sp: 'API_HR_Dashboard_Birthdays', func: 'View' },
    payroll: { sp: 'API_HR_Dashboard_Payroll', func: 'View' },
    contractsExpiring: { sp: 'API_HR_Dashboard_ContractsExpiring', func: 'View' }
  }
});
