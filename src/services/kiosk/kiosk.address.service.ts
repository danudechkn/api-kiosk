import db from "../../models/ppkhosp/index";

export class KioskAddressService {
    static async getPatAddress(hn: string | number) {
        // ดึงข้อมูลที่อยู่ทั้งหมดของผู้ป่วยตาม HN
        const addresses = await db.PatAddress.findAll({
            where: { hn },
            order: [["flag_status", "ASC"], ["id", "ASC"]],
        });

        const listOfAddress: any[] = [];

        for (let i = 0; i < addresses.length; i++) {
            const row = addresses[i].get({ plain: true });

            // Suffix คือเลขลำดับของข้อมูลที่อยู่ที่มี (1, 2, 3...)
            const suffixKey = String(i + 1);

            // ดึงชื่อ ตำบล / อำเภอ / จังหวัด จากตาราง addressname
            let tambonName = "";
            let amphurName = "";
            let provinceName = "";
            let zipCode = row.postcode ?? "";

            let prov2 = "";
            let amp2 = "";
            let tam2 = "";

            if (row.tambon) {
                const t = await db.Addressname.findOne({ where: { addresscode: String(row.tambon) } });
                if (t) {
                    tambonName = t.detailtext ?? "";
                    if (!zipCode && t.zipcode) zipCode = t.zipcode;
                    prov2 = t.province ?? "";
                    amp2 = t.amphur ?? "";
                    tam2 = t.tambon ?? "";
                }
            }
            if (row.amphur) {
                const a = await db.Addressname.findOne({ where: { addresscode: String(row.amphur) } });
                if (a) {
                    amphurName = a.detailtext ?? "";
                    if (!zipCode && a.zipcode) zipCode = a.zipcode;
                    if (!prov2 && a.province) prov2 = a.province;
                    if (!amp2 && a.amphur) amp2 = a.amphur;
                }
            }
            if (row.province) {
                const p = await db.Addressname.findOne({ where: { addresscode: String(row.province) } });
                if (p) {
                    provinceName = p.detailtext ?? "";
                    if (!prov2 && p.province) prov2 = p.province;
                }
            }

            // ProvinceComposeCode เช่น "10.08.01"
            const provinceComposeCode = (prov2 && amp2 && tam2)
                ? `${prov2}.${amp2}.${tam2}`
                : "";

            // ProvinceComposeName เช่น "ป้อมปราบ เขตป้อมปราบศัตรูพ่าย กรุงเทพมหานคร"
            const provinceComposeName = [tambonName, amphurName, provinceName]
                .filter(Boolean)
                .join(" ");

            const provinceComposeNameSplit = [tambonName, amphurName, provinceName]
                .filter(Boolean)
                .join(" ");

            // Address1 (บ้านเลขที่ + หมู่)
            const address1Parts = [
                row.house ? row.house.trim() : "",
                row.moo ? `หมู่ที่ ${row.moo}` : "",
            ].filter(Boolean);
            const address1 = address1Parts.join(" ");

            // FullAddress
            const fullParts = [
                address1,
                row.soy ? `ซอย${row.soy}` : "",
                row.road ? `ถนน${row.road}` : "",
                provinceComposeName,
                zipCode ?? "",
            ].filter(Boolean);
            const fullAddress = fullParts.join(" ");

            listOfAddress.push({
                Suffix: suffixKey,
                PatientAddressResult: {
                    Address1: address1 || (row.house ?? ""),
                    RoadCode: "",
                    RoadName: row.road ?? "",
                    VillageCode: "",
                    VillageName: "",
                    ProvinceComposeCode: provinceComposeCode,
                    ProvinceComposeName: provinceComposeName,
                    ProvinceComposeNameSplit: provinceComposeNameSplit,
                    Moo: row.moo ? String(row.moo) : "",
                    AddressType: row.flag_status ? String(row.flag_status).padStart(2, "0") : "",
                    Suffix: suffixKey,
                    PostalCode: zipCode ? String(zipCode) : "",
                    FullAddress: fullAddress,
                    CommunicableNo: "",
                    TelephoneNo: row.phone ?? "",
                    MobilePhone: row.phone ?? "",
                },
            });
        }

        return {
            status: 0,
            DataRes: {
                LogMessage: "",
                ErrorMessage: "",
                ListOfAddress: listOfAddress,
            },
            ErrorMessage: "",
        };
    }

    /**
     * เปลี่ยนเบอร์โทรศัพท์ของผู้ป่วย (change-phone-number / kiosk_change_phone_number)
     * ใช้ตาราง pat_telephone เท่านั้น
     */
    static async Chagnphonnumber(data: {
        HN: string | number;
        OldTelephone: string;
        NewTelephone: string;
    }) {
        const { HN, NewTelephone, OldTelephone } = data;

        // ฟังก์ชันช่วยทำความสะอาดเบอร์โทร (ตัดขีด ช่องว่าง และตัวอักษร เช่น (ปัจจุบัน) ออก เหลือเฉพาะตัวเลขล้วน)
        const cleanNumber = (num?: string | null) => (num || "").replace(/[^0-9]/g, "");
        const cleanOldPhone = cleanNumber(OldTelephone);
        const cleanNewPhone = cleanNumber(NewTelephone);

        if (!cleanOldPhone || !cleanNewPhone) {
            return {
                status: 1,
                DataRes: null,
                ErrorMessage: "Invalid telephone number format",
            };
        }

        // 1. ตรวจสอบข้อมูลใน pat_telephone
        const phoneRecords = await db.PatTelephone.findAll({
            where: { hn: HN },
            order: [["id", "DESC"]],
        });

        if (!phoneRecords || phoneRecords.length === 0) {
            return {
                status: 1,
                DataRes: null,
                ErrorMessage: "Patient not found in the system",
            };
        }

        // ตรวจสอบว่าเบอร์เดิมตรงกับเบอร์ใน pat_telephone หรือไม่ (รองรับกรณีมีขีด หรือมีข้อความต่อท้าย เช่น (ปัจจุบัน))
        const matchedRecord = phoneRecords.find((r: any) => {
            const dbPhone = cleanNumber(r.telephone);
            if (!dbPhone) return false;
            return (
                dbPhone === cleanOldPhone ||
                (cleanOldPhone.length >= 9 && dbPhone.includes(cleanOldPhone))
            );
        });

        if (!matchedRecord) {
            return {
                status: 1,
                DataRes: null,
                ErrorMessage: "Old telephone number is incorrect or does not match system records",
            };
        }

        // 2. เบอร์เดิมถูกต้อง -> อัปเดตใน pat_telephone
        // ปิด active เบอร์เดิม
        await db.PatTelephone.update(
            { flag_active: "N", editdatetime: new Date() },
            { where: { id: matchedRecord.id } },
        );

        // หาค่า id สูงสุดตัวล่าสุด เนื่องจากคอลัมน์ id ในตาราง pat_telephone ไม่ได้เป็น auto_increment
        const maxId = await db.PatTelephone.max("id");
        const nextId = (Number(maxId) || 0) + 1;

        // เพิ่มเบอร์ใหม่ (บันทึกเฉพาะตัวเลขล้วน เช่น 0812345678)
        await db.PatTelephone.create({
            id: nextId,
            hn: Number(HN),
            telephone: cleanNewPhone,
            contactname: matchedRecord.contactname || null,
            userid: matchedRecord.userid || null,
            editdatetime: new Date(),
            flag_active: "Y",
        });

        return {
            status: 0,
            DataRes: {
                Message: "Telephone number changed successfully",
                ResultStatus: true,
            },
            ErrorMessage: "",
        };
    }

    // Alias เผื่อเรียก changePhoneNumber
    static async changePhoneNumber(data: {
        HN: string | number;
        OldTelephone: string;
        NewTelephone: string;
    }) {
        return this.Chagnphonnumber(data);
    }
}
