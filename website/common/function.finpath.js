const pathFinpath = 'https://api.finpath.vn';
const pathFireant = 'https://restv2.fireant.vn';
const pathSimplize = 'https://api.simplize.vn';
const pathCafef = 'https://s.cafef.vn';
const SIZE_DEFAULT = 5;

// Create variable
const mpYearMonthData = new Map();
const mpYearData = new Map();
const dataFACurrent = {};

/**
 * Init
 *
 * @author TienPD3@icloud.com (https://paypal.me/tienpd3)
 * @date 2024/02/14
 * @param {*} stockCode
 * @param {*} stockName
 * @param {boolean} [isYear=false]
 * @param {*} [size=SIZE_DEFAULT]
 */
async function getFinancial(exchangeCd, stockCode, stockName, isYear = false, size = SIZE_DEFAULT) {

    mpYearMonthData.clear();
    mpYearData.clear();

    const isBank = stockName.startsWith('Ngân hàng');

    // Start all asynchronous operations at once
    const promises = [
        financialratiosFinpath(stockCode, true, size),
        financialratiosFinpath(stockCode, false, size),
        fullincomestatementsFinpath(stockCode, isBank, true, size),
        fullincomestatementsFinpath(stockCode, isBank, false, size),
        fullbalancesheetsFinpath(stockCode, true, size),
        fullbalancesheetsFinpath(stockCode, false, size),
        financialratiosSimplize(stockCode, true, size),
        financialratiosSimplize(stockCode, false, size),
        financialIndicatorsFireant(stockCode),
        fullbalancesheetsFireant(stockCode, true, size),
        fullbalancesheetsFireant(stockCode, false, size),
        fullincomestatementsFireant(stockCode, isBank, true, size),
        fullincomestatementsFireant(stockCode, isBank, false, size),
        profileFireant(stockCode),
        historicalQuotesFireant(stockCode),
        fundamentalFireant(stockCode),
        bussinessPlan(exchangeCd, stockCode, stockName)
    ];

    try {
        // Wait for all promises to resolve
        await Promise.all(promises);
        console.log('All promises resolved successfully');
    } catch (error) {
        console.error('An error occurred with one of the promises:', error);
    }
}

/**
 * Cafef - Lấy sàn giao dịch
 *
 * @author TienPD3@icloud.com (https://paypal.me/tienpd3)
 * @date 2024/02/14
 * @param {*} exchangeCd
 */
function getExchange(exchangeCd) {
    const exchangeMap = {
        '2': 'hastc',
        '8': 'otc',
        '9': 'upcom'
    };
    return exchangeMap[exchangeCd] || 'hose';
}

/**
 * Cafef - Lấy cổ tức
 *
 * @author TienPD3@icloud.com (https://paypal.me/tienpd3)
 * @date 2024/02/14
 * @param {*} exchange
 * @param {*} stockName
 */
async function bussinessPlan(exchangeCd, stockCode, stockName) {
    const keyUrl = `${stockCode.stringEnglishHyphen()}-${stockName.stringEnglishHyphen()}.chn`;
    const url = `${pathCafef}/${getExchange(exchangeCd)}/${keyUrl}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'text/html'
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const responseText = await response.text();
        const elmBussinessPlan = $(responseText).find('.kehoachkd');
        const strHeader = elmBussinessPlan.find('h2.cattitle.noborder').text();
        const year = strHeader.match(/[0-9]+/i);
        let dataCurrent = elmBussinessPlan.find('div:contains("Cổ tức bằng tiền mặt")').siblings(1).text();

        if (dataCurrent === 'N/A' || dataCurrent === '') {
            dataCurrent = elmBussinessPlan.find('div:contains("Cổ tức bằng cổ phiếu")').siblings(1).text();
            if (dataCurrent === 'N/A' || dataCurrent === '') {
                dataFACurrent.dividend = 'không có';
                dataFACurrent.dividendPercent = '0%';
            } else {
                dataFACurrent.dividend = `cổ phiếu[${year}]`;
                dataFACurrent.dividendPercent = dataCurrent;
            }
        } else {
            dataFACurrent.dividend = `tiền mặt[${year}]`;
            dataFACurrent.dividendPercent = dataCurrent;
        }
    } catch (error) {
        console.error('Failed to fetch business plan:', error);
    }
}

/**
 * Fireant - Cổ đông
 *
 * @author TienPD3@icloud.com (https://paypal.me/tienpd3)
 * @date 2024/02/14
 * @param {*} stockCode
 */
async function holdersFireant(stockCode) {
    try {
        const response = await fetch(`${pathFireant}/symbols/${stockCode}/holders`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': ACCESS_TOKEN_FIREANT
            },
            cache: 'no-store' // Ensure fresh data is fetched
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const totalOwnership = data.reduce((acc, holder) => acc + (holder.ownership * 100 || 0), 0);
        console.log(`Total ownership percentage: ${totalOwnership}%`);
    } catch (error) {
        console.error('Error fetching holders data:', error);
    }
}

/**
 * Fireant - Hồ sơ
 *
 * @author TienPD3@icloud.com (https://paypal.me/tienpd3)
 * @date 2024/02/14
 * @param {*} stockCode
 */
async function profileFireant(stockCode) {
    try {
        const response = await fetch(`${pathFireant}/symbols/${stockCode}/profile`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': ACCESS_TOKEN_FIREANT
            },
            cache: 'no-store' // Ensure fresh data is fetched
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        // Khối lượng cổ phiếu đang niêm yết
        dataFACurrent.listingVolume = StringUtils.formatCashMillion(data.listingVolume);
    } catch (error) {
        console.error('Error fetching profile data:', error);
    }
}

/**
 * Fireant - Giá quá khứ
 *
 * @author TienPD3@icloud.com (https://paypal.me/tienpd3)
 * @date 2024/02/14
 * @param {*} stockCode
 */
async function historicalQuotesFireant(stockCode) {
    if (historicalQuotes === null) {
        strLatestTGCP = null;
        const url = `${pathFireant}/symbols/${stockCode}/historical-quotes?startDate=1900-01-01&endDate=${DatetimeUtils.getSystemDate()}&offset=0&limit=1`;
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': ACCESS_TOKEN_FIREANT
        };

        try {
            const response = await fetch(url, { method: 'GET', headers });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const reps = await response.json();
            if (reps.length > 0) {
                // Giá đóng cửa của ngày hôm nay
                dataFACurrent.priceClose = Math.round(reps[0].priceClose * 1000);
            } else {
                console.warn('No historical quotes data available');
            }
        } catch (error) {
            console.error('Error fetching historical quotes:', error);
        }
    }
}

/**
 * Fireant - Tổng quan - Tổng hợp
 * 
 * @author TienPD3@icloud.com (https://paypal.me/tienpd3)
 * @date 2024/02/14
 * @param {*} stockCode
 */
async function fundamentalFireant(stockCode) {
    if (historicalQuotes === null) {
        strLatestTGCP = null;

        try {
            const response = await fetch(`${pathFireant}/symbols/${stockCode}/fundamental`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': ACCESS_TOKEN_FIREANT
                }
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            // Cổ phiếu đang lưu hành
            dataFACurrent.sharesOutstanding = StringUtils.formatCashMillion(data.sharesOutstanding);
        } catch (error) {
            console.error('Error fetching fundamental data:', error);
        }
    }
}

/**
 * Fireant - Chỉ số
 *
 * @author TienPD3@icloud.com (https://paypal.me/tienpd3)
 * @date 2024/02/14
 * @param {*} stockCode
 */
async function financialIndicatorsFireant(stockCode) {
    try {
        const response = await fetch(`${pathFireant}/symbols/${stockCode}/financial-indicators`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': ACCESS_TOKEN_FIREANT
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const reps = await response.json();
        const indicatorsMap = {
            'P/E': 'PE',
            'P/B': 'PB',
            '%Lãi ròng': 'netProfitMargin',
            '%Lãi gộp': 'grossMargin',
            'ROA': 'ROA',
            'ROE': 'ROE',
            'ROIC': 'ROIC',
            'Nợ/VCSH': 'debtOnEquity'
        };

        reps.forEach(obj => {
            const setName = indicatorsMap[obj.shortName];
            if (setName) {
                setValueFinancialIndicatorsFireant(obj.shortName, setName, obj);
            }
        });
    } catch (error) {
        console.error('Error fetching financial indicators:', error);
    }
}

/**
 * Set value financial indicators fireant
 *
 * @author TienPD3@icloud.com (https://paypal.me/tienpd3)
 * @date 2024/02/14
 * @param {*} getName
 * @param {*} setName
 * @param {*} obj
 */
function setValueFinancialIndicatorsFireant(getName, setName, obj) {
    // Gán giá trị cho dataFACurrent dựa trên tên được đặt nếu tên ngắn của đối tượng trùng với tên lấy được
    if (obj.shortName === getName) {
        dataFACurrent[setName] = obj.value;
    }
}

/**
 * Finpath - Phân tích tài chính
 *
 * @author TienPD3@icloud.com (https://paypal.me/tienpd3)
 * @date 2024/02/14
 * @param {*} stockCode
 * @param {*} isYear
 * @param {*} size
 */
async function financialratiosFinpath(stockCode, isYear, size) {
    const url = `${pathFinpath}/api/stocks/financialratios/${stockCode}`;
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const reps = await response.json();
        const dataReps = isYear ? reps.data.yearlyProfits : reps.data.quarterlyProfits;
        const dataMap = isYear ? mpYearData : mpYearMonthData;

        dataReps.slice(0, size).forEach(obj => {
            const key = isYear ? `${obj.yearReport}` : `${obj.yearReport}/Q${obj.quarterReport}`;
            const data = dataMap.get(key) || {};

            data.EPS = { new: obj.eps, old: '' };
            data.PB = { new: obj.pb, old: '' };
            data.PE = { new: obj.pe, old: '' };

            dataMap.set(key, data);
        });
    } catch (error) {
        console.error('Error fetching financial ratios:', error);
    }
}

/**
 * Simplize - Chỉ số tài chính
 *
 * @author TienPD3@icloud.com (https://paypal.me/tienpd3)
 * @date 2024/02/14
 * @param {*} stockCode
 * @param {*} isYear
 * @param {*} size
 */
async function financialratiosSimplize(stockCode, isYear, size) {
    const period = isYear ? 'Y' : 'Q';
    const periodSize = isYear ? 3 : 12;
    const url = `${pathSimplize}/api/company/fi/ratio/${stockCode}?period=${period}&size=${periodSize}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': ACCESS_TOKEN_SIMPLIZE
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const reps = await response.json();
        reps.data.items.slice(0, size).forEach(obj => {
            setValueSimplize(obj, 'PB', 'op2', isYear); // P/B
            setValueSimplize(obj, 'PE', 'op1', isYear); // P/E
            setValueSimplize(obj, 'EPS', 'op4', isYear); // EPS
        });
    } catch (error) {
        console.error('Error fetching financial ratios:', error);
    }
}

/**
 * Finpath - Báo cáo tài chính - Kết quả kinh doanh
 *
 * @author TienPD3@icloud.com (https://paypal.me/tienpd3)
 * @date 2024/02/14
 * @param {*} stockCode
 * @param {*} isBank
 * @param {*} isYear
 * @param {*} size
 */
async function fullincomestatementsFinpath(stockCode, isBank, isYear, size) {
    const url = `${pathFinpath}/api/stocks/fullincomestatements/${stockCode}`;
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const reps = await response.json();
        const dataReps = isYear ? reps.data.yearlys : reps.data.quarterlys;

        const dataMap = isYear ? mpYearData : mpYearMonthData;

        dataReps.slice(0, size).forEach(obj => {
            const key = isYear ? `${obj.yearReport}` : `${obj.yearReport}/Q${obj.quarterReport}`;
            const data = dataMap.get(key) || {};

            if (isBank) {
                data.netRevenue = { new: obj.isb25, old: '' }; // Thu nhập lãi và các khoản thu nhập tương tự - Danh thu thuần
                data.grossProfit = { new: obj.isb27, old: '' }; // Thu nhập lãi thuần - Lợi nhuận gộp
                data.netIncomeStatement = { new: obj.isb38, old: '' }; // Dòng tiền từ HĐKD - Tổng thu nhập từ hoạt động
            } else {
                data.netRevenue = { new: obj.isa3, old: '' }; // Doanh số thuần - Danh thu thuần
                data.grossProfit = { new: obj.isa5, old: '' }; // Lãi gộp - Lợi nhuận gộp
                data.netIncomeStatement = { new: obj.isa11, old: '' }; // Dòng tiền từ HĐKD - Lãi/(lỗ) từ hoạt động kinh doanh
            }

            data.LNST = { new: obj.isa22, old: '' }; // Lợi nhuận của Cổ đông của Công ty mẹ - Lợi nhuận sau thuế

            dataMap.set(key, data);
        });
    } catch (error) {
        console.error('Error fetching financial statements:', error);
    }
}


/**
 * Fireant - Tài chính - Kết quả kinh doanh
 *
 * @author TienPD3@icloud.com (https://paypal.me/tienpd3)
 * @date 2024/02/14
 * @param {*} stockCode
 * @param {*} isBank
 * @param {*} isYear
 * @param {*} size
 */
async function fullincomestatementsFireant(stockCode, isBank, isYear, size) {
    const year = DatetimeUtils.getYear();
    const quarter = isYear ? 0 : 1;
    const url = `${pathFireant}/symbols/${stockCode}/full-financial-reports?type=2&year=${year}&quarter=${quarter}&limit=${size}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': ACCESS_TOKEN_FIREANT
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const reps = await response.json();
        const mpData = arrayToMapFireant(reps);
        const financialFields = isBank ? {
            netRevenue: 'Thu nhập từ lãi và các khoản thu nhập tương tự',
            grossProfit: 'Thu nhập lãi thuần',
            netIncomeStatement: 'Tổng lợi nhuận trước thuế',
            LNST: 'Lợi nhuận sau thuế thu nhập doanh nghiệp'
        } : {
            netRevenue: 'Doanh thu thuần',
            grossProfit: 'Lợi nhuận gộp',
            netIncomeStatement: 'Lợi nhuận thuần từ hoạt động kinh doanh',
            LNST: 'Lợi nhuận sau thuế của cổ đông của công ty mẹ'
        };

        Object.entries(financialFields).forEach(([key, value]) => {
            setValueFireant(mpData, value, key, isYear);
        });
    } catch (error) {
        console.error('Error fetching financial statements:', error);
    }
}

/**
 * Finpath - Báo cáo tài chính - Cân đối kế toán
 *
 * @author TienPD3@icloud.com (https://paypal.me/tienpd3)
 * @date 2024/02/14
 * @param {*} stockCode
 * @param {*} isYear
 * @param {*} size
 */
async function fullbalancesheetsFinpath(stockCode, isYear, size) {
    const url = `${pathFinpath}/api/stocks/fullbalancesheets/${stockCode}`;
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const reps = await response.json();
        const dataReps = isYear ? reps.data.yearlys : reps.data.quarterlys;

        const mapData = isYear ? mpYearData : mpYearMonthData;

        dataReps.slice(0, size).forEach(obj => {
            const key = isYear ? `${obj.yearReport}` : `${obj.yearReport}/Q${obj.quarterReport}`;
            const data = mapData.get(key) || {};

            // bsa53: TỔNG CỘNG TÀI SẢN
            data.TTS = { new: obj.bsa53, old: '' };
            // bsa54: NỢ PHẢI TRẢ
            data.NO = { new: obj.bsa54, old: '' };
            // bsa78: VỐN CHỦ SỞ HỮU
            data.ownerEquity = { new: obj.bsa78, old: '' };

            mapData.set(key, data);
        });
    } catch (error) {
        console.error('Error fetching balance sheets:', error);
    }
}

/**
 * Fireant - Tài chính - Cân đối kế toán
 *
 * @author TienPD3@icloud.com (https://paypal.me/tienpd3)
 * @date 2024/02/14
 * @param {*} stockCode
 * @param {*} isYear
 * @param {*} size
 */
async function fullbalancesheetsFireant(stockCode, isYear, size) {
    const year = DatetimeUtils.getYear();
    const quarter = isYear ? 0 : 1;
    const url = `${pathFireant}/symbols/${stockCode}/full-financial-reports?type=1&year=${year}&quarter=${quarter}&limit=${size}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': ACCESS_TOKEN_FIREANT
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const reps = await response.json();
        const mpData = arrayToMapFireant(reps);

        const keys = [
            { mpKey: 'TỔNG CỘNG TÀI SẢN', set: 'TTS' },
            { mpKey: 'Nợ phải trả', set: 'NO' },
            { mpKey: 'Nợ dài hạn', set: 'longTermDebt' },
            { mpKey: 'Nguồn vốn chủ sở hữu', set: 'ownerEquity' }
        ];

        keys.forEach(({ mpKey, set }) => {
            setValueFireant(mpData, mpKey, set, isYear);
        });
    } catch (error) {
        console.error('Error fetching balance sheets:', error);
    }
}

/**
 * Convvert array to map of Fireant
 *
 * @author TienPD3@icloud.com (https://paypal.me/tienpd3)
 * @date 2024/02/14
 * @param {*} input
 * @return {*}
 */
function arrayToMapFireant(input) {
    const map = new Map();
    const regex = /-|\(\d+\)|\+/g;
    input.forEach(obj => {
        const arrName = obj.name.split('.');
        const name = (arrName.length === 1 ? arrName[0] : arrName[1]).replace(regex, '').trim();
        map.set(name, obj.values);
    });
    return map;
}

/**
 * Set value of Fireant
 *
 * @author TienPD3@icloud.com (https://paypal.me/tienpd3)
 * @date 2024/02/14
 * @param {*} mpData
 * @param {*} mpKey
 * @param {*} set
 * @param {*} isYear
 */
function setValueFireant(mpData, mpKey, set, isYear) {
    const entries = mpData.get(mpKey);
    if (!entries) return;

    const dataMap = isYear ? mpYearData : mpYearMonthData;

    entries.forEach(obj => {
        const key = isYear ? `${obj.year}` : `${obj.year}/Q${obj.quarter}`;
        const data = dataMap.get(key) || {};

        // Lấy theo Quý hoặc Năm
        if (data[set]) {
            data[set].old = data[set].new;
            data[set].new = obj.value;
        } else {
            data[set] = { new: obj.value, old: '' };
        }

        dataMap.set(key, data);
    });
}

/**
 * Set value of Simplize
 *
 * @author TienPD3@icloud.com (https://paypal.me/tienpd3)
 * @date 2024/02/14
 * @param {*} obj
 * @param {*} set
 * @param {*} get
 * @param {*} isYear
 */
function setValueSimplize(obj, set, get, isYear) {
    const periodDateNameParts = obj.periodDateName.split('/');
    const key = isYear ? obj.periodDate : `${periodDateNameParts[1]}/${periodDateNameParts[0]}`;
    const dataMap = isYear ? mpYearData : mpYearMonthData;
    const data = dataMap.get(key) || {};

    // Lấy theo Quý hoặc Năm
    if (data[set]) {
        data[set].old = data[set].new;
        data[set].new = obj[get];
    } else {
        data[set] = { new: obj[get], old: '' };
    }

    dataMap.set(key, data);
}


