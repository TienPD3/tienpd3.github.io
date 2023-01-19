function hideEvaluationVersion (workbook) {
    hideSheet(workbook, 'Evaluation Version');
}

function hideSheet(workbook, name) {
    workbook.setActiveSheet(name);
    var sheet = spread.getActiveSheet();
    if (sheet) {
        sheet.visible(false);
    }
}