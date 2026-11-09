const translations = {
    th: {
        income: "รายรับ",
        expense: "รายจ่าย",
        balance: "คงเหลือ",
        type: "ประเภทรายการ",
        amount: "จำนวนเงิน",
        category: "หมวดหมู่",
        note: "บันทึกช่วยจำ",
        save: "บันทึกรายการ",
        history: "ประวัติรายการ",
        date: "วันที่",
        action: "จัดการ",
        add_category_prompt: "กรอกชื่อหมวดหมู่ใหม่:"
    },
    lo: {
        income: "รายຮັບ",
        expense: "รายຈ່າຍ",
        balance: "ຍັງເຫຼືອ",
        type: "ປະເພດລາຍການ",
        amount: "ຈຳນວນເງິນ",
        category: "ໝວດໝູ່",
        note: "ບັນທຶກຊ່ວຍຈຳ",
        save: "ບັນທຶກລາຍການ",
        history: "ປະຫວັດລາຍການ",
        date: "ວັນທີ",
        action: "ຈັດການ",
        add_category_prompt: "ໃສ່ຊື່ໝວດໝູ່ໃໝ່:"
    },
    en: {
        income: "Income",
        expense: "Expense",
        balance: "Balance",
        type: "Type",
        amount: "Amount",
        category: "Category",
        note: "Note",
        save: "Save Transaction",
        history: "Transaction History",
        date: "Date",
        action: "Action",
        add_category_prompt: "Enter new category name:"
    }
};

function getTranslation(lang, key) {
    return translations[lang] && translations[lang][key] ? translations[lang][key] : translations['th'][key] || key;
}
