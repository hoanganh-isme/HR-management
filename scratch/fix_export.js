const fs = require('fs');
const path = 'd:/chuyenfile/clonecode/HR-Management/src/js/core/DynamicFormEngine.js';
let content = fs.readFileSync(path, 'utf8');

const targetStr = `html += '</table></body></html>';

                var blob = new Blob([html], { type: 'application/vnd.ms-excel' });
                var url = URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url;
                a.download = title + ".xls";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);`;

const replacementStr = `if (typeof XLSX !== 'undefined') {
                  var columns = window.tabulatorInstance.getColumns().filter(function (c) {
                    var f = c.getField();
                    return c.isVisible() && f && f !== 'row_select' && f !== '__action__';
                  });
                  var data = window.tabulatorInstance.getData('active');
                  var title = MODULE_CONFIG.PageTitle || MODULE_CONFIG.FormTitle || "Danh_sach_du_lieu";

                  var aoa = [];
                  var headerRow = columns.map(function (col) {
                    return col.getDefinition().title || col.getField();
                  });
                  aoa.push(headerRow);

                  data.forEach(function (row) {
                    var dataRow = columns.map(function (col) {
                      var field = col.getField();
                      var val = row[field];
                      if (field && field.toLowerCase() === 'personstatus') {
                        val = row.PersonStatusName || row.personstatusname || val;
                      }
                      return val != null ? val : '';
                    });
                    aoa.push(dataRow);
                  });

                  var wb = XLSX.utils.book_new();
                  var ws = XLSX.utils.aoa_to_sheet(aoa);
                  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
                  XLSX.writeFile(wb, title + ".xlsx");
                } else {
                  window.tabulatorInstance.download("xlsx", (MODULE_CONFIG.PageTitle || "Data") + ".xlsx", { sheetName: "Du_Lieu" });
                }`;

const normContent = content.replace(/\r\n/g, '\n');
const normTarget = targetStr.replace(/\r\n/g, '\n');

if (normContent.includes(normTarget)) {
  const newContent = normContent.replace(normTarget, replacementStr);
  fs.writeFileSync(path, newContent, 'utf8');
  console.log('REPLACE_SUCCESS');
} else {
  console.log('TARGET_NOT_FOUND');
}
