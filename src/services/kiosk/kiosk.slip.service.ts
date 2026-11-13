import { Op } from "sequelize";
import db from "../../models/ppkhosp/index";
import { KioskQueueService } from "./kiosk.queue.service";

export interface NHSOSlipPayload {
    mainInscl?: string;
    hcode?: string;
    hname?: string;
    FisrtName?: string;
    FirstName?: string;
    LastName?: string;
    DOB?: string;
    HN?: string;
    hn?: string;
    subinscl?: string;
    claimCode?: string;
    IDCard?: string;
}

export interface PrintVNLabelOrSlipKioskPayload {
    Preview?: boolean;
    HN?: string;
    hn?: string;
    VN?: string;
    vn?: string;
    VisitDate?: string;
    visitDate?: string;
    PrescriptionNo?: number;
    claimCode?: string;
    HCode?: string;
    HName?: string;
    SlipType?: string;
    ReceiveMedicine?: string;
}

/**
 * สกัดตัวเลขจาก HN เช่น "00015/67" -> 15 หรือ "4471058" -> 4471058
 */
function parseNumericHN(hnStr?: string): number | null {
    if (!hnStr) return null;
    const digits = hnStr.split("/")[0].replace(/\D/g, "");
    if (!digits) return null;
    const num = parseInt(digits, 10);
    return isNaN(num) ? null : num;
}

/**
 * สกัดรหัสในวงเล็บ เช่น "(89) ช่วงอายุ 12-59 ปี" -> "89"
 * หากไม่มีวงเล็บจะคืนค่าข้อความที่ตัดช่องว่างแล้ว
 */
function extractInsclCode(value?: string): string {
    if (!value) return "";
    const trimmed = value.trim();

    // 1. ตรวจจับค่าในวงเล็บ เช่น "(89) ...", "(D1) ..."
    const bracketMatch = trimmed.match(/\(([^)]+)\)/);
    if (bracketMatch && bracketMatch[1]) {
        return bracketMatch[1].trim();
    }

    // 2. ถ้าไม่มีวงเล็บ สกัดรหัสหน้าสุด (1-5 ตัวอักษร/ตัวเลข เช่น "89", "D1", "ST")
    const leadingCodeMatch = trimmed.match(/^([A-Za-z0-9]{1,5})\b/);
    if (leadingCodeMatch && leadingCodeMatch[1]) {
        return leadingCodeMatch[1].trim();
    }

    return trimmed;
}

export class KioskSlipService {
    /**
     * ตรวจสอบสิทธิและอนุญาตพิมพ์สลิปตรวจสอบสิทธิ สปสช. (kiosk_PrintNHSOLabelOrSlipKiosk):
     * 1. สกัดรหัสจาก subinscl เช่น "(89) ช่วงอายุ 12-59 ปี" -> "89"
     * 2. ตรวจสอบรหัสสถานพยาบาล (hcode) ใน coveragesite เพื่อระบุ flag_site (A: ใน รพ., B: ในจังหวัด, C: นอกจังหวัด)
     * 3. ค้นหารหัสสิทธิใน coveragecode ที่ตรงกับ subinscl และ flag_site
     * 4. ตรวจสอบใน pat_coverage ว่าผู้ป่วยมีสิทธิการรักษาตรงกับ subinscl ที่ส่งมาหรือไม่
     * 5. หากตรงกัน ให้คืนค่า PrintStatus: true เพื่อพิมพ์สลิป หากไม่ตรงให้แจ้งเตือน PrintStatus: false
     */
    static async printNHSOLabelOrSlipKiosk(payload: NHSOSlipPayload) {
        const rawHN = payload.HN || payload.hn || "";
        const cidVal = payload.IDCard || "";
        const reqSubCode = extractInsclCode(payload.subinscl).toUpperCase();
        const cleanHcode = (payload.hcode || "").trim();
        const hnNum = parseNumericHN(rawHN);

        if (!rawHN && !cidVal) {
            return {
                status: 1,
                DataRes: {
                    Message: "Please specify HN or ID Card number",
                    PrintStatus: false,
                },
                ErrorMessage: "Please specify HN or ID Card number",
            };
        }

        if (!reqSubCode) {
            return {
                status: 1,
                DataRes: {
                    Message: "Please specify subinscl information",
                    PrintStatus: false,
                },
                ErrorMessage: "Please specify subinscl information",
            };
        }

        // ค้นหา HN ของผู้ป่วยจาก HN หรือ เลขบัตรประชาชน
        let targetHN = hnNum;
        if (!targetHN && cidVal) {
            const patRec = await db.Pat.findOne({ where: { citizencardno: cidVal } });
            if (patRec) {
                targetHN = patRec.hn;
            }
        }

        if (!targetHN) {
            return {
                status: 1,
                DataRes: {
                    Message: "Patient not found in the hospital system",
                    PrintStatus: false,
                },
                ErrorMessage: "Patient not found in the hospital system",
            };
        }

        try {
            // กำหนดประเภทสถานพยาบาล (flag_site)
            let flagSite = "C";
            if (cleanHcode) {
                if (cleanHcode === "10664") {
                    flagSite = "A"; // รพ.พระปกเกล้า
                } else {
                    const siteIdNum = Number(cleanHcode);
                    const siteRecord = !isNaN(siteIdNum)
                        ? await db.Coveragesite.findOne({ where: { siteid: siteIdNum } })
                        : null;

                    const provCode = (siteRecord?.provcode || "").trim();
                    if (provCode === "22") {
                        flagSite = "B"; // ในจังหวัดจันทบุรี
                    } else {
                        flagSite = "C"; // นอกจังหวัดจันทบุรี
                    }
                }
            }

            // ค้นหารหัสสิทธิการรักษา (coveragecode) ที่ตรงกับ subinscl และ flag_site
            let matchedCoverage = await db.Coveragecode.findOne({
                where: {
                    nhso_subinscl: reqSubCode,
                    flag_site: flagSite,
                },
            });

            if (!matchedCoverage) {
                // ค้นหาโดยไม่จำกัด flag_site
                matchedCoverage = await db.Coveragecode.findOne({
                    where: {
                        nhso_subinscl: reqSubCode,
                    },
                });
            }

            // ตรวจสอบใน pat_coverage ว่าผู้ป่วยมีสิทธิตรงกับที่ส่งมาหรือไม่
            const todayStr = new Date().toISOString().split("T")[0];
            let matchedPatCoverage: any = null;

            if (matchedCoverage) {
                matchedPatCoverage = await db.PatCoverage.findOne({
                    where: {
                        hn: targetHN,
                        coveragecode: matchedCoverage.coveragecode,
                        flag_status: { [Op.ne]: "9" },
                        [Op.or]: [
                            { enddate: { [Op.gte]: todayStr } },
                            { enddate: null },
                        ],
                    },
                    order: [["flag_status", "ASC"], ["id", "DESC"]],
                });
            }

            // Fallback: ตรวจสอบสิทธิทั้งหมดของผู้ป่วยว่ามีสิทธิใดตรงกับ nhso_subinscl หรือไม่
            if (!matchedPatCoverage) {
                const patCoverages = await db.PatCoverage.findAll({
                    where: {
                        hn: targetHN,
                        flag_status: { [Op.ne]: "9" },
                        [Op.or]: [
                            { enddate: { [Op.gte]: todayStr } },
                            { enddate: null },
                        ],
                    },
                    order: [["flag_status", "ASC"], ["id", "DESC"]],
                });

                for (const cov of patCoverages) {
                    if (cov.coveragecode) {
                        const covCodeRec = await db.Coveragecode.findByPk(cov.coveragecode);
                        if (covCodeRec && covCodeRec.nhso_subinscl === reqSubCode) {
                            matchedPatCoverage = cov;
                            break;
                        }
                    }
                }
            }

            // หากไม่พบสิทธิการรักษาที่ตรงกันในระบบ
            if (!matchedPatCoverage) {
                return {
                    status: 1,
                    DataRes: {
                        Message: "Patient right/coverage does not match the hospital records",
                        PrintStatus: false,
                    },
                    ErrorMessage: "Patient right/coverage does not match the hospital records",
                };
            }

            // สิทธิตรงกัน อนุญาตให้พิมพ์สลิปตรวจสอบสิทธิได้
            return {
                status: 0,
                DataRes: {
                    Message: "",
                    PrintStatus: true,
                },
                ErrorMessage: "",
            };
        } catch (err: any) {
            console.error("printNHSOLabelOrSlipKiosk error:", err?.message);
            return {
                status: -1,
                DataRes: {
                    Message: "An error occurred while verifying patient coverage",
                    PrintStatus: false,
                },
                ErrorMessage: err?.message || "An error occurred while verifying patient coverage",
            };
        }
    }

    /**
     * พิมพ์สลิป VN (kiosk_PrintVNLabelOrSlipKiosk):
     * 1. ตรวจสอบข้อมูล HN, VN, VisitDate
     * 2. ค้นหาข้อมูลในตาราง pat_reg เพื่อดึงห้องตรวจ (location) และเลขคิว (queueno)
     * 3. หากไม่พบใน pat_reg จะค้นหาจากใบนัด (pat_appoint / pat_appointcheckcov)
     * 4. ส่งคืน QueueNo, AssignClinicName และ PrintStatus: true ตามสเปก Kiosk
     */
    static async printVNLabelOrSlipKiosk(payload: PrintVNLabelOrSlipKioskPayload) {
        const rawHN = (payload.HN || payload.hn || "").trim();
        const rawVN = (payload.VN || payload.vn || "").trim();
        const rawVisitDate = (payload.VisitDate || payload.visitDate || "").trim();

        const hnNum = parseNumericHN(rawHN);
        const vnNum = rawVN ? parseInt(rawVN.replace(/\D/g, ""), 10) : null;

        // ถ้าไม่ได้ระบุทั้ง HN และ VN ให้แจ้งเตือนและส่ง PrintStatus: false
        if (!hnNum && (vnNum === null || isNaN(vnNum))) {
            return {
                status: 1,
                DataRes: {
                    Message: "Please specify HN or VN",
                    InternalMessage: "HN or VN is required",
                    QueueNo: "",
                    AssignClinicName: "",
                    PrintStatus: false,
                },
                ErrorMessage: "Please specify HN or VN",
            };
        }

        // กำหนดวันที่ตรวจ (VisitDate) - สกัด YYYY-MM-DD จากสตริงทุกรูปแบบ เช่น "2026-11-09", "2026-11-09 02:30:00", "2026-11-09T00:00:00"
        let parsedDateOnly: string | null = null;
        if (rawVisitDate) {
            const dateMatch = rawVisitDate.match(/\d{4}-\d{2}-\d{2}/);
            if (dateMatch) {
                parsedDateOnly = dateMatch[0];
            }
        }
        let visitDateStr = parsedDateOnly || new Date().toISOString().split("T")[0];

        let queueNoStr = "";
        let assignClinicName = "";
        let targetHN = hnNum;

        try {
            // หากไม่มี HN แต่มี VN ให้ค้นหา HN จาก pat_reg
            if (!targetHN && vnNum !== null && !isNaN(vnNum)) {
                const regByVn = await db.PatReg.findOne({
                    where: {
                        [Op.or]: [
                            { patvisitid: vnNum },
                            { queueno: vnNum },
                            { locationqueueno: vnNum },
                        ],
                        flag_status: { [Op.ne]: "C" },
                    },
                    order: [["id", "DESC"]],
                });
                if (regByVn?.hn) {
                    targetHN = regByVn.hn;
                    if (regByVn.visitdate) {
                        visitDateStr = String(regByVn.visitdate).split("T")[0];
                    }
                }
            }

            if (targetHN) {
                // 1. ค้นหาใน pat_reg (รองรับทั้งการส่ง VN เป็น patvisitid หรือ queueno)
                const regWhere: any = {
                    hn: targetHN,
                    flag_status: { [Op.ne]: "C" },
                };

                // หากมีการระบุวันที่ตรวจมา ให้กรองตามวันที่นั้น
                // แต่ถ้าไม่ได้ระบุวันที่ และมีเลข VN ให้ค้นหาจาก VN ได้ทันที
                // หากไม่มีทั้งสองอย่าง ให้ใช้วันที่ปัจจุบัน
                if (parsedDateOnly) {
                    regWhere.visitdate = parsedDateOnly;
                } else if (vnNum === null || isNaN(vnNum)) {
                    regWhere.visitdate = visitDateStr;
                }

                if (vnNum !== null && !isNaN(vnNum)) {
                    regWhere[Op.or] = [
                        { patvisitid: vnNum },
                        { queueno: vnNum },
                        { locationqueueno: vnNum },
                    ];
                }

                const reg = await db.PatReg.findOne({
                    where: regWhere,
                    order: [["id", "DESC"]],
                });

                if (reg) {
                    if (reg.visitdate) {
                        visitDateStr = String(reg.visitdate).split("T")[0];
                    }
                    if (reg.locationid) {
                        const loc = await db.Location.findByPk(reg.locationid);
                        if (loc?.detailtext) {
                            assignClinicName = loc.detailtext;
                        }
                    }
                }

                // 2. ค้นหาคิว 4 ส่วนจาก queue_kioskq ก่อน
                if (reg?.id) {
                    const existingQ = await KioskQueueService.getExistingQueue(reg.id);
                    if (existingQ) {
                        queueNoStr = existingQ;
                    }
                }

                if (!queueNoStr) {
                    const qRecord = await db.QueueKioskq.findOne({
                        where: { hn: targetHN, visitdate: visitDateStr },
                        order: [["patregid", "DESC"]],
                    });
                    if (qRecord?.squeue) {
                        queueNoStr = qRecord.squeue.trim();
                    }
                }

                // 3. ถ้ายังไม่มี ให้ค้นหาคิวจากใบนัด (pat_appoint / pat_appointcheckcov)
                const appoint = await db.PatAppoint.findOne({
                    where: {
                        hn: targetHN,
                        appointdate: visitDateStr,
                        flag_status: { [Op.ne]: "C" },
                    },
                    order: [["id", "DESC"]],
                });

                if (appoint) {
                    const covAppoint = await db.PatAppointCheckCov.findOne({
                        where: { appointid: appoint.id },
                        order: [["id", "DESC"]],
                    });

                    if (!queueNoStr && covAppoint?.qseq) {
                        queueNoStr = String(covAppoint.qseq).padStart(3, "0");
                    }

                    if (!assignClinicName) {
                        const locId = appoint.appointtolocationid || covAppoint?.appointtolocation;
                        if (locId) {
                            const loc = await db.Location.findByPk(locId);
                            if (loc?.detailtext) {
                                assignClinicName = loc.detailtext;
                            }
                        }
                    }
                }
            }
        } catch (err: any) {
            console.warn("Notice: Warning in PrintVNLabelOrSlipKiosk DB operations:", err?.message);
        }

        const isPrintable = !!(queueNoStr || assignClinicName);

        return {
            status: isPrintable ? 0 : 1,
            DataRes: {
                Message: isPrintable ? "" : "Visit or queue record not found for the specified patient",
                InternalMessage: isPrintable ? "" : "No active registration or queue found",
                QueueNo: queueNoStr,
                AssignClinicName: assignClinicName,
                PrintStatus: isPrintable,
            },
            ErrorMessage: isPrintable ? "" : "Visit or queue record not found for the specified patient",
        };
    }
}
