(function () {
  'use strict';

  ModuleRegistry.register(ModuleDefinition.create({
    id: 'WA_TimeSheetDayFrm',
    base: 'dynamic-crud',
    config: {
    FormName: 'WA_TimeSheetDayFrm',
    PrimaryKey: 'UserAutoID',
    HideAddBtn: true,
    HideEditBtn: true,
    HideDeleteBtn: true,
    HidePrintBtn: true
    }
  }));
})();

