import { Op } from "sequelize";
import db from "../../models/ppkhosp/index";

/**
 * ตารางสำรองรหัสคลินิก (OPD Code Fallback)
 * ใช้ในกรณีที่ค้นหาจากตาราง location.locationcode หรือ appoint_periodlocation ไม่พบ
 */
export const LOCATION_OPD_PREFIX: Record<number, string> = {
    // ห้องตรวจผู้ป่วยนอกทั่วไป & คลินิกเฉพาะโรค
    3001: "X",   // ห้องตรวจแผนกอายุรกรรมทั่วไป ชั้น 2
    3002: "XT",  // โรคระบบทางเดินอาหาร
    3003: "Z",   // โรควัณโรคปอดผู้ใหญ่
    3004: "X",   // โรคไตและความดันโลหิตสูง
    3005: "CM",  // โรคเลือดในผู้ใหญ่
    3006: "X",   // โรคระบบทางเดินหายใจ
    3007: "HH",  // โรคหัวใจ
    3008: "XN",  // โรคอายุรกรรมประสาท
    3010: "X",   // อายุรกรรมต่อมไร้ท่อ
    3011: "XS",  // โรคผิวหนัง
    3012: "XV",  // โรคข้อรูมาตอยและโรคเกาท์
    3014: "O",   // อายุรกรรมมะเร็ง
    3016: "U",   // คลินิกอาชีวเวชกรรม
    3019: "X",   // คลินิกโรคติดเชื้อ
    3020: "XP",  // คลินิกอายุรกรรมPHPT
    3021: "XX",  // คลินิกเลเซอร์
    3022: "CM",  // เคมีบำบัด
    3023: "MC",  // ห้องตรวจคลินิกตรวจสุขภาพ
    3024: "V",   // หน่วยไตเทียม
    3025: "X",   // โภชนาการคลินิก
    3026: "ML",  // ตรวจสุขภาพแรงงานต่างชาติ
    3027: "S",   // ห้องตรวจศูนย์โรคหัวใจ
    3028: "CM",  // งานหน่วยตรวจพิเศษอายุรกรรม(ห้องส่องกล้อง)
    3029: "GP",  // ห้องตรวจคลินิกเวชปฏิบัติทั่วไป

    // แผนกศัลยกรรม & สูติ-นรีเวช
    3050: "A",   // ห้องตรวจแผนกศัลยกรรมทั่วไป
    3051: "Y",   // ศัลยกรรมทางเดินปัสสาวะ
    3052: "Y",   // ศัลยกรรมทรวงอก
    3053: "Y",   // ศัลยกรรมตกแต่ง
    3054: "C",   // ศัลยกรรมประสาท
    3055: "Y",   // คลินิกโรคต่อมลูกหมาก
    3056: "Y",   // กุมารศัลยศาสตร์
    3057: "O",   // ห้องผ่าตัดเล็ก
    3060: "G",   // ห้องตรวจแผนกสูติกรรม
    3064: "HC",  // ตรวจหลังคลอดและวางแผนครอบครัว
    3066: "HB",  // คลินิกวัยทอง
    3067: "HA",  // คลินิกมีบุตรยาก
    3069: "G",   // คลินิกทารกในครรภ์
    3070: "H",   // ห้องตรวจนรีเวชกรรม
    3072: "H",   // คลินิกมะเร็งนรีเวช

    // กุมารเวชกรรม & คลินิกเด็ก
    3079: "I",   // กระตุ้นพัฒนาการเด็ก
    3080: "W",   // ห้องตรวจแผนกกุมารเวชกรรมทั่วไป
    3082: "W",   // คลินิกต่อมไร้ท่อในเด็ก
    3083: "W",   // พัฒนาการเด็ก
    3086: "W",   // โรคไตในเด็ก
    3087: "W",   // โรคเลือดในเด็ก
    3089: "W",   // โรคหัวใจในเด็ก
    3090: "W",   // โรคระบบประสาทในเด็ก
    3091: "W",   // โรคติดเชื้อในเด็ก
    3094: "W",   // โรคระบบทางเดินหายใจในเด็ก
    3095: "W",   // คลินิกโรคหืดในเด็ก
    3097: "GA",  // คลินิกผู้ป่วยโรคมะเร็งเด็ก

    // หู คอ จมูก, ตา, กระดูก, จิตเวช, กายภาพ/เวชกรรมฟื้นฟู, ทันตกรรม
    3100: "E",   // ห้องตรวจแผนกโสต ศอ นาสิก
    3110: "J",   // ห้องตรวจแผนกจักษุวิทยา
    3120: "B",   // ห้องตรวจแผนกศัลยกรรมกระดูก
    3130: "PA",  // ห้องตรวจแผนกจิตเวช
    3134: "PB",  // จิตเวชเด็กและวัยรุ่น
    3140: "L",   // ห้องตรวจแผนกเวชกรรมฟื้นฟู
    3145: "L",   // ห้องตรวจแผนกเวชกรรมฟื้นฟูโรคหลอดเลือดสมอง
    3146: "L",   // ห้องตรวจแผนกเวชกรรมฟื้นฟูคลินิกเท้าเบาหวาน
    3147: "L",   // ห้องตรวจแผนกเวชกรรมฟื้นฟูคลินิกลดเกร็ง
    3150: "DN",  // ห้องตรวจแผนกทันตกรรม
    3151: "DN",  // ห้องตรวจทันตกรรมนอกเวลา
    3152: "DN",  // ห้องตรวจทันตกรรมผู้สูงอายุ
    3156: "DN",  // ห้องตรวจทันตกรรม งานมะเร็ง
    3161: "TM",  // คลินิกฝังเข็ม
    3162: "TM",  // คลินิกนวดแผนไทย
    3163: "TM",  // คลินิกแพทย์แผนไทย
    3165: "TM",  // คลินิกผดุงครรภ์ไทย
    3167: "TM",  // คลินิกหัตถการแผนไทย

    // แล็บ, ฉุกเฉิน, รังสี, ศูนย์มะเร็ง, รพ.เมือง
    3191: "L",   // ห้องปฏิบัติการผู้ป่วยนอกและฉุกเฉิน(Lab)
    3192: "XW",  // คลินิกวาร์ฟาริน
    3193: "MS",  // คลินิกตรวจสุขภาพผู้ประกันตน
    3194: "X",   // ห้องตรวจคลื่นไฟฟ้าหัวใจ
    3200: "SM",  // ห้องตรวจนอกเวลาราชการ
    3210: "O",   // นิติเวชคลินิก
    3300: "Q",   // ห้องตรวจอุบัติเหตุฉุกเฉิน
    3320: "RT",  // ห้องตรวจรังสีรักษา
    3325: "RT",  // ห้องตรวจจระหว่างฉายรังสี
    3327: "CM",  // ห้องใส่แร่รังสี
    3330: "CM",  // ห้องตรวจผู้ป่วยนอกเวชศาสตร์นิวเคลียร์
    3456: "MH",  // รพ.เมือง OPD
    3457: "MH",  // ห้องตรวจผู้ป่วยนอก รพ.เมือง 2
    3471: "T",   // ห้องตรวจทันตกรรมปฐมภูมิและทุติยภูมิ
    3550: "EC",  // Echo หัวใจในเด็ก
    3556: "MR",  // คลินิก ARI
    3601: "XX",  // ห้องตรวจแผนกอายุรกรรมทั่วไป ชั้น 3
    3620: "K",   // ห้องตรวจอายุรกรรมทั่วไป (ศูนย์มะเร็งฯ)
    3630: "K",   // ห้องตรวจวิจัยคลินิก (CRC)
    3631: "MD",  // คลินิกสหสาขาด้านมะเร็ง
    3634: "CR",  // คลินิก Cancer Registry
    3905: "SM",  // SMC NCD Clinic
    3906: "SM",  // SMC รังสีรักษา
    3912: "SE",  // SMC จักษุ
    3913: "SM",  // SMC OPD มะเร็ง
    3920: "SG",  // SMC OPD_ศัลยกรรม
    3921: "O",   // SMC OPD_ศัลยกรรมกระดูก
    3925: "SU",  // SMC OPD_ศัลยกรรมทางเดินปัสสาวะ
    3930: "SW",  // SMC OPD_กุมารเวชกรรม
    3940: "RH",  // SMC OPD_เวชกรรมฟื้นฟู
    3950: "SN",  // SMC OPD_สูติ-นรีเวช
    3996: "K",   // CI Clinic (Community Isolation)
    4010: "M4",  // หอผู้ป่วยพิเศษอายุรกรรม ชั้น 7
    4011: "M4",  // หอผู้ป่วยพิเศษอายุรกรรมชั้น 7 (HQ)
    4017: "M4",  // หอผู้ป่วยพิเศษอายุรกรรม ชั้น 9
    6000: "L",   // ห้องปฏิบัติการผู้ป่วยนอกและฉุกเฉิน
    6056: "L",   // ห้องเจาะเลือด 220
};

export interface GenerateQueueParams {
    hn: number | string;
    cid?: string | null;
    visitDate: string; // YYYY-MM-DD หรือสตริงวันที่มีเวลาติดมา เช่น "2026-11-09 02:30:00"
    locationId: number;
    doctorId?: number | null;
    appointId?: number | null;
    patRegId?: number | null;
}

export interface GenerateQueueResult {
    queueNo: string;
    opdCode: string;
    doctorCode: string;
    slotNo: number;
    seq: number;
    seqStr: string;
}

export class KioskQueueService {
    /**
     * คำนวณช่วงเวลา slot (1 - 16) อิงตามช่วงเวลา 30 นาที เริ่มตั้งแต่ 08:00
     * Slot 1: 08:00 - 08:30
     * Slot 2: 08:30 - 09:00
     * ...
     * Slot 16: 15:30 - 16:00 (หรือหลังจากนั้น)
     */
    static calculateCurrentSlot(timeStr?: string): number {
        const now = new Date();
        if (timeStr) {
            const parts = timeStr.split(":");
            if (parts.length >= 2) {
                const h = parseInt(parts[0], 10);
                const m = parseInt(parts[1], 10);
                if (!isNaN(h) && !isNaN(m)) {
                    now.setHours(h, m, 0, 0);
                }
            }
        }
        const minutes = now.getHours() * 60 + now.getMinutes();
        const startMinutes = 8 * 60; // 08:00
        if (minutes < startMinutes) return 1;
        const slot = Math.floor((minutes - startMinutes) / 30) + 1;
        if (slot > 16) return 16;
        return slot;
    }

    /**
     * ดึงเลขคิวที่มีอยู่แล้วจาก queue_kioskq ตาม patregid
     */
    static async getExistingQueue(patRegId: number): Promise<string | null> {
        try {
            if (!patRegId) return null;
            const row = await db.QueueKioskq.findOne({
                where: { patregid: patRegId },
            });
            if (row?.squeue) {
                return row.squeue.trim();
            }
        } catch (e: any) {
            console.warn("Notice: Warning checking existing queue via QueueKioskq model:", e?.message);
        }
        return null;
    }

    /**
     * ดึงเลขคิวที่มีอยู่แล้วจาก queue_kioskq ตาม HN และ visitDate
     */
    static async getExistingQueueByHn(hn: number | string, visitDate: string): Promise<string | null> {
        try {
            const hnNum = Number(String(hn).replace(/\D/g, ""));
            const dateMatch = String(visitDate || "").match(/\d{4}-\d{2}-\d{2}/);
            const cleanDate = dateMatch ? dateMatch[0] : new Date().toISOString().split("T")[0];

            if (!hnNum) return null;
            const row = await db.QueueKioskq.findOne({
                where: { hn: hnNum, visitdate: cleanDate },
                order: [["patregid", "DESC"]],
            });
            if (row?.squeue) {
                return row.squeue.trim();
            }
        } catch (e: any) {
            console.warn("Notice: Warning checking existing queue by HN:", e?.message);
        }
        return null;
    }

    /**
     * สร้างเลขคิว 4 ส่วนอย่างสมบูรณ์:
     * - ส่วนที่ 1: ตัวอักษรห้องตรวจ OPD (เช่น A, B, E, H, J, PA, MH, M4) สูงสุด 2 ตัวอักษร
     * - ส่วนที่ 2: ตัวอักษรประจำแพทย์ (ถ้าเป็น Walk-in จะไม่มีตัวอักษรบอกหมอ = "", ถ้าเป็นนัด = 'Z' หรือตาม doctor_location)
     * - ส่วนที่ 3: เลข Slot (คลินิก period ใช้ 1..16, non-period ใช้ 9)
     * - ส่วนที่ 4: ลำดับคิวใน Slot (period เติม 0 ให้ครบ 2 หลัก เช่น 01, 04, 12 / non-period เติม 0 ให้ครบ 3 หลัก เช่น 001, 023)
     */
    static async generate4PartQueue(params: GenerateQueueParams): Promise<GenerateQueueResult> {
        const hnNum = Number(String(params.hn).replace(/\D/g, ""));
        let cidClean = (params.cid || "").trim().replace(/\D/g, "");

        // สกัดวันที่ให้อยู่ในฟอร์แมต YYYY-MM-DD เสมอ เพื่อป้องกันข้อผิดพลาดเวลาเปรียบเทียบใน MySQL
        const dateMatch = String(params.visitDate || "").match(/\d{4}-\d{2}-\d{2}/);
        const cleanVisitDate = dateMatch ? dateMatch[0] : new Date().toISOString().split("T")[0];

        // หากไม่มี CID ส่งมา ให้ค้นหาเลขบัตรประชาชนจากตาราง pat อัตโนมัติ
        if (!cidClean && hnNum) {
            try {
                const patRec = await db.Pat.findByPk(hnNum);
                if (patRec?.citizencardno) {
                    cidClean = patRec.citizencardno.trim().replace(/\D/g, "");
                }
            } catch (patErr: any) {
                console.warn("Notice: Warning fetching CID from Pat model:", patErr?.message);
            }
        }

        const locId = Number(params.locationId);
        const docId = params.doctorId ? Number(params.doctorId) : null;
        const apptId = params.appointId ? Number(params.appointId) : null;
        const regId = params.patRegId ? Number(params.patRegId) : null;

        // 0. ตรวจสอบว่ามีคิวเดิมใน patregid หรือ HN ในวันนี้แล้วหรือยัง
        let existingQueue: string | null = null;
        if (regId) {
            existingQueue = await this.getExistingQueue(regId);
        }
        if (!existingQueue && hnNum) {
            existingQueue = await this.getExistingQueueByHn(hnNum, cleanVisitDate);
        }

        if (existingQueue) {
            // หากมีคิวเดิมแล้ว แต่ใน DB ฟิลด์ cid ยังเป็น null ให้อัปเดตเติม cid ให้สมบูรณ์
            if (cidClean) {
                try {
                    await db.QueueKioskq.update(
                        { cid: cidClean },
                        {
                            where: {
                                hn: hnNum,
                                visitdate: cleanVisitDate,
                                cid: null,
                            },
                        }
                    );
                } catch (uErr: any) {
                    // ignore
                }
            }
            return {
                queueNo: existingQueue,
                opdCode: "",
                doctorCode: "",
                slotNo: 0,
                seq: 0,
                seqStr: "",
            };
        }

        // 1. ส่วนที่ 1: ตัวอักษรห้องตรวจ OPD (ดึงจาก location.locationcode ก่อนเสมอ)
        let opdCode = "";
        let isPeriodClinic = false;

        try {
            // 1.1 ดึงจากคอลัมน์ locationcode ในตาราง location โดยตรง
            if (locId) {
                const locRec = await db.Location.findByPk(locId);
                if (locRec?.locationcode && locRec.locationcode.trim()) {
                    opdCode = locRec.locationcode.trim().toUpperCase();
                }
            }

            // 1.2 ตรวจสอบจาก appoint_periodlocation
            if (locId) {
                const apl = await db.AppointPeriodLocation.findByPk(locId);
                if (!opdCode && apl?.loccode && apl.loccode.trim()) {
                    opdCode = apl.loccode.trim().toUpperCase();
                }
                isPeriodClinic = apl?.flag_period === "Y";
            }
        } catch (locErr: any) {
            console.warn("Notice: Warning reading Location / AppointPeriodLocation model:", locErr?.message);
        }

        // 1.3 สำรอง (Fallback) จากตารางในโค้ดหากใน DB ยังไม่มี
        if (!opdCode) {
            opdCode = LOCATION_OPD_PREFIX[locId] || "OPD";
        }

        // 2. ส่วนที่ 2: ตัวอักษรประจำตัวแพทย์
        // กฎโรงพยาบาล:
        // - ถ้าเป็น Walk-in (ไม่มีใบนัด): ไม่มีตัวอักษรบอกหมอ (doctorCode = "") เช่น A1201, J401, RT9001
        // - ถ้าเป็นเคสนัด (apptId > 0):
        //     1. "นัดแพทย์ไม่ระบุ": docId เป็น null, 0, 89 ('แพทย์ไม่ระบุ') -> ใช้ตัวอักษร 'X' (เช่น AX801, AX9001)
        //     2. "นัดระบุแพทย์ แต่ไม่ระบุ code แพทย์": docId ระบุแพทย์ แต่ไม่มี code ใน doctor_location -> ใช้ 'Z' (เช่น AZ801, AZ9001)
        //     3. "นัดระบุแพทย์ และมี code แพทย์": ดึงรหัสแพทย์จาก doctor_location -> เช่น JE1017, EA1104
        let doctorCode = "";
        const isAppointment = !!(apptId && apptId > 0);

        if (isAppointment) {
            // ถ้ามีใบนัด แต่ไม่มี doctorId ส่งมา ให้ดึงจาก pat_appoint ก่อน
            let resolvedDocId = docId;
            if (apptId && (resolvedDocId === null || resolvedDocId === undefined)) {
                try {
                    const apptRec = await db.PatAppoint.findByPk(apptId);
                    if (apptRec && apptRec.appointtodoctorid !== undefined && apptRec.appointtodoctorid !== null) {
                        resolvedDocId = Number(apptRec.appointtodoctorid);
                    }
                } catch (aErr: any) {
                    console.warn("Notice: Warning reading PatAppoint for doctorid:", aErr?.message);
                }
            }

            const isUnspecifiedDoctor = !resolvedDocId || resolvedDocId === 0 || resolvedDocId === 89;

            if (isUnspecifiedDoctor) {
                // เคส "นัดแพทย์ไม่ระบุ" -> ใช้ 'X' (เช่น AX801, AX9001)
                doctorCode = "X";
            } else {
                // เคส "นัดระบุแพทย์ แต่ไม่ระบุ code แพทย์" -> ตั้งต้นเป็น 'Z' (เช่น AZ801, AZ9001)
                doctorCode = "Z";
                if (locId && resolvedDocId) {
                    try {
                        const docRow = await db.DoctorLocation.findOne({
                            where: { locationid: locId, doctorid: resolvedDocId },
                        });
                        if (docRow?.doctorcode && docRow.doctorcode.trim()) {
                            doctorCode = docRow.doctorcode.trim().toUpperCase();
                        }
                    } catch (docErr: any) {
                        console.warn("Notice: Warning reading DoctorLocation model:", docErr?.message);
                    }
                }
            }
        }

        // 3. ส่วนที่ 3 & ส่วนที่ 4: เลข Slot และ ลำดับใน Slot
        let slotNo = 9;
        let seq = 1;

        if (isAppointment) {
            // เคสนัด: ดึง slot และ seq จาก pat_appointperiod ของใบนัดก่อน
            try {
                const pap = await db.PatAppointPeriod.findByPk(apptId);
                if (pap && pap.slotno) {
                    slotNo = Number(pap.slotno);
                    seq = Number(pap.seq) || 1;
                } else {
                    if (isPeriodClinic) {
                        slotNo = this.calculateCurrentSlot();
                    } else {
                        slotNo = 9;
                    }
                    seq = await this.getNextSequence(cleanVisitDate, opdCode, doctorCode, slotNo);
                }
            } catch (papErr: any) {
                console.warn("Notice: Warning reading PatAppointPeriod model:", papErr?.message);
                seq = await this.getNextSequence(cleanVisitDate, opdCode, doctorCode, slotNo);
            }
        } else {
            // เคส Walk-in (ไม่มีตัวอักษรบอกหมอ)
            if (isPeriodClinic) {
                slotNo = this.calculateCurrentSlot();
            } else {
                slotNo = 9;
            }
            seq = await this.getNextSequence(cleanVisitDate, opdCode, doctorCode, slotNo);
        }

        // 4. ฟอร์แมตส่วนที่ 4 (ลำดับคิวใน Slot):
        // - คลินิก non-period (Slot 9): เติม 0 ให้ครบ 3 หลัก เช่น 001, 002, 023, 100
        // - คลินิก period (Slot 1..16): เติม 0 ให้ครบ 2 หลัก เช่น 01, 02, 10, 15
        let seqStr = "";
        if (slotNo === 9 && !isPeriodClinic) {
            seqStr = String(seq).padStart(3, "0");
        } else {
            seqStr = String(seq).padStart(2, "0");
        }

        const queueNo = `${opdCode}${doctorCode}${slotNo}${seqStr}`;

        // 5. บันทึกลงตาราง queue_kioskq ด้วยโมเดล QueueKioskq
        try {
            await db.QueueKioskq.upsert({
                hn: hnNum,
                cid: cidClean || null,
                visitdate: cleanVisitDate,
                squeue: queueNo,
                patregid: regId || null,
            });
        } catch (qErr: any) {
            console.warn("Notice: Warning upserting into QueueKioskq model:", qErr?.message);
        }

        // 6. ถ้ามี appointId ให้อัปเดต pat_appointcheckcov.qseq
        if (apptId && apptId > 0) {
            try {
                await db.PatAppointCheckCov.update(
                    { qseq: seq },
                    { where: { appointid: apptId } }
                );
            } catch (covErr: any) {
                console.warn("Notice: Warning updating pat_appointcheckcov.qseq:", covErr?.message);
            }
        }

        return { queueNo, opdCode, doctorCode, slotNo, seq, seqStr };
    }

    /**
     * ค้นหาเลขลำดับถัดไปของคิวในวันนี้ตาม prefix เพื่อป้องกันเลขคิวซ้ำกัน
     * ดึงค่า max sequence จากคิวที่เคยออกไปแล้วสำหรับ prefix นั้นๆ
     */
    private static async getNextSequence(
        visitDate: string,
        opdCode: string,
        doctorCode: string,
        slotNo: number
    ): Promise<number> {
        try {
            const prefix = `${opdCode}${doctorCode}${slotNo}`;
            const existingRows = await db.QueueKioskq.findAll({
                where: {
                    visitdate: visitDate,
                    squeue: { [Op.like]: `${prefix}%` },
                },
                attributes: ["squeue"],
            });

            if (!existingRows || existingRows.length === 0) {
                return 1;
            }

            let maxSeq = 0;
            for (const r of existingRows) {
                const qStr = (r.squeue || "").trim();
                if (qStr.startsWith(prefix)) {
                    const suffix = qStr.substring(prefix.length);
                    const parsedNum = parseInt(suffix, 10);
                    if (!isNaN(parsedNum) && parsedNum > maxSeq) {
                        maxSeq = parsedNum;
                    }
                }
            }

            return maxSeq + 1;
        } catch (e: any) {
            console.warn("Notice: Warning getting next sequence for prefix:", e?.message);
            return 1;
        }
    }

    /**
     * ฟังก์ชันแยกส่วนประกอบของรหัสคิว 4 ส่วน (OPD Code, Doctor Code, Slot, Seq)
     */
    static parseQueueNo(queueNo: string): {
        opdCode: string;
        doctorCode: string;
        slotNo: number;
        seq: number;
    } {
        if (!queueNo) {
            return { opdCode: "", doctorCode: "", slotNo: 0, seq: 0 };
        }
        const trimmed = queueNo.trim().toUpperCase();

        const KNOWN_2CHAR_OPD = new Set([
            "RT", "HH", "XN", "XX", "XT", "XS", "XV", "XP", "XW",
            "MC", "ML", "MS", "GP", "HC", "HB", "HA", "GA", "PA",
            "PB", "DN", "TM", "MH", "EC", "MR", "SM", "SG", "SU",
            "SW", "RH", "SN", "M4"
        ]);

        let opd = "";
        let rest = trimmed;

        const first2 = trimmed.substring(0, 2);
        if (KNOWN_2CHAR_OPD.has(first2)) {
            opd = first2;
            rest = trimmed.substring(2);
        } else {
            opd = trimmed.substring(0, 1);
            rest = trimmed.substring(1);
        }

        let docCode = "";
        if (rest.length > 0 && /[A-Z]/.test(rest[0])) {
            docCode = rest[0];
            rest = rest.substring(1);
        }

        let slotNo = 0;
        let seq = 0;
        if (rest.length === 4) {
            if (rest.startsWith("9")) {
                slotNo = 9;
                seq = parseInt(rest.substring(1), 10) || 0;
            } else {
                slotNo = parseInt(rest.substring(0, 2), 10) || 0;
                seq = parseInt(rest.substring(2), 10) || 0;
            }
        } else if (rest.length === 3) {
            slotNo = parseInt(rest.substring(0, 1), 10) || 0;
            seq = parseInt(rest.substring(1), 10) || 0;
        } else if (rest.length >= 5) {
            slotNo = parseInt(rest.substring(0, 2), 10) || 0;
            seq = parseInt(rest.substring(2), 10) || 0;
        }

        return { opdCode: opd, doctorCode: docCode, slotNo, seq };
    }
}
