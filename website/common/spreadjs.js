function hideEvaluationVersion (workbook) {
    hideSheet(workbook, 'Evaluation Version');
}

function hideSheet (workbook, name) {
    workbook.setActiveSheet(name);
    var sheet = spread.getActiveSheet();
    if (sheet) {
        sheet.visible(false);
    }
}

function activeSheet (workbook, name) {
    workbook.setActiveSheet(name);
}

// function initStatusBar(spread) {

//     var statusBarDOM = document.getElementById('statusBar');
//     var statusBar = new GC.Spread.Sheets.StatusBar.StatusBar(statusBarDOM);
//     statusBar.bind(spread);
//     statusBar.remove("zoom");
//     statusBar.remove("cellMode");
//     statusBar.remove("zoomSlider");
//     return statusBar;
// }

// function LoadingStatus(name, options) {
// 	GC.Spread.Sheets.StatusBar.StatusItem.call(this, name, options);
// }
// LoadingStatus.prototype = new GC.Spread.Sheets.StatusBar.StatusItem();
// LoadingStatus.prototype.onCreateItemView = function (container) {
// 	var statusBarDiv = this.contentDiv = document.createElement('div');
// 	statusBarDiv.innerHTML = `
//                     <span>Khởi tạo thành công</span>
// 					<span style="width: 150px;height: 9px;border: solid 1px white;display: none;margin-left: 10px; line-height: 0px;">
// 						<span style="width: 93px;height: 9px;background-color: white;display: inline-block;"></span>
// 					</span>`;
// 	statusBarDiv.style.padding = "0 3px";
// 	container.appendChild(statusBarDiv);
// };
// LoadingStatus.prototype.updateProgress = function (progress, args) {
// 	progress = progress * 100;
// 	this.contentDiv.children[0].innerText = "Đang xử lý: " + progress.toFixed(2) + "%";
// 	this.contentDiv.children[1].style.display = "inline-block";
// 	this.contentDiv.children[1].children[0].style.width = progress * 1.5 + "px";
// };
// LoadingStatus.prototype.updateText = function (text) {
// 	this.contentDiv.children[0].innerText = text;
// 	this.contentDiv.children[1].style.display = "none";
// };