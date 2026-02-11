
const fs = require('fs');

const inputFile = process.argv[2];
const outputFile = process.argv[3];

if (!inputFile || !outputFile) {
    console.error("Usage: node clean_script.js <input_file> <output_file>");
    process.exit(1);
}

try {
    const content = fs.readFileSync(inputFile, "utf-8");
    const data = JSON.parse(content);

    const cleanedData = data.map(item => {
        let jp = item.jp;
        let vn = item.vn;

        // This function applies a series of replacements to a string.
        const applyReplacements = (str) => {
            if (!str || typeof str !== 'string') {
                return str;
            }

            // 1. Remove XML/RTF-like tags
            const tagRegex = /<(\/)?(rpr|bmk|fld|cmt|strike|fill-sd|br|km|mq:ch|instr|lnk-c|size|w:br|a:br|v:shape|v:imagedata|v:textbox|w:pict|w:t|v:rect)[^>]*>/g;
            str = str.replace(tagRegex, "");
            
            // Extra cleanup for leftover attributes from broken tags
            const attrRegex = /[a-zA-Z0-9:]+="[^"]*"/g;
            str = str.replace(attrRegex, "");

            // 2. Replace sensitive information
            const replacements = [
                // Names
                { search: /宮下\s*直之/g, jp: "[代表者名A]", vn: "[Tên Đại Diện A]" },
                { search: /宮原\s*克博/g, jp: "[代表者名B]", vn: "[Tên Đại Diện B]" },
                { search: /Tran Thi Kim Phuong|トラン・ティ・キム・フォン/g, jp: "[代表者名C]", vn: "[Tên Đại Diện C]" },
                { search: /ド\s*ヴァン\s*カック/g, jp: "[代表者名D]", vn: "[Tên Đại Diện D]" },
                { search: /NGUYEN\s*CUONG/g, jp: "[管理責任者]", vn: "[Người Quản Lý]" },
                { search: /大根田\s*剛/g, jp: "[社員A]", vn: "[Nhân Viên A]" },
                { search: /Norihito Okawa/g, jp: "[社員B]", vn: "[Nhân Viên B]" },
                { search: /田中/g, jp: "[社員C]", vn: "[Nhân Viên C]" },
                { search: /鈴木/g, jp: "[担当者A]", vn: "[PIC A]" },

                // Companies & Orgs
                { search: /株式会社ミューチュアル・グロース/g, jp: "[再委託先会社]", vn: "[Công Ty Gia Công Lại]" },
                { search: /株式会社ヌーラボ|ヌーラボ社/g, jp: "[ツール提供会社]", vn: "[Công Ty Cung Cấp Tool]" },
                { search: /三井住友銀行/g, jp: "[銀行A]", vn: "[Ngân Hàng A]" },
                { search: /オッズ・パーク|OddsPark|OP社/g, jp: "[サービス提供会社]", vn: "[Công Ty Cung Cấp Dịch Vụ]" },
                { search: /富士通/g, jp: "[開発会社]", vn: "[Công Ty Phát Triển]"},
                { search: /JKA/g, jp: "[組織A]", vn: "[Tổ Chức A]" },
                
                // Systems
                { search: /IISV/g, jp: "[システムA]", vn: "[Hệ Thống A]" },
                { search: /IRIS/g, jp: "[システムB]", vn: "[Hệ Thống B]" },

                // Addresses
                { search: /東京都中央区京橋二丁目２番1号/g, jp: "[住所A]", vn: "[Địa Chỉ A]" },
                { search: /東京都港区芝公園一丁目７番６号/g, jp: "[住所B]", vn: "[Địa Chỉ B]" },

                // Financials
                { search: /42,000,000/g, jp: "[金額A]", vn: "[Số Tiền A]" },
                { search: /46,200,000/g, jp: "[金額B]", vn: "[Số Tiền B]" },
            ];

            replacements.forEach(r => {
                str = str.replace(r.search, item.vn ? r.vn : r.jp);
            });
            
            return str;
        };
        
        jp = applyReplacements(jp);
        vn = applyReplacements(vn);

        return { jp, vn };
    });

    fs.writeFileSync(outputFile, JSON.stringify(cleanedData, null, 2));
    console.log(`Cleaned file written to ${outputFile}`);

} catch (error) {
    console.error("An error occurred:", error.message);
    process.exit(1);
}
