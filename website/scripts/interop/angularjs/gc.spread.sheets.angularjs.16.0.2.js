/*
 *
 * SpreadJS Library
 *
 * Copyright(c) GrapeCity, Inc.  All rights reserved.
 *
 * Licensed under the SpreadJS Commercial License.
 * us.sales@grapecity.com
 * http://www.grapecity.com/en/licensing/grapecity/
 *
 *
 **/
var angular = angular, GC = GC, $ = $; // for eslint
(function () {
    'use strict';

    var m = angular.module('gcspreadsheets', []);

    function ColumnWrapper() {
        this.headerText = '';
        this.dataField = '';
    }

    ColumnWrapper.prototype = {
        width: function (value) {
            if (arguments.length === 0) {
                if (this.column) {
                    return this.column.width();
                }
                return undefined;
            }
            this._width = value;
            if (this.column) {
                this.column.width(value);
            }
            return this;
        },
        visible: function (value) {
            if (arguments.length === 0) {
                if (this.column) {
                    return this.column.visible();
                }
                return undefined;
            }
            this._visible = value;
            if (this.column) {
                this.column.visible(value);
            }
            return this;
        }, resizable: function (value) {
            if (arguments.length === 0) {
                if (this.column) {
                    return this.column.resizable();
                }
                return undefined;
            }
            this._resizable = value;
            if (this.column) {
                this.column.resizable(value);
            }
            return this;
        },
        defaultStyle: function (value) {
            if (arguments.length === 0) {
                if (this.sheet) {
                    return this.sheet.getStyle(-1, this.index, GC.Spread.Sheets.SheetArea.viewport);
                }
                return null;
            }
            this._defaultStyle = value;
            if (this.sheet) {
                this.sheet.setStyle(-1, this.index, value, GC.Spread.Sheets.SheetArea.viewport);
            }
            return this;
        },
        dataValidation: function(value) {
            if (arguments.length === 0) {
                if (this.sheet) {
                    return this.sheet.getDataValidator(-1, this.index, GC.Spread.Sheets.SheetArea.viewport);
                }
                return null;
            }
            var validator = value.validator;
            this._validator = validator;
            if (this.sheet) {
                this.sheet.setDataValidator(-1, this.index, validator, GC.Spread.Sheets.SheetArea.viewport);
            }
            return this;
        },
        attach: function (sheet, column, index) {
            this.sheet = sheet;
            this.column = column;
            this.index = index;
            this.updata();
        },
        updata: function () {
            this.sheet.suspendEvent();
            if (this._width !== undefined) {
                this.column.width(this._width);
            }
            if (this._visible !== undefined) {
                this.column.visible(this._visible);
            }
            if (this._resizable !== undefined) {
                this.column.resizable(this._resizable);
            }
            if (this._defaultStyle) {
                this.sheet.setStyle(-1, this.index, this._defaultStyle, GC.Spread.Sheets.SheetArea.viewport);
            }
            if (this._validator) {
                this.sheet.setDataValidator(-1, this.index, this._validator, GC.Spread.Sheets.SheetArea.viewport);
            }
            if (this.autoFit) {
                this.sheet.autoFitColumn(this.index);
            }
            this.sheet.resumeEvent();
        }
    }
    GC.Spread.Sheets.ColumnWrapper = ColumnWrapper;

    // Simple wraaper for save DataValidator
    GC.Spread.Sheets.DataValidatorWrapper = function() {
        this.validator = null;
    };

    function lineBorderConverter(stringValue) {
        if (!stringValue) {
            return undefined;
        }
        stringValue = stringValue.trim();
        var parts;
        if (stringValue.indexOf(',') >= 0) {
            parts = stringValue.split(',');
        } else {
            parts = stringValue.split(' ');
        }
        var lineBorder = new GC.Spread.Sheets.LineBorder();
        lineBorder.color = parts[0].trim();
        if (parts.length > 1) {
            lineBorder.style = GC.Spread.Sheets.LineStyle[parts[1].trim()];
        }
        return lineBorder;
    }

    function setValidator(wrapper, validatorType, value) {
        if (!wrapper || !validatorType) {
            return;
        }

        validatorType = validatorType.toLowerCase();
        var validator;
        if (validatorType === 'numbervalidator') {
            validator = GC.Spread.Sheets.DataValidation.createNumberValidator(value.comparisonOperator, value.value1, value.value2, value.isIntegervalue);
        } else if (validatorType === 'datevalidator') {
            validator = GC.Spread.Sheets.DataValidation.createDateValidator(value.comparisonOperator, value.value1, value.value2);
        } else if (validatorType === 'textlengthvalidator') {
            validator = GC.Spread.Sheets.DataValidation.createTextLengthValidator(value.comparisonOperator, value.value1, value.value2);
        } else if (validatorType === 'formulavalidator') {
            validator = GC.Spread.Sheets.DataValidation.createFormulaValidator(value.formula);
        } else if (validatorType === 'formulalistvalidator') {
            validator = GC.Spread.Sheets.DataValidation.createFormulaListValidator(value.formulaList);
        } else if (validatorType === 'listvalidator') {
            validator = GC.Spread.Sheets.DataValidation.createListValidator(value.list);
        }
        if (validator) {
            if (value.ignoreBlank !== undefined) {
                validator.ignoreBlank(value.ignoreBlank);
            }
            if (value.inCellDropdown !== undefined) {
                validator.inCellDropdown(value.inCellDropdown);
            }
            if (value.showInputMessage !== undefined) {
                validator.showInputMessage(value.showInputMessage);
            }
            if (value.showErrorMessage !== undefined) {
                validator.showErrorMessage(value.showErrorMessage);
            }
            if (value.errorStyle !== undefined) {
                validator.errorStyle(value.errorStyle);
            }
            if (value.inputMessage !== undefined) {
                validator.inputMessage(value.inputMessage);
            }
            if (value.inputTitle !== undefined) {
                validator.inputTitle(value.inputTitle);
            }
            if (value.errorMessage !== undefined) {
                validator.errorMessage(value.errorMessage);
            }
            if (value.errorTitle !== undefined) {
                validator.errorTitle(value.errorTitle);
            }
            wrapper.validator = validator;
        }
    }

    function setDataValidationResult(spread, name, value) {
        spread._angularDataValidationResult = value;
    }

    function setComboboxItems(comboBoxCellType, itemType, value) {
        if (value.text === undefined && value.value === undefined) {
            return;
        }
        if (value.text === undefined) {
            value.text = value.value;
        } else if (value.value === undefined) {
            value.value = value.text;
        }
        var items;
        if (!comboBoxCellType.items()) {
            items = [];
            comboBoxCellType.items(items);
        } else {
            items = comboBoxCellType.items();
        }
        items.push(value);
    }

    function setSheetOutline(sheet, outlineType, value) {
        if (outlineType && value.outlines) {
            outlineType = outlineType.toLowerCase().trim();
            angular.forEach(value.outlines, function (outlineInfo) {
                if (outlineType === 'rowoutlines') {
                    sheet.rowOutlines.group(outlineInfo.index, outlineInfo.count);
                } else {
                    sheet.columnOutlines.group(outlineInfo.index, outlineInfo.count);
                }
            });
        }
    }

    function addOutLine(outlineGroup, outLineType, value) {
        if (!outlineGroup.outlines) {
            outlineGroup.outlines = [];
        }
        outlineGroup.outlines.push(value);
    }

    function getCurrentTheme(sheet, property) {
        return sheet[property]().name();
    }

    function setColumns(sheet, name, value) {
        sheet._columnDefs = value;
    }

    function setSheets(spread, name, value) {
        spread._sheetDefs = value;
        value.spread = spread;
    }

    function addColumn(columns, name, value) {
        columns.push(value);
    }

    function addSheet(sheets, name, value) {
        sheets.push(value);
        sheets.spread.addSheet(sheets.length - 1, value);
    }

    function setDataSource(sheet, name, value) {
        sheet._angularDataSource = value;
    }

    function setBorder(border, name, value) {
        if (!border.borderLeft) {
            border.borderLeft = value;
        }
        if (!border.borderTop) {
            border.borderTop = value;
        }
        if (!border.borderRight) {
            border.borderRight = value;
        }
        if (!border.borderBottom) {
            border.borderBottom = value;
        }
    }

    function getOptionValue(sheet, option) {
        return sheet.options[option];
    }

    function setOptionValue(sheet, option, value) {
        sheet.options[option] = value;
    }

    var styleDef = {
        'backcolor': {'type': 'string', 'name': 'backColor'},
        'forecolor': {'type': 'string', 'name': 'foreColor'},
        'halign': {'type': 'enum, HorizontalAlign', 'name': 'hAlign'},
        'valign': {'type': 'enum, VerticalAlign', 'name': 'vAlign'},
        'font': {'type': 'string', 'name': 'font'},
        'themefont': {'type': 'string', 'name': 'themeFont'},
        'formatter': {'type': 'string', 'name': 'formatter'},
        'border': {
            'type': 'LineBordeer',
            'name': 'border',
            'getProperties': ['borderLeft', 'borderTop', 'borderRight', 'borderBottom'],
            'setFunction': setBorder,
            'converter': lineBorderConverter
        },
        'borderleft': {'type': 'LineBorder', 'name': 'borderLeft', 'converter': lineBorderConverter},
        'bordertop': {'type': 'LineBorder', 'name': 'borderTop', 'converter': lineBorderConverter},
        'borderright': {'type': 'LineBorder', 'name': 'borderRight', 'converter': lineBorderConverter},
        'borderbottom': {'type': 'LineBorder', 'name': 'borderBottom', 'converter': lineBorderConverter},
        'locked': {'type': 'boolean', 'name': 'locked'},
        'wordwrap': {'type': 'boolean', 'name': 'wordWrap'},
        'textindent': {'type': 'number', 'name': 'textIndent'},
        'shrinktofit': {'type': 'boolean', 'name': 'shrinkToFit'},
        'backgroundimage': {'type': 'string', 'name': 'backgroundImage'},
        'backgroundimagelayout': {'type': 'enum, ImageLayout', 'name': 'backgroundImageLayout'},
        'textcelltype': {
            'type': 'GC.Spread.Sheets.CellTypes.Text', 'name': 'cellType', 'properties': {}
        },
        'buttoncelltype': {
            'type': 'GC.Spread.Sheets.CellTypes.Button', 'name': 'cellType', 'properties': {
                'buttonbackcolor': {'type': 'string', 'name': 'buttonBackColor', 'setFunction': 'buttonBackColor'},
                'marginleft': {'type': 'number', 'name': 'marginLeft', 'setFunction': 'marginLeft'},
                'margintop': {'type': 'number', 'name': 'marginTop', 'setFunction': 'marginTop'},
                'marginright': {'type': 'number', 'name': 'marginRight', 'setFunction': 'marginRight'},
                'marginbottom': {'type': 'number', 'name': 'marginBottom', 'setFunction': 'marginBottom'},
                'text': {'type': 'string', 'name': 'text', 'setFunction': 'text'}
            }
        },
        'checkboxcelltype': {
            'type': 'GC.Spread.Sheets.CellTypes.CheckBox', 'name': 'cellType', 'properties': {
                'caption': {'type': 'string', 'name': 'caption', 'setFunction': 'caption'},
                'isthreestate': {'type': 'boolean', 'name': 'isThreeState', 'setFunction': 'isThreeState'},
                'textalign': {
                    'type': 'enum,GC.Spread.Sheets.CellTypes.CheckBoxTextAlign',
                    'name': 'textAlign',
                    'setFunction': 'textAlign'
                },
                'textfalse': {'type': 'string', 'name': 'textFalse', 'setFunction': 'textFalse'},
                'textindeterminate': {
                    'type': 'string',
                    'name': 'textIndeterminate',
                    'setFunction': 'textIndeterminate'
                },
                'texttrue': {'type': 'string', 'name': 'textTrue', 'setFunction': 'textTrue'}
            }
        },
        'comboboxcelltype': {
            'type': 'GC.Spread.Sheets.CellTypes.ComboBox', 'name': 'cellType', 'properties': {
                'editorvaluetype': {
                    'type': 'enum,GC.Spread.Sheets.CellTypes.EditorValueType',
                    'name': 'editorValueType',
                    'setFunction': 'editorValueType'
                },
                //'items': { 'type': '[string]', 'name': 'items', 'setFunction': 'items' },
                'item': {
                    'type': 'object', 'name': 'items', 'setFunction': setComboboxItems, 'properties': {
                        'value': {'type': 'string', 'name': 'value'},
                        'text': {'type': 'string', 'name': 'text'}
                    }
                }
            }
        },
        'hyperlinkcelltype': {
            'type': 'GC.Spread.Sheets.CellTypes.HyperLink', 'name': 'cellType', 'properties': {
                'linkcolor': {'type': 'string', 'name': 'linkColor', 'setFunction': 'linkColor'},
                'linktooltip': {'type': 'string', 'name': 'linkToolTip', 'setFunction': 'linkToolTip'},
                'text': {'type': 'string', 'name': 'text', 'setFunction': 'text'},
                'visitedlinkcolor': {'type': 'string', 'name': 'visitedLinkColor', 'setFunction': 'visitedLinkColor'}
            }
        }
    }

    var validationsDef = {
        'numbervalidator': {
            'type': 'object', 'name': 'numberValidator', 'setFunction': setValidator, 'properties': {
                'comparisonoperator': {
                    'type': 'enum,GC.Spread.Sheets.ConditionalFormatting.ComparisonOperators',
                    'name': 'comparisonOperator'
                },
                'value1': { 'type': 'string', 'name': 'value1' },
                'value2': { 'type': 'string', 'name': 'value2' },
                'isintegervalue': { 'type': 'boolean', 'name': 'isIntegerValue' }
            }
        },
        'datevalidator': {
            'type': 'object', 'name': 'dateValidator', 'setFunction': setValidator, 'properties': {
                'comparisonoperator': {
                    'type': 'enum,GC.Spread.Sheets.ConditionalFormatting.ComparisonOperators',
                    'name': 'comparisonOperator'
                },
                'value1': { 'type': 'string', 'name': 'value1' },
                'value2': { 'type': 'string', 'name': 'value2' }
            }
        },
        'textlengthvalidator': {
            'type': 'object', 'name': 'textLengthValidator', 'setFunction': setValidator, 'properties': {
                'comparisonoperator': {
                    'type': 'enum,GC.Spread.Sheets.ConditionalFormatting.ComparisonOperators',
                    'name': 'comparisonOperator'
                },
                'value1': { 'type': 'string', 'name': 'value1' },
                'value2': { 'type': 'string', 'name': 'value2' }
            }
        },
        'formulavalidator': {
            'type': 'object', 'name': 'formulaValidator', 'setFunction': setValidator, 'properties': {
                'formula': { 'type': 'string', 'name': 'formula' }
            }
        },
        'formulalistvalidator': {
            'type': 'object', 'name': 'formulaListValidator', 'setFunction': setValidator, 'properties': {
                'formulalist': { 'type': 'string', 'name': 'formulaList' }
            }
        },
        'listvalidator': {
            'type': 'object', 'name': 'listValidator', 'setFunction': setValidator, 'properties': {
                'list': { 'type': 'string', 'name': 'list' }
            }
        }
    };
    var validators = ['numbervalidator', 'datevalidator', 'textlengthvalidator', 'formulavalidator', 'formulalistvalidator', 'listvalidator'];
    for (var i = 0; i < validators.length; i++) {
        var validatorProperties = validationsDef[validators[i]]['properties'];
        validatorProperties['ignoreblank'] = {'type': 'boolean', 'name': 'ignoreBlank'};
        validatorProperties['incelldropdown'] = {'type': 'boolean', 'name': 'inCellDropdown'};
        validatorProperties['showinputmessage'] = {'type': 'boolean', 'name': 'showInputMessage'};
        validatorProperties['showerrormessage'] = {'type': 'boolean', 'name': 'showErrorMessage'};
        validatorProperties['errorstyle'] = {
            'type': 'enum, GC.Spread.Sheets.DataValidation.ErrorStyle',
            'name': 'errorStyle'
        };
        validatorProperties['inputmessage'] = {'type': 'string', 'name': 'inputMessage'};
        validatorProperties['inputtitle'] = {'type': 'string', 'name': 'inputTitle'};
        validatorProperties['errormessage'] = {'type': 'string', 'name': 'errorMessage'};
        validatorProperties['errortitle'] = {'type': 'string', 'name': 'errorTitle'};
    }

    var outlineDef = {
        'outline': {
            'type': 'object', 'name': 'outline', 'setFunction': addOutLine, 'properties': {
                'index': {'type': 'number', 'name': 'index'},
                'count': {'type': 'number', 'name': 'count'}
            }
        }
    }


    var columnPropertyMap = {
        'datafield': {'type': 'string', 'name': 'dataField'},
        'headertext': {'type': 'string', 'name': 'headerText'},
        'width': {'type': 'number', 'name': 'width', 'setFunction': 'width', 'getFunction': 'width'},
        'visible': {'type': 'boolean', 'name': 'visible', 'setFunction': 'visible', 'getFunction': 'visible'},
        'resizable': {'type': 'boolean', 'name': 'resizable', 'setFunction': 'resizable', 'getFunction': 'resizable'},
        'defaultstyle': {
            'type': 'Style',
            'name': 'defaultStyle',
            'setFunction': 'defaultStyle',
            'getFunction': 'defaultStyle',
            'properties': styleDef
        },
        'datavalidation': {
            'type': 'DataValidatorWrapper',
            'name': 'dataValidation',
            'setFunction': 'dataValidation',
            'getFunction': 'dataValidation',
            'properties': validationsDef
        },
        'autofit': {'type': 'boolean', 'name': 'autoFit'}
    }

    var columnsDef = {
        'column': {
            'type': 'ColumnWrapper', 'name': 'column', 'setFunction': addColumn, 'properties': columnPropertyMap
        }
    }


    var sheetPropertyMap = {
        'name': {'type': 'string', 'name': 'name', 'setFunction': 'name', 'getFunction': 'name'},
        'frozentrailingcolumncount': {
            'type': 'number',
            'name': 'frozenTrailingColumnCount',
            'setFunction': 'frozenTrailingColumnCount',
            'getFunction': 'frozenTrailingColumnCount'
        },
        'frozentrailingrowcount': {
            'type': 'number',
            'name': 'frozenTrailingRowCount',
            'setFunction': 'frozenTrailingRowCount',
            'getFunction': 'frozenTrailingRowCount'
        },
        'frozencolumncount': {
            'type': 'number',
            'name': 'frozenColumnCount',
            'setFunction': 'frozenColumnCount',
            'getFunction': 'frozenColumnCount'
        },
        'frozenrowcount': {
            'type': 'number',
            'name': 'frozenRowCount',
            'setFunction': 'frozenRowCount',
            'getFunction': 'frozenRowCount'
        },
        'defaultstyle': {
            'type': 'Style',
            'name': 'defaultStyle',
            'setFunction': {
                'name': 'setDefaultStyle',
                'args': ['$value-replace$', GC.Spread.Sheets.SheetArea.viewport]
            },
            'properties': styleDef
        },
        'rowheaderdefaultstyle': {
            'type': 'Style',
            'name': 'rowHeaderDefaultStyle',
            'setFunction': {
                'name': 'setDefaultStyle',
                'args': ['$value-replace$', GC.Spread.Sheets.SheetArea.rowHeader]
            },
            'properties': styleDef
        },
        'columnheaderdefaultstyle': {
            'type': 'Style',
            'name': 'columnHeaderDefaultStyle',
            'setFunction': {
                'name': 'setDefaultStyle',
                'args': ['$value-replace$', GC.Spread.Sheets.SheetArea.colHeader]
            },
            'properties': styleDef
        },
        'allowcelloverflow': {
            'type': 'boolean',
            'name': 'allowCellOverflow',
            'setFunction': setOptionValue,
            'getFunction': getOptionValue
        },
        'frozenlinecolor': {
            'type': 'string',
            'name': 'frozenlineColor',
            'setFunction': setOptionValue,
            'getFunction': getOptionValue
        },
        'sheettabcolor': {
            'type': 'string',
            'name': 'sheetTabColor',
            'setFunction': setOptionValue,
            'getFunction': getOptionValue
        },
        'rowcount': {'type': 'number', 'name': 'rowCount', 'setFunction': 'setRowCount', 'getFunction': 'getRowCount'},
        'selectionpolicy': {
            'type': 'enum, SelectionPolicy',
            'name': 'selectionPolicy',
            'setFunction': 'selectionPolicy',
            'getFunction': 'selectionPolicy'
        },
        'selectionunit': {
            'type': 'enum,SelectionUnit',
            'name': 'selectionUnit',
            'setFunction': 'selectionUnit',
            'getFunction': 'selectionUnit'
        },
        'zoom': {'type': 'number', 'name': 'zoom', 'setFunction': 'zoom', 'getFunction': 'zoom'},
        'currenttheme': {
            'type': 'string',
            'name': 'currentTheme',
            'setFunction': 'currentTheme',
            'getFunction': getCurrentTheme
        },
        'clipboardoptions': {
            'type': 'enum,ClipboardPasteOptions',
            'name': 'clipBoardOptions',
            'setFunction': setOptionValue,
            'getFunction': getOptionValue
        },
        'rowheadervisible': {
            'type': 'boolean',
            'name': 'rowHeaderVisible',
            'setFunction': setOptionValue,
            'getFunction': getOptionValue
        },
        'colheadervisible': {
            'type': 'boolean',
            'name': 'colHeaderVisible',
            'setFunction': setOptionValue,
            'getFunction': getOptionValue
        },
        'rowheaderautotext': {
            'type': 'enum, HeaderAutoText',
            'name': 'rowHeaderAutoText',
            'setFunction': setOptionValue,
            'getFunction': getOptionValue
        },
        'colheaderautotext': {
            'type': 'enum, HeaderAutoText',
            'name': 'colHeaderAutoText',
            'setFunction': setOptionValue,
            'getFunction': getOptionValue
        },
        'rowheaderautotextindex': {
            'type': 'number',
            'name': 'rowHeaderAutoTextIndex',
            'setFunction': setOptionValue,
            'getFunction': getOptionValue
        },
        'colheaderautotextindex': {
            'type': 'number',
            'name': 'colHeaderAutoTextIndex',
            'setFunction': setOptionValue,
            'getFunction': getOptionValue
        },
        'isprotected': {
            'type': 'boolean',
            'name': 'isProtected',
            'setFunction': setOptionValue,
            'getFunction': getOptionValue
        },
        'showrowoutline': {
            'type': 'boolean',
            'name': 'showRowOutline',
            'setFunction': 'showRowOutline',
            'getFunction': 'showRowOutline'
        },
        'showcolumnoutline': {
            'type': 'boolean',
            'name': 'showColumnOutline',
            'setFunction': 'showColumnOutline',
            'getFunction': 'showColumnOutline'
        },
        'rowoutlines': {
            'type': 'object',
            'name': 'rowOutlines',
            'setFunction': setSheetOutline,
            'properties': outlineDef
        },
        'columnoutlines': {
            'type': 'object',
            'name': 'columnOutlines',
            'setFunction': setSheetOutline,
            'properties': outlineDef
        },
        'selectionbackcolor': {
            'type': 'string',
            'name': 'selectionBackColor',
            'setFunction': setOptionValue,
            'getFunction': getOptionValue
        },
        'selectionbordercolor': {
            'type': 'string',
            'name': 'selectionBorderColor',
            'setFunction': setOptionValue,
            'getFunction': getOptionValue
        },
        'columns': {'type': '[]', 'name': 'columns', 'setFunction': setColumns, 'properties': columnsDef},
        'datasource': {'type': '[]', 'name': 'dataSource', 'setFunction': setDataSource},
        'datasourcedeepwatch': {'type': 'boolean', 'name': 'dataSourceDeepWatch'}
    }

    var worksheetsDef = {
        'worksheet': {
            'type': 'Worksheet', 'name': 'worksheet', 'setFunction': addSheet, 'properties': sheetPropertyMap
        }
    }

    var workbookPropertyMap = {
        'name': {'type': 'string', 'name': 'name'},
        'allowuserzoom': {
            'type': 'boolean',
            'name': 'allowUserZoom',
            'setFunction': setOptionValue,
            'getFunction': getOptionValue
        },
        'allowuserresize': {
            'type': 'boolean',
            'name': 'allowUserResize',
            'setFunction': setOptionValue,
            'getFunction': getOptionValue
        },
        'tabstripvisible': {
            'type': 'boolean',
            'name': 'tabStripVisible',
            'setFunction': setOptionValue,
            'getFunction': getOptionValue
        },
        'tabeditable': {
            'type': 'boolean',
            'name': 'tabEditable',
            'setFunction': setOptionValue,
            'getFunction': getOptionValue
        },
        'newtabvisible': {
            'type': 'boolean',
            'name': 'newTabVisible',
            'setFunction': setOptionValue,
            'getFunction': getOptionValue
        },
        'allowusereditformula': {
            'type': 'boolean',
            'name': 'allowUserEditFormula',
            'setFunction': setOptionValue,
            'getFunction': getOptionValue
        },
        'autofittype': {
            'type': 'enum, AutoFitType',
            'name': 'autoFitType',
            'setFunction': setOptionValue,
            'getFunction': getOptionValue
        },
        'allowuserdragfill': {
            'type': 'boolean',
            'name': 'allowUserDragFill',
            'setFunction': setOptionValue,
            'getFunction': getOptionValue
        },
        'allowuserdragdrop': {
            'type': 'boolean',
            'name': 'allowUserDragDrop',
            'setFunction': setOptionValue,
            'getFunction': getOptionValue
        },
        'highlightinvaliddata': {
            'type': 'boolean',
            'name': 'highlightInvalidData',
            'setFunction': setOptionValue,
            'getFunction': getOptionValue
        },
        'referencestyle': {
            'type': 'enum, ReferenceStyle',
            'name': 'referenceStyle',
            'setFunction': setOptionValue,
            'getFunction': getOptionValue
        },
        'backcolor': {
            'type': 'string',
            'name': 'backColor',
            'setFunction': setOptionValue,
            'getFunction': getOptionValue
        },
        'grayareabackcolor': {
            'type': 'string',
            'name': 'grayAreaBackColor',
            'setFunction': setOptionValue,
            'getFunction': getOptionValue
        },
        'backgroundimage': {
            'type': 'string',
            'name': 'backgroundImage',
            'setFunction': setOptionValue,
            'getFunction': getOptionValue
        },
        'backgroundimagelayout': {
            'type': 'enum, ImageLayout',
            'name': 'backgroundImageLayout',
            'setFunction': setOptionValue,
            'getFunction': getOptionValue
        },
        'showverticalscrollbar': {
            'type': 'boolean',
            'name': 'showVerticalScrollbar',
            'setFunction': setOptionValue,
            'getFunction': getOptionValue
        },
        'showhorizontalscrollbar': {
            'type': 'boolean',
            'name': 'showHorizontalScrollbar',
            'setFunction': setOptionValue,
            'getFunction': getOptionValue
        },
        'showscrolltip': {
            'type': 'enum, ShowScrollTip',
            'name': 'showScrollTip',
            'setFunction': setOptionValue,
            'getFunction': getOptionValue
        },
        'showresizetip': {
            'type': 'enum, ShowResizeTip',
            'name': 'showResizeTip',
            'setFunction': setOptionValue,
            'getFunction': getOptionValue
        },
        'showdragdroptip': {
            'type': 'boolean',
            'name': 'showDragDropTip',
            'setFunction': setOptionValue,
            'getFunction': getOptionValue
        },
        'showdragfilltip': {
            'type': 'boolean',
            'name': 'showDragFillTip',
            'setFunction': setOptionValue,
            'getFunction': getOptionValue
        },
        'datavalidationresult': {
            'type': 'enum, GC.Spread.Sheets.DataValidation.DataValidationResult',
            'name': 'DataValidationResult',
            'setFunction': setDataValidationResult
        },
        'worksheets': {'type': '[]', 'name': 'worksheets', 'setFunction': setSheets, 'properties': worksheetsDef}
    }

    var Node;
    (function (Node) {
        Node._map = [];
        Node.ELEMENT_NODE = 1;
        Node.ATTRIBUTE_NODE = 2;
        Node.TEXT_NODE = 3;
        Node.CDATA_SECTION_NODE = 4;
        Node.ENTITY_REFERENCE_NODE = 5;
        Node.ENTITY_NODE = 6;
        Node.PROCESSING_INSTRUCTION_NODE = 7;
        Node.COMMENT_NODE = 8;
        Node.DOCUMENT_NODE = 9;
        Node.DOCUMENT_TYPE_NODE = 10;
        Node.DOCUMENT_FRAGMENT_NODE = 11;
        Node.NOTATION_NODE = 12;
    })(Node || (Node = {}));

    var SpreadAngularManager = function () {
    };
    SpreadAngularManager.prototype.setValues = function () {
        var self = this;
        if (this.valueCatch) {
            angular.forEach(this.valueCatch, function (catchObject) {
                var target = catchObject.target;
                angular.forEach(catchObject.setting, function (propertySet) {
                    var nodeDef = propertySet.nodeDef;
                    var value = propertySet.value;
                    self.setPropertyValue(target, nodeDef, value);
                })
            })
        }
    };
    SpreadAngularManager.prototype.setBindings = function (scope) {
        var parentScope = scope.$parent;
        var self = this;
        if (this.bindings) {
            angular.forEach(this.bindings, function (attBinding) {
                if (attBinding.dynamicText) {
                    var bindingPath = attBinding.dynamicText.substring(2, attBinding.dynamicText.length - 2);
                    if (!attBinding.target._angularBindingPath) {
                        attBinding.target._angularBindingPath = {};
                    }
                    attBinding.target._angularBindingPath[attBinding.name] = bindingPath;
                    var bindingPathLowerCase = bindingPath;
                    if (parentScope[bindingPathLowerCase] === undefined) {
                        parentScope[bindingPathLowerCase] = self.getPropertyValue(attBinding.target, attBinding.metadata);
                    } else {
                        self.setPropertyValue(attBinding.target, attBinding.metadata, parentScope[bindingPathLowerCase]);
                    }
                    parentScope.$watch(bindingPath, function (value) {
                        self.setPropertyValue(attBinding.target, attBinding.metadata, value);
                    })
                }
            })
        }
    };
    SpreadAngularManager.prototype.initSpread = function (scope, element) {
        var node = element[0];
        this._readNodeWithChildren(scope, node, workbookPropertyMap, 'worksheets', false);
    };
    SpreadAngularManager.prototype._readNodeWithChildren = function (target, node, map, excludeChildren, setValueDirectly) {
        var self = this;
        if (!setValueDirectly) {
            if (!this.valueCatch) {
                this.valueCatch = [];
            }
            var catchObject;
            angular.forEach(this.valueCatch, function (catchTmp) {
                if (catchTmp.target === target) {
                    catchObject = catchTmp;
                }
            });
            if (!catchObject) {
                catchObject = {
                    target: target, setting: []
                };
                this.valueCatch.push(catchObject);
            }
        }
        angular.forEach(node.attributes, function (attNode) {
            self._readNode(target, attNode, map, catchObject, setValueDirectly)
        });
        if (node.childNodes.length > 0) {
            angular.forEach(node.childNodes, function (childNode) {
                var nodeName = childNode.nodeName.toLowerCase();
                nodeName = self.normalizeName(nodeName);
                var nodeDef = map[nodeName];
                if (!nodeDef || !nodeDef.type) {
                    return
                }
                var childTarget;
                if (nodeDef.type === 'object') {
                    childTarget = {}
                } else if (nodeDef.type === '[]') {
                    childTarget = []
                } else {
                    var type = nodeDef.type;
                    if (type.indexOf('.') > 0) {
                        var namespaces = type.split('.');
                        var parent = window[namespaces[0]];
                        for (var i = 1; i < namespaces.length; i++) {
                            type = parent[namespaces[i]];
                            if (!type) {
                                break;
                            }
                            parent = type;
                        }
                    } else {
                        type = GC.Spread.Sheets[nodeDef.type];
                    }
                    if (!type) {
                        return
                    }
                    childTarget = new type;
                }
                if (nodeDef.name === 'worksheets' || nodeDef.name === 'worksheet' || nodeDef.name === 'columns' || nodeDef.name === 'column') {
                    self._readNodeWithChildren(childTarget, childNode, nodeDef.properties, undefined, false);
                } else {
                    self._readNodeWithChildren(childTarget, childNode, nodeDef.properties, undefined, true);
                }
                if (setValueDirectly) {
                    self.setPropertyValue(target, nodeDef, childTarget);
                } else {
                    catchObject.setting.push({
                        nodeDef: nodeDef, value: childTarget
                    })
                }
            })
        }
    };
    SpreadAngularManager.prototype.convertValue = function (value, targetType, converter) {
        if (converter) {
            return converter(value)
        }
        if (value === undefined || targetType === undefined) {
            return value
        }
        if (typeof value === 'string') {
            value = value.trim();
        }
        if (targetType.length > 2 && targetType[0] === '[') {
            var argType = targetType.substring(1, targetType.length - 2);
            if (value.length > 2) {
                if (value[0] === '[' && value[value.length - 1] === ']') {
                    value = value.substring(1, value.length - 2);
                }
                var partsValue = value.split(',');
                var result = [];
                for (var i = 0; i < partsValue.length; i++) {
                    result.push(this.convertValue(partsValue[i], argType, converter));
                }
                return result;
            }
        }
        switch (targetType) {
            case 'string':
                return value;
            case 'boolean':
                if (typeof value === 'boolean') {
                    return value;
                }
                if (value.toLowerCase() === 'true') {
                    return true;
                } else if (value.toLowerCase() === 'false') {
                    return false;
                }
                return Boolean(value);
            case 'number':
                return Number(value);
            case 'color':
                return value;
            case '[]':
                return value;
        }
        if (targetType.length > 5 && targetType.substring(0, 5) === 'enum,') {
            if (typeof value === 'number' || typeof value === 'string' && parseInt(value) !== undefined && !isNaN(parseInt(value))) {
                result = parseInt(value);
            } else {
                targetType = targetType.substring(5).trim();
                var resultType = GC.Spread.Sheets;
                if (targetType.indexOf('.') > 0) {
                    resultType = window;
                    var parts = targetType.split('.');
                    for (i = 0; i < parts.length; i++) {
                        resultType = resultType[parts[i]];
                    }
                } else {
                    resultType = resultType[targetType];
                }
                result = resultType[value];
                if (result === undefined) {
                    value = value[0].toUpperCase() + value.substring(1);
                    result = resultType[value];
                }
            }
            return result;
        }
        return value;
    };
    SpreadAngularManager.prototype.normalizeName = function (name) {
        if (name.match(/-/)) {
            var parts = name.split('-');
            name = parts.shift();
            angular.forEach(parts, function (p) {
                name += p;
            })
        }
        return name;
    };
    SpreadAngularManager.prototype._readNode = function (target, node, map, catchObject, setValueDirectly) {
        var $node = $(node),
            value,
            name,
            path;
        switch (node.nodeType) {
            case Node.ATTRIBUTE_NODE:
                value = $node.val();
                break;
            case Node.ELEMENT_NODE:
                value = $node.text();
                break;
            default:
                return;
        }
        name = node.nodeName || node.name;
        name = name.toLowerCase();
        name = this.normalizeName(name);
        var metadata = map[name];
        if (metadata) {
            name = metadata.name;
        } else {
            return
        }
        if (!this.hasChildElements(node) && value && value.length > 4 && value.substring(0, 2) === '{{' && value.substring(value.length - 2) === '}}') {
            if (!this.bindings) {
                this.bindings = [];
            }
            this.bindings.push({
                target: target, metadata: metadata, path: name, name: name, dynamicText: value
            });
            return
        }
        if (value.match(/^[^\d]/) && node.nodeType === Node.ATTRIBUTE_NODE && (metadata.changeEvent || metadata.twoWayBinding)) {
            if (!this.bindings) {
                this.bindings = [];
            }
            this.bindings.push({
                target: target, path: (path && path + '.') + name, name: name, expression: value
            })
        } else if (node.nodeType === Node.ATTRIBUTE_NODE) {
            if (setValueDirectly) {
                this.setPropertyValue(target, metadata, value);
            } else {
                catchObject.setting.push({
                    nodeDef: metadata, value: value
                });
            }
        }
    };
    SpreadAngularManager.prototype.setPropertyValue = function (target, metadata, value) {
        if (value === undefined) {
            return
        }
        if (target.$scopeObject) {
            target = target.$scopeObject;
        }
        try {
            value = this.convertValue(value, metadata.type, metadata.converter);
            if (metadata.setFunction) {
                if (typeof metadata.setFunction === 'function') {
                    metadata.setFunction.call(this, target, metadata.name, value);
                } else {
                    this.setPropertyValueCore(target, value, undefined, metadata.setFunction);
                }
            } else {
                this.setPropertyValueCore(target, value, metadata.name);
                target[metadata.name] = value;
            }
        } catch (ex) { //
        }
    };
    SpreadAngularManager.prototype.setPropertyValueCore = function (target, value, propertyName, setFunction) {
        if (propertyName) {
            target[propertyName] = value;
        } else if (setFunction) {
            if (typeof setFunction === 'string') {
                target[setFunction](value);
            } else {
                var functionName = setFunction.name;
                var args = [];
                for (var i = 0; i < setFunction.args.length; i++) {
                    if (setFunction.args[i] === '$value-replace$') {
                        args[i] = value;
                    } else {
                        args[i] = setFunction.args[i];
                    }
                }
                switch (args.length) {
                    case 1:
                        target[functionName](args[0]);
                        break;
                    case 2:
                        target[functionName](args[0], args[1]);
                        break;
                    case 3:
                        target[functionName](args[0], args[1], args[2]);
                        break;
                    case 4:
                        target[functionName](args[0], args[1], args[2], args[3]);
                        break;
                    case 5:
                        target[functionName](args[0], args[1], args[2], args[3], args[4]);
                        break
                }
            }
        }
    };
    SpreadAngularManager.prototype.getPropertyValue = function (target, metadata) {
        if (target.$scopeObject) {
            target = target.$scopeObject;
        }
        var value = '';
        try {
            if (metadata.getProperties) {
                angular.forEach(metadata.getProperties, function (setProperty) {
                    if (value === '') {
                        value = this.setPropertyValueCore(target, value, setProperty);
                    } else {
                        value = value + ',' + this.setPropertyValueCore(target, value, setProperty);
                    }
                })
            } else if (metadata.getFunction) {
                if (typeof metadata.getFunction === 'function') {
                    return metadata.getFunction.call(this, target, metadata.name);
                }
                value = this.getPropertyValueCore(target, undefined, metadata.getFunction);

            } else {
                value = this.getPropertyValueCore(target, name);
            }
        } catch (ex) { //
        }
        return value
    };
    SpreadAngularManager.prototype.getPropertyValueCore = function (target, propertyName, getFunction) {
        if (propertyName) {
            return target[propertyName]
        } else if (getFunction) {
            if (typeof getFunction === 'string') {
                return target[getFunction]();
            }
        }
        return ''
    };
    SpreadAngularManager.prototype.hasChildElements = function (node) {
        if (!node || !node.childNodes) {
            return false
        }
        var len = node.childNodes.length;
        for (var i = 0; i < len; i++) {
            var child = node.childNodes[i];
            if (child.nodeType === Node.ELEMENT_NODE) {
                return true
            }
        }
        return false
    }

    SpreadAngularManager.angularDerictive = function () {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            template: '<div ng-transclude/>',
            scope: {
                //showTabs: '@', // Whether to show the sheet selection tabs.
                //autoFitType: '@'
            },

            // add sheets to this spread
            controller: ['$scope', function () {
            }],


            link: function (scope, element, attrs) {
                var manager = new SpreadAngularManager();
                manager.initSpread(scope, element, attrs);
                // create spread component
                var spread = new GC.Spread.Sheets.Workbook(element[0], {sheetCount: 0});
                var ns = GC.Spread.Sheets;
                var parnetScope = scope.$parent;
                scope.$scopeObject = spread;

                spread.suspendCalcService(true);
                spread.suspendPaint();
                manager.setValues();
                var sheetDefs = spread._sheetDefs;
                var hasDataSourceBind = false;
                if (sheetDefs && sheetDefs.length > 0) {
                    for (var i = 0; i < sheetDefs.length; i++) {
                        var sheet = sheetDefs[i];
                        sheet.suspendEvent();
                        //sheet.isPaintSuspended(true);
                        //spread.addSheet(i, sheet);
                        initSheet(sheet);

                        if (sheet._angularDataSource) { // will resume in bindSheet
                            hasDataSourceBind = true;
                            var dataSourceDeepWatch = true;
                            if (sheet.dataSourceDeepWatch !== undefined) {
                                dataSourceDeepWatch = sheet.dataSourceDeepWatch;
                            }
                            var watchSheet = function (sheet1, dataSourceDeepWatch1) {
                                parnetScope.$watch(sheet1._angularDataSource, function (newValue, oldValue) {
                                    bindSheet(sheet1, oldValue, newValue)
                                }, dataSourceDeepWatch1);
                            }
                            watchSheet(sheet, dataSourceDeepWatch);
                        }
                        sheet.resumeEvent();
                    }

                }
                if (!hasDataSourceBind) {
                    spread.resumePaint();
                }
                spread.resumeCalcService(false);

                function initSheet(sheet) {
                    var hasColumns = sheet._columnDefs && sheet._columnDefs.length > 0;
                    if (hasColumns) {
                        sheet.setColumnCount(sheet._columnDefs.length);
                        for (var cIndex = 0; cIndex < sheet._columnDefs.length; cIndex++) {
                            sheet._columnDefs[cIndex].attach(sheet, sheet.getRange(-1, cIndex, -1, 1), cIndex);
                        }
                    }

                    sheet.bind(ns.Events.ValidationError, function (event, data) {
                        if (spread._angularDataValidationResult !== undefined) {
                            data.validationResult = spread._angularDataValidationResult;
                        } else {
                            data.validationResult = ns.DataValidation.DataValidationResult.discard; //restore original value
                        }
                    });

                    sheet.bind(ns.Events.ColumnWidthChanged, function (event, data) {
                        var sheet = data.sheet;
                        var colList = data.colList;
                        for (var col = 0; col < colList.length; col++) {
                            var columnWrapper = sheet._columnDefs[colList[col]];
                            var bindingPath = columnWrapper._angularBindingPath && columnWrapper._angularBindingPath['width'];
                            if (bindingPath) {
                                parnetScope[bindingPath] = sheet.getColumnWidth(colList[col]);
                            }
                        }
                        parnetScope.$apply();
                    });

                    sheet.bind(ns.Events.SheetNameChanged, function (event, data) {
                        var bindingPath = sheet._angularBindingPath && sheet._angularBindingPath['name'];
                        if (bindingPath) {
                            parnetScope[bindingPath] = data.newValue;
                            parnetScope.$apply();
                        }
                    })

                    sheet.bind(ns.Events.UserZooming, function (event, data) {
                        var bindingPath = sheet._angularBindingPath && sheet._angularBindingPath['zoom'];
                        if (bindingPath) {
                            parnetScope[bindingPath] = data.newZoomFactor;
                            parnetScope.$apply();
                        }
                    })

                    manager.setBindings(scope);
                }

                // bind the sheet
                function bindSheet(sheet, oldDataSource, newDataSource) {
                    var spread = sheet.getParent();
                    if (!spread.isPaintSuspended()) {
                        spread.suspendPaint();
                    }
                    if (newDataSource) {
                        //If datasource changed.
                        if (newDataSource !== sheet.getDataSource()) {
                            // bind grid
                            var hasColumns = sheet._columnDefs && sheet._columnDefs.length > 0;
                            if (hasColumns) {
                                sheet.autoGenerateColumns = false;
                                sheet.setDataSource(newDataSource, false);
                                sheet.setColumnCount(sheet._columnDefs.length);
                                for (var col = 0; col < sheet._columnDefs.length; col++) {
                                    bindColumn(sheet, col);
                                }
                            } else {
                                var colWidths = getColWidths(sheet);
                                sheet.autoGenerateColumns = true;
                                sheet.setDataSource(newDataSource, false);
                                var rowIndex, colHeaderAutoTextIndex = sheet.options.colHeaderAutoTextIndex;
                                if (colHeaderAutoTextIndex < 0) {
                                    rowIndex = sheet.getRowCount(ns.SheetArea.colHeader) - 1;
                                } else {
                                    rowIndex = colHeaderAutoTextIndex;
                                }
                                for (col = 0; col < sheet.getColumnCount(); col++) {
                                    var header = sheet.getValue(rowIndex, col, ns.SheetArea.colHeader);
                                    if (header.indexOf('$$') === 0) { // remove columns bound to work variables
                                        sheet.deleteColumns(col, 1);
                                        col--;
                                    }
                                }
                                setColWidths(sheet, colWidths);
                            }
                        } else if (newDataSource && oldDataSource && newDataSource.length !== oldDataSource.length) {
                            //If datasource is not changed, but datasource items changed.
                            sheet.setRowCountCore(newDataSource.length);
                        }
                    } else if (oldDataSource) {
                        sheet.setDataSource(null, true);
                    }

                    spread.resumePaint();
                }

                // add a bound column to the sheet
                function bindColumn(sheet, index) {

                    var columnWraper = sheet._columnDefs[index];
                    // bind column
                    if (columnWraper.dataField || columnWraper.headerText) {
                        sheet.bindColumn(index, {
                            name: columnWraper.dataField,
                            displayName: columnWraper.headerText
                        });
                    }

                    columnWraper.updata();
                }

                // save and restore column widths after re-binding
                function getColWidths(sheet) {
                    var arr = [];
                    for (var i = 0; i < sheet.getColumnCount(); i++) {
                        arr.push(sheet.getColumnWidth(i));
                    }
                    return arr;
                }

                function setColWidths(sheet, colWidths) {
                    if (sheet.getColumnCount() === colWidths.length) {
                        for (var i = 0; i < sheet.getColumnCount(); i++) {
                            sheet.setColumnWidth(i, parseInt(colWidths[i], 10));
                        }
                    }
                }
            }
        }
    }
    m.directive('gcSpreadSheets', function () {
        return SpreadAngularManager.angularDerictive();
    });
})();