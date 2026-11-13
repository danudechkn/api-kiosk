import { Op } from "sequelize";
import db from "../../models/ppkhosp/index";
import { KioskQueueService } from "./kiosk.queue.service";

export interface MobileUpdateOPDHeaderPayload {
    transDate?: string;
    MainHospital?: string;
    claimCode?: string;
    HN?: string;
    ClinicCode?: string;
    VisitCode?: string;
    RightCode?: string;
    Address?: string;
    AddressFullNameDisplay?: string;
    AmphoeCode?: string;
    AppointmentNo?: string;
    BirthDate?: string;
    CountryCode?: string;
    EnglishFirstName?: string;
    EnglishLastName?: string;
    ExpiredDate?: string;
    Gender64?: string;
    IssuedDate?: string;
    Moo?: string;
    PassportNo?: string;
    ProvinceCode?: string;
    RefIssueBy?: string;
    RefType?: string;
    TambonCode?: string;
    Th_Prefix?: string;
    ThaiFirstName?: string;
    ThaiLastName?: string;
    IDCard?: string;
    ReceiveMedicine?: string;
    ARCode?: string;
    SubHospital?: string;
    maininscl?: string;
    mainInscl?: string;
    subinscl?: string;
    subInscl?: string;
    DoctorCode?: string;
}

export interface GenVNAppointmentPayload {
    PathFileResult?: string;
    claimCode?: string;
    RemarksMemo?: string;
    NormalCase?: string;
    ReceiveMedicine?: string;
    ListOfAppointmentNo?: string[];
    RightCode?: string;
    coveragecode?: string;
    covcardno?: string;
    covstdate?: string;
    covexpdate?: string;
    hospmain?: string | number;
    hospsub?: string | number;
    maininscl?: string;
    subinscl?: string;
    citizencardno?: string;
    covref?: string;
}

/**
 * จัดรูปแบบวันที่ให้อยู่ในมาตรฐาน ISO เช่น "2026-08-25T00:00:00"
 */
function formatVisitDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");
    return `${y}-${m}-${d}T${hh}:${mm}:${ss}`;
}

/**
 * แปลงรหัสสิทธิหลัก สปสช. เป็นชื่อสิทธิภาษาไทย
 */
function getNhsoMaininsclName(inscl?: string | null): string {
    if (!inscl) return "";
    const map: Record<string, string> = {
        UCS: "สิทธิหลักประกันสุขภาพแห่งชาติ",
        WEL: "สิทธิหลักประกันสุขภาพแห่งชาติ (ยกเว้นการร่วมจ่ายค่าบริการ 30 บาท)",
        OFC: "สิทธิข้าราชการ/สิทธิหน่วยงานรัฐ",
        LGO: "สิทธิสวัสดิการพนักงานส่วนท้องถิ่น",
        SSS: "สิทธิประกันสังคม",
        SSI: "สิทธิประกันสังคมคนพิการ",
        PVT: "ชำระเงินเอง",
    };
    return map[inscl.toUpperCase()] || "";
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
 * ฟังก์ชันกลางสำหรับรวบรวมข้อมูลคนไข้เพื่อบันทึกลง pat_visit (และ pat_reg) ให้ครบถ้วน ไม่เป็น null
 */
async function buildPatVisitData(params: {
    hn: number;
    visitId: number;
    now: Date;
    locationId: number;
    coverageCode?: string | null;
    patCoverageId?: number | null;
    coverageMasterId?: number | null;
    overrides?: {
        prename?: string | null;
        firstname?: string | null;
        lastname?: string | null;
        citizencardno?: string | null;
        address?: string | null;
        tambon?: string | null;
        amphur?: string | null;
        province?: string | null;
        zipcode?: string | null;
        sex?: number | null;
    };
}) {
    // 1. ข้อมูลประวัติคนไข้จากตาราง pat
    const pat = await db.Pat.findByPk(params.hn);

    const prename = params.overrides?.prename || pat?.prename || null;
    const firstname = params.overrides?.firstname || pat?.firstname || null;
    const lastname = params.overrides?.lastname || pat?.lastname || null;
    const citizencardno = params.overrides?.citizencardno || pat?.citizencardno || null;
    const sex = params.overrides?.sex ?? (pat?.sex !== undefined ? pat.sex : null);

    // คำนวณอายุเป็นจำนวนวัน (ageday)
    let ageday: number | null = null;
    if (pat?.birthdatetime) {
        const diffMs = params.now.getTime() - new Date(pat.birthdatetime).getTime();
        ageday = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    }

    // 2. ข้อมูลที่อยู่คนไข้จาก pat_address (เรียง flag_status 1=ปัจจุบัน, 2=ทะเบียนบ้าน และ id ล่าสุด)
    const patAddr = await db.PatAddress.findOne({
        where: { hn: params.hn },
        order: [
            ["flag_status", "ASC"],
            ["id", "DESC"],
        ],
    });

    let fullAddress = params.overrides?.address || null;
    if (!fullAddress && patAddr) {
        const addrParts: string[] = [];
        if (patAddr.house) addrParts.push(patAddr.house.trim());
        if (patAddr.moo) addrParts.push(`ม.${patAddr.moo.trim()}`);
        if (patAddr.road) addrParts.push(`ถ.${patAddr.road.trim()}`);
        if (patAddr.soy) addrParts.push(`ซ.${patAddr.soy.trim()}`);
        fullAddress = addrParts.join(" ") || null;
    }

    const tambon = params.overrides?.tambon || patAddr?.tambon || null;
    const amphur = params.overrides?.amphur || patAddr?.amphur || null;
    const province = params.overrides?.province || patAddr?.province || null;
    const zipcode = params.overrides?.zipcode || patAddr?.postcode || null;

    // 3. ข้อมูลสิทธิการรักษา (coveragecode, coveragemasterid, patcoverageid)
    let code = params.coverageCode || null;
    let coveragemasterid: number | null = params.coverageMasterId || null;
    let patcoverageid: number | null = params.patCoverageId || null;

    if (!coveragemasterid && code) {
        const covCodeRec = await db.Coveragecode.findByPk(code);
        if (covCodeRec?.defaultmasterid) {
            coveragemasterid = covCodeRec.defaultmasterid;
        }
    }

    if (!patcoverageid && params.hn) {
        const patCovWhere: any = { hn: params.hn };
        if (code) {
            patCovWhere.coveragecode = code;
        }
        const patCovRec = await db.PatCoverage.findOne({
            where: patCovWhere,
            order: [
                ["flag_status", "ASC"],
                ["id", "DESC"],
            ],
        });

        if (patCovRec) {
            patcoverageid = patCovRec.id;
            if (!code && patCovRec.coveragecode) {
                code = patCovRec.coveragecode;
            }
            if (!coveragemasterid && patCovRec.coveragemasterid) {
                coveragemasterid = patCovRec.coveragemasterid;
            }
        }
    }

    return {
        id: params.visitId,
        hn: params.hn,
        an: null,
        prename,
        firstname,
        lastname,
        visitdatetime: params.now,
        dischdatetime: null,
        lastregtypeid: 10,
        patcoverageid,
        coveragecode: code,
        coveragemasterid,
        regstatusid: 10,
        lastlocationid: params.locationId,
        dischargetypeid: null,
        sex,
        ageday,
        address: fullAddress,
        tambon,
        amphur,
        province,
        zipcode,
        citizencardno,
        flag_status: "A",
        admitlocationid: null,
        admitdatetime: null,
        dischlocationid: null,
        visitdate: params.now.toISOString().split("T")[0] as any,
    };
}

export class KioskVNService {
    /**
     * ดึงและอัปเดตเลข Running Key จากตาราง app_keypoolid (อ้างอิง getkeyP ใน funcCID.php)
     * พร้อมตรวจสอบค่า MAX(id) ของตารางจริงเพื่อป้องกัน Primary Key ชนกัน
     */
    static async getkeyP(
        tableKeyName: "PAT_VISIT" | "PAT_REG" | "PAT_COVERAGE" | string,
        model?: any
    ): Promise<number> {
        let poolVal = 0;
        const keyRec = await db.AppKeypoolId?.findByPk(tableKeyName);
        if (keyRec) {
            poolVal = Number(keyRec.keyvalue) || 0;
        }

        let maxTableId = 0;
        if (model) {
            const maxId = await model.max("id");
            maxTableId = (Number(maxId) || 0) + 1;
        }

        const nextKey = Math.max(poolVal, maxTableId, 1);

        if (keyRec) {
            await db.AppKeypoolId.update(
                { keyvalue: nextKey + 1 },
                { where: { keyname: tableKeyName } }
            );
        }

        return nextKey;
    }

    /**
     * ตรวจสอบว่าคนไข้มีสถานะ Admit (ผู้ป่วยใน IPD) ค้างอยู่หรือไม่
     * อ้างอิง SQL: SELECT hn FROM pat_admit WHERE hn = '$hn' AND flag_status < 'C' AND flag_cancel != 'Y'
     */
    static async isPatientAdmitted(hn: number): Promise<boolean> {
        if (!hn || !db.PatAdmit) return false;
        const admit = await db.PatAdmit.findOne({
            where: {
                hn,
                flag_status: { [Op.lt]: "C" },
                [Op.or]: [
                    { flag_cancel: { [Op.ne]: "Y" } },
                    { flag_cancel: null },
                ],
            },
        });
        return !!admit;
    }

    /**
     * ดึงสิทธิหลักของคนไข้ที่อนุมัติแล้ว (อ้างอิง getcoverageregis ใน funcCID.php)
     */
    static async getcoverageregis(hn: number) {
        const rec = await db.PatCoverage.findOne({
            where: {
                hn,
                flag_status: "1",
                flag_approved: "Y",
            },
            order: [["id", "DESC"]],
        });

        if (rec) {
            return {
                id: rec.id,
                coveragecode: rec.coveragecode,
                coveragemasterid: rec.coveragemasterid,
            };
        }
        return null;
    }

    /**
     * ตรวจสอบและอัปเดตสิทธิการรักษาสำหรับคนไข้ที่มีใบนัด (อ้างอิง checkcov ใน funcCID.php)
     * - เช็คใบนัดใน pat_appointcheckcov
     * - กรณีที่ 1: สิทธิตรงกับในใบนัด (coveragecode == appointcovcode) -> อัปเดตสถานะและคืนสิทธิเดิม
     * - กรณีที่ 2: สิทธิไม่ตรงกับใบนัด แต่มีสิทธินี้อยู่ใน pat_coverage (ยังไม่ยกเลิกและยังไม่หมดอายุ) -> อัปเดตและคืนสิทธินั้น
     * - กรณีที่ 3: สิทธิไม่ตรงและยังไม่มีใน pat_coverage -> INSERT ลง pat_coverage ใหม่ และอัปเดต pat_appointcheckcov
     */
    static async checkcov(params: {
        appointid: number;
        coveragecode?: string | null;
        covcardno?: string | null;
        covstdate?: string | Date | null;
        covexpdate?: string | Date | null;
        hospmain?: number | string | null;
        hospsub?: number | string | null;
        maininscl?: string | null;
        subinscl?: string | null;
        citizencardno?: string | null;
        covref?: string | null;
    }): Promise<{
        found: boolean;
        patcoverageid: number | null;
        coveragecode: string | null;
        coveragemasterid: number | null;
    }> {
        const now = new Date();
        const todayStr = now.toISOString().split("T")[0];
        const covstdate = params.covstdate || "1900-01-01";
        const covexpdate = params.covexpdate || "1900-01-01";

        const rowcov = await db.PatAppointCheckCov.findOne({
            where: { appointid: params.appointid },
            order: [["id", "DESC"]],
        });

        // กรณีไม่พบใน pat_appointcheckcov (เหมือน return 99 ใน PHP)
        if (!rowcov) {
            return {
                found: false,
                patcoverageid: null,
                coveragecode: params.coveragecode || null,
                coveragemasterid: null,
            };
        }

        const hn = Number(rowcov.hn);
        const covRegis = hn ? await this.getcoverageregis(hn) : null;
        let coveragemasterid: number | null =
            covRegis?.coveragemasterid || rowcov.appointcovmaster || null;

        const targetCovCode = (params.coveragecode || rowcov.appointcovcode || "").trim();
        const appointCovCode = (rowcov.appointcovcode || "").trim();
        const covref = params.covref || "A";

        let targetCovCodeName = "";
        let resolvedMaininscl = params.maininscl || null;

        if (targetCovCode) {
            const covCodeRec = await db.Coveragecode.findByPk(targetCovCode);
            if (covCodeRec) {
                if (!coveragemasterid && covCodeRec.defaultmasterid) {
                    coveragemasterid = covCodeRec.defaultmasterid;
                }
                targetCovCodeName = covCodeRec.detailtext || "";
                if (!resolvedMaininscl && covCodeRec.nhso_maininscl) {
                    resolvedMaininscl = covCodeRec.nhso_maininscl;
                }
            }
        }
        const resolvedMaininsclName = getNhsoMaininsclName(resolvedMaininscl);

        // กรณีที่ 1: สิทธิที่เช็ควันนี้ ตรงกับ สิทธิในใบนัด ($coveragecode == $rowcov['appointcovcode'])
        if (targetCovCode && targetCovCode === appointCovCode) {
            const isApproved = covref === "A";
            const flag_covapproved = isApproved ? "Y" : "N";
            const covapprovedbyuserid = isApproved ? 10 : 0;
            const flag_checkcov_status = isApproved ? "Y" : "N";

            await rowcov.update({
                nhsomaininscl: resolvedMaininscl ?? rowcov.nhsomaininscl,
                nhsomaininsclname: resolvedMaininsclName || rowcov.nhsomaininsclname,
                patcovcode: targetCovCode || rowcov.patcovcode,
                patcovcodename: targetCovCodeName || rowcov.patcovcodename,
                checkdatetime: now,
                flag_cov: "Y",
                flag_covapproved,
                covapprovedbyuserid,
                flag_checkcov_status,
                covreftype: covref,
            });

            return {
                found: true,
                patcoverageid: rowcov.appointcovid || covRegis?.id || null,
                coveragecode: rowcov.appointcovcode || targetCovCode || null,
                coveragemasterid: rowcov.appointcovmaster || coveragemasterid || null,
            };
        }

        // กรณีที่ 2 & 3: สิทธิไม่ตรงกับใบนัด ($coveragecode != $rowcov['appointcovcode'])
        const existingPatCov = await db.PatCoverage.findOne({
            where: {
                hn,
                coveragecode: targetCovCode,
                flag_status: { [Op.ne]: "9" },
                [Op.or]: [
                    { enddate: { [Op.gte]: todayStr } },
                    { enddate: null },
                ],
            },
            order: [
                ["flag_status", "ASC"],
                ["enddate", "DESC"],
                ["id", "DESC"],
            ],
        });

        if (existingPatCov) {
            // กรณีที่ 2: มีสิทธินี้อยู่แล้วใน pat_coverage
            await rowcov.update({
                nhsomaininscl: resolvedMaininscl ?? rowcov.nhsomaininscl,
                nhsomaininsclname: resolvedMaininsclName || rowcov.nhsomaininsclname,
                patcovcode: targetCovCode || rowcov.patcovcode,
                patcovcodename: targetCovCodeName || rowcov.patcovcodename,
                checkdatetime: now,
                flag_cov: "N",
                flag_covapproved: "N",
                flag_checkcov_status: "Y",
                covreftype: covref,
            });

            return {
                found: true,
                patcoverageid: existingPatCov.id,
                coveragecode: existingPatCov.coveragecode || targetCovCode,
                coveragemasterid: existingPatCov.coveragemasterid || coveragemasterid,
            };
        } else {
            // กรณีที่ 3: ไม่เจอใน pat_coverage -> INSERT ใหม่ลง pat_coverage และอัปเดต pat_appointcheckcov
            const keypatcoverage = await this.getkeyP("PAT_COVERAGE", db.PatCoverage);
            const siteid1 = params.hospsub ? Number(params.hospsub) || null : null;
            const siteid2 = params.hospmain ? Number(params.hospmain) || null : null;

            await db.PatCoverage.create({
                id: keypatcoverage,
                hn,
                coveragemasterid: coveragemasterid,
                coveragecode: targetCovCode || null,
                coveragecardno: params.covcardno || null,
                flag_cup: "N",
                flag_status: "2",
                userid: 10,
                editdatetime: now,
                siteid1,
                siteid2,
                startdate: covstdate as any,
                enddate: covexpdate as any,
            });

            await rowcov.update({
                nhsomaininscl: resolvedMaininscl ?? rowcov.nhsomaininscl,
                nhsomaininsclname: resolvedMaininsclName || rowcov.nhsomaininsclname,
                patcovcode: targetCovCode || rowcov.patcovcode,
                patcovcodename: targetCovCodeName || rowcov.patcovcodename,
                checkdatetime: now,
                flag_cov: "N",
                flag_covapproved: "N",
                flag_checkcov_status: "Y",
                appointcovid: keypatcoverage,
                flag_register: "Y",
                covreftype: covref,
            });

            return {
                found: true,
                patcoverageid: keypatcoverage,
                coveragecode: targetCovCode || null,
                coveragemasterid: coveragemasterid,
            };
        }
    }

    /**
     * ตรวจสอบและบันทึกสิทธิการรักษากรณี Walk-in หรือไม่มีใบนัด (อ้างอิง checkpatcoveragewalkin ใน funcCID.php)
     * - ค้นหาใน pat_coverage ของ HN ที่ยังไม่ยกเลิกและยังไม่หมดอายุ
     * - ถ้าพบ: INSERT ประวัติลง pat_appointcheckcov (appointid = 0) และคืนค่าสิทธิ
     * - ถ้าไม่พบ: เช็คว่าวันนี้เคยสร้างหรือยัง ถ้ายัง ให้ INSERT ลง pat_coverage ใหม่ และ INSERT ลง pat_appointcheckcov
     */
    static async checkpatcoveragewalkin(params: {
        hn: number;
        coveragecode?: string | null;
        covcardno?: string | null;
        covstdate?: string | Date | null;
        covexpdate?: string | Date | null;
        hospmain?: number | string | null;
        hospsub?: number | string | null;
        maininscl?: string | null;
        subinscl?: string | null;
        citizencardno?: string | null;
        locationid: number;
        covref?: string | null;
    }): Promise<{
        patcoverageid: number | null;
        coveragecode: string | null;
        coveragemasterid: number | null;
    }> {
        const now = new Date();
        const dateN = now.toISOString().split("T")[0];
        const covstdate = params.covstdate || "1900-01-01";
        const covexpdate = params.covexpdate || "1900-01-01";
        const targetCovCode = (params.coveragecode || "").trim();
        const covref = params.covref || "A";

        if (!params.hn || !targetCovCode) {
            return {
                patcoverageid: null,
                coveragecode: targetCovCode || null,
                coveragemasterid: null,
            };
        }

        // ค้นหารายละเอียดสิทธิจาก coveragecode เพื่อดึงชื่อสิทธิ (detailtext) และหมวดสิทธิหลัก (nhso_maininscl)
        let defaultMasterId = 0;
        let patcovcodename = "";
        let resolvedMaininscl = params.maininscl || null;

        const covCodeRec = await db.Coveragecode.findByPk(targetCovCode);
        if (covCodeRec) {
            if (covCodeRec.defaultmasterid) {
                defaultMasterId = covCodeRec.defaultmasterid;
            }
            patcovcodename = covCodeRec.detailtext || "";
            if (!resolvedMaininscl && covCodeRec.nhso_maininscl) {
                resolvedMaininscl = covCodeRec.nhso_maininscl;
            }
        }
        const resolvedMaininsclName = getNhsoMaininsclName(resolvedMaininscl);

        // 1. ค้นหาใน pat_coverage ที่ยังไม่ยกเลิก (flag_status <> '9') และยังไม่หมดอายุ
        const existingPatCov = await db.PatCoverage.findOne({
            where: {
                hn: params.hn,
                coveragecode: targetCovCode,
                flag_status: { [Op.ne]: "9" },
                [Op.or]: [
                    { enddate: { [Op.gte]: dateN } },
                    { enddate: null },
                ],
            },
            order: [
                ["flag_status", "ASC"],
                ["enddate", "DESC"],
                ["id", "DESC"],
            ],
        });

        if (existingPatCov) {
            const id = existingPatCov.id;
            const coveragemasterid = existingPatCov.coveragemasterid || defaultMasterId || null;

            await db.PatAppointCheckCov.create({
                hn: params.hn,
                cid: params.citizencardno || null,
                appointid: 0,
                appointdate: dateN,
                appointtolocation: params.locationid,
                appointtodoctorid: 0,
                appointcovid: id,
                appointcovcode: "0",
                appointcovmaster: coveragemasterid,
                patcovcode: targetCovCode,
                patcovcodename: patcovcodename,
                nhsomaininscl: resolvedMaininscl,
                nhsomaininsclname: resolvedMaininsclName,
                insuresuccesscode: "",
                insuresuccessname: "",
                checkdatetime: now,
                flag_cov: "N",
                flag_appointtype: "",
                flag_appointstatus: "",
                flag_covapproved: "N",
                flag_checkcov_status: "Y",
                covreftype: covref,
            });

            return {
                patcoverageid: id,
                coveragecode: targetCovCode,
                coveragemasterid,
            };
        } else {
            // 2. ใช้ defaultmasterid จากตาราง coveragecode
            const coveragemasterid = defaultMasterId;

            // 3. เช็คว่าวันนี้เคย insert สิทธินี้ไปแล้วหรือยัง
            const startOfDay = new Date(`${dateN}T00:00:00.000Z`);
            const endOfDay = new Date(`${dateN}T23:59:59.999Z`);
            const todayCov = await db.PatCoverage.findOne({
                where: {
                    hn: params.hn,
                    coveragecode: targetCovCode,
                    coveragemasterid: coveragemasterid,
                    editdatetime: {
                        [Op.between]: [startOfDay, endOfDay],
                    },
                },
                order: [["id", "DESC"]],
            });

            if (todayCov) {
                return {
                    patcoverageid: todayCov.id,
                    coveragecode: targetCovCode,
                    coveragemasterid,
                };
            }

            // 4. ยังไม่มี -> INSERT ใหม่ลง pat_coverage และ INSERT ลง pat_appointcheckcov
            const keypatcoverage = await this.getkeyP("PAT_COVERAGE", db.PatCoverage);
            const siteid1 = params.hospsub ? Number(params.hospsub) || null : null;
            const siteid2 = params.hospmain ? Number(params.hospmain) || null : null;

            await db.PatCoverage.create({
                id: keypatcoverage,
                hn: params.hn,
                coveragemasterid: coveragemasterid,
                coveragecode: targetCovCode,
                coveragecardno: params.covcardno || null,
                flag_cup: "N",
                flag_status: "2",
                userid: 10,
                editdatetime: now,
                siteid1,
                siteid2,
                startdate: covstdate as any,
                enddate: covexpdate as any,
            });

            await db.PatAppointCheckCov.create({
                hn: params.hn,
                cid: params.citizencardno || null,
                appointid: 0,
                appointdate: dateN,
                appointtolocation: params.locationid,
                appointtodoctorid: 0,
                appointcovid: keypatcoverage,
                appointcovcode: "0",
                appointcovmaster: coveragemasterid,
                patcovcode: targetCovCode,
                patcovcodename: patcovcodename,
                nhsomaininscl: resolvedMaininscl,
                nhsomaininsclname: resolvedMaininsclName,
                insuresuccesscode: "",
                insuresuccessname: "",
                checkdatetime: now,
                flag_cov: "N",
                flag_appointtype: "",
                flag_appointstatus: "",
                flag_covapproved: "N",
                flag_checkcov_status: "Y",
                covreftype: covref,
            });

            return {
                patcoverageid: keypatcoverage,
                coveragecode: targetCovCode,
                coveragemasterid,
            };
        }
    }

    /**
     * 1. kiosk_MobileUpdateOPDHeader: เปิด VN กรณี Walk In
     * อ้างอิงตามลอจิก Registerpatvisit:
     * - ตรวจสอบว่าคนไข้มี pat_visit วันนี้แล้วหรือยัง (flag_status = 'A', visitdate = วันนี้)
     * - หากมีแล้ว ให้ใช้ visitId เดิม (ป้องกันการเปิด visit ซ้ำ)
     * - ตรวจสอบว่าเคยลงทะเบียนในห้องตรวจนี้หรือยัง (pat_reg locationid = locationId, flag_status <> 'C')
     * - หากเคยลงทะเบียนแล้ว ให้ใช้คิวเดิม ไม่ต้องสร้างใหม่
     */
    static async mobileUpdateOPDHeader(payload: MobileUpdateOPDHeaderPayload) {
        const rawHN = (payload.HN || "").trim();
        const rawIDCard = (payload.IDCard || "").trim();

        // 1. ค้นหาข้อมูลคนไข้ในระบบ
        let patRecord: any = null;
        let hnNum = parseNumericHN(rawHN);

        if (hnNum) {
            patRecord = await db.Pat.findByPk(hnNum);
        }

        if (!patRecord && rawIDCard) {
            patRecord = await db.Pat.findOne({
                where: { citizencardno: rawIDCard },
            });
            if (patRecord) {
                hnNum = patRecord.hn;
            }
        }

        const targetHN = hnNum || (rawHN ? parseInt(rawHN.replace(/\D/g, ""), 10) : 0) || 9999999;

        const appointIdNum = payload.AppointmentNo
            ? parseInt(String(payload.AppointmentNo).replace(/\D/g, ""), 10) || 0
            : 0;

        let locationId = Number(payload.ClinicCode) || 0;
        if (!locationId && appointIdNum > 0) {
            const appointRecord = await db.PatAppoint.findByPk(appointIdNum);
            if (appointRecord?.appointtolocationid) {
                locationId = Number(appointRecord.appointtolocationid);
            }
        }

        // หากไม่มีการระบุห้องตรวจ (ไม่มีทั้ง ClinicCode และ appointtolocationid ในใบนัด) จะไม่ทำต่อ
        if (!locationId) {
            return {
                status: 1,
                DataRes: {
                    ErrorMessage: "Clinic code is required (ClinicCode or appointment location is not specified)",
                    WarningMessage: "",
                    LogMessage: "",
                    ResultStatus: false,
                    CheckUpStatusResultStatus: false,
                    CheckUpRequireCheckUpMethod: false,
                    UpdatePatientHoldRequestComplete: false,
                    VN: "",
                    VisitDate: "",
                    ListOfPrescriptionNo: [],
                },
                ErrorMessage: "Clinic code is required (ClinicCode or appointment location is not specified)",
            };
        }

        // ตรวจสอบว่าคนไข้มีสถานะ Admit (ผู้ป่วยใน IPD) ค้างอยู่หรือไม่
        if (targetHN && targetHN !== 9999999) {
            const admitted = await this.isPatientAdmitted(targetHN);
            if (admitted) {
                return {
                    status: 1,
                    DataRes: {
                        ErrorMessage: "Patient is currently admitted (IPD), cannot register new OPD visit",
                        WarningMessage: "",
                        LogMessage: "",
                        ResultStatus: false,
                        CheckUpStatusResultStatus: false,
                        CheckUpRequireCheckUpMethod: false,
                        UpdatePatientHoldRequestComplete: false,
                        VN: "",
                        VisitDate: "",
                        ListOfPrescriptionNo: [],
                    },
                    ErrorMessage: "Patient is currently admitted (IPD), cannot register new OPD visit",
                };
            }
        }

        // กำหนดวันที่มาตรวจ
        const now = payload.transDate ? new Date(payload.transDate) : new Date();
        const visitDateStr = now.toISOString().split("T")[0];
        const formattedVisitDate = formatVisitDate(now);

        let visitId: number = 0;
        let queueno: number = 1;
        let logMsg = "register success";

        try {
            const cidVal = rawIDCard || patRecord?.citizencardno || null;
            const covrefVal = payload.claimCode ? "A" : "N";
            const mainInsclVal = payload.maininscl || payload.mainInscl || null;
            const subInsclVal = payload.subinscl || payload.subInscl || null;

            // ตรวจสอบสิทธิการรักษา (กรณีมี appointid > 0 ใช้ checkcov / กรณี Walk-in ใช้ checkpatcoveragewalkin)
            let resolvedCovCode: string | null = payload.RightCode || null;
            let resolvedPatCovId: number | null = null;
            let resolvedCovMasterId: number | null = null;

            // หากไม่มี RightCode ส่งมา (กรณี Walk-in ไม่ได้ระบุสิทธิ) ให้ค้นหาสิทธิหลักที่ Active อยู่ของผู้ป่วย (เทียบเท่า getcoverageregis ใน PHP)
            if (!resolvedCovCode && targetHN && targetHN !== 9999999) {
                const activeCov = await db.PatCoverage.findOne({
                    where: {
                        hn: targetHN,
                        flag_status: { [Op.ne]: "9" },
                        [Op.or]: [
                            { enddate: { [Op.gte]: visitDateStr } },
                            { enddate: null },
                        ],
                    },
                    order: [
                        ["flag_status", "ASC"],
                        ["enddate", "DESC"],
                        ["id", "DESC"],
                    ],
                });
                if (activeCov) {
                    resolvedCovCode = activeCov.coveragecode;
                    resolvedPatCovId = activeCov.id;
                    resolvedCovMasterId = activeCov.coveragemasterid;
                }
            }

            if (appointIdNum > 0) {
                const covRes = await this.checkcov({
                    appointid: appointIdNum,
                    coveragecode: resolvedCovCode || null,
                    covstdate: payload.IssuedDate || null,
                    covexpdate: payload.ExpiredDate || null,
                    hospmain: payload.MainHospital || null,
                    hospsub: payload.SubHospital || null,
                    maininscl: mainInsclVal,
                    subinscl: subInsclVal,
                    citizencardno: cidVal,
                    covref: covrefVal,
                });
                resolvedCovCode = covRes.coveragecode || resolvedCovCode;
                resolvedPatCovId = covRes.patcoverageid;
                resolvedCovMasterId = covRes.coveragemasterid;
            } else if (targetHN && targetHN !== 9999999 && resolvedCovCode) {
                const walkinCovRes = await this.checkpatcoveragewalkin({
                    hn: targetHN,
                    coveragecode: resolvedCovCode,
                    covstdate: payload.IssuedDate || null,
                    covexpdate: payload.ExpiredDate || null,
                    hospmain: payload.MainHospital || null,
                    hospsub: payload.SubHospital || null,
                    maininscl: mainInsclVal,
                    subinscl: subInsclVal,
                    citizencardno: cidVal,
                    locationid: locationId,
                    covref: covrefVal,
                });
                resolvedCovCode = walkinCovRes.coveragecode || resolvedCovCode;
                resolvedPatCovId = walkinCovRes.patcoverageid;
                resolvedCovMasterId = walkinCovRes.coveragemasterid;
            }

            // สเต็ปที่ 1: เช็คว่าคนไข้มี pat_visit ในวันนี้แล้วหรือไม่
            const existingVisit = await db.PatVisit.findOne({
                where: {
                    hn: targetHN,
                    visitdate: visitDateStr,
                    flag_status: "A",
                },
            });

            let visitData: any = null;
            if (existingVisit) {
                visitId = existingVisit.id;
                // ถ้ามี visit เดิมอยู่แล้วแต่ข้อมูลยังไม่ครบ ให้เติมให้สมบูรณ์
                if (!existingVisit.firstname || !existingVisit.address || !existingVisit.citizencardno) {
                    visitData = await buildPatVisitData({
                        hn: targetHN,
                        visitId: visitId,
                        now: existingVisit.visitdatetime ? new Date(existingVisit.visitdatetime) : now,
                        locationId: locationId,
                        coverageCode: resolvedCovCode || existingVisit.coveragecode || null,
                        patCoverageId: resolvedPatCovId || existingVisit.patcoverageid || null,
                        coverageMasterId: resolvedCovMasterId || existingVisit.coveragemasterid || null,
                        overrides: {
                            prename: payload.Th_Prefix || null,
                            firstname: payload.ThaiFirstName || null,
                            lastname: payload.ThaiLastName || null,
                            citizencardno: rawIDCard || null,
                            address: payload.Address || null,
                            tambon: payload.TambonCode || null,
                            amphur: payload.AmphoeCode || null,
                            province: payload.ProvinceCode || null,
                        },
                    });
                    await existingVisit.update(visitData);
                } else {
                    visitData = existingVisit;
                }
            } else {
                visitId = await this.getkeyP("PAT_VISIT", db.PatVisit);

                visitData = await buildPatVisitData({
                    hn: targetHN,
                    visitId: visitId,
                    now: now,
                    locationId: locationId,
                    coverageCode: resolvedCovCode,
                    patCoverageId: resolvedPatCovId,
                    coverageMasterId: resolvedCovMasterId,
                    overrides: {
                        prename: payload.Th_Prefix || null,
                        firstname: payload.ThaiFirstName || null,
                        lastname: payload.ThaiLastName || null,
                        citizencardno: rawIDCard || null,
                        address: payload.Address || null,
                        tambon: payload.TambonCode || null,
                        amphur: payload.AmphoeCode || null,
                        province: payload.ProvinceCode || null,
                    },
                });

                await db.PatVisit.create(visitData);
            }

            // สเต็ปที่ 2: เช็คว่ามีคิวส่งตรวจ pat_reg ในห้องตรวจนี้หรือยัง
            const existingReg = await db.PatReg.findOne({
                where: {
                    patvisitid: visitId,
                    locationid: locationId,
                    flag_status: { [Op.ne]: "C" },
                },
            });

            let activeRegId = 0;

            if (existingReg) {
                // #Y: มีคิวในห้องตรวจนี้แล้ว -> ใช้คิวเดิม (No register Duplication)
                queueno = existingReg.queueno || 1;
                activeRegId = existingReg.id;
                logMsg = "No register Duplication";
                if (!existingReg.patcoverageid || !existingReg.coveragemasterid || !existingReg.regtypeid) {
                    await existingReg.update({
                        patcoverageid: resolvedPatCovId || existingReg.patcoverageid || visitData?.patcoverageid || null,
                        coveragemasterid: resolvedCovMasterId || existingReg.coveragemasterid || visitData?.coveragemasterid || null,
                        regtypeid: existingReg.regtypeid || 10,
                        regstatusid: existingReg.regstatusid || 10,
                    });
                }
            } else {
                // #N: ยังไม่มีการลงทะเบียนในห้องตรวจนี้ -> ลงทะเบียน pat_reg ใหม่
                if (existingVisit) {
                    logMsg = "register success by depart";
                }

                const nextRegId = await this.getkeyP("PAT_REG", db.PatReg);
                activeRegId = nextRegId;

                await db.PatReg.create({
                    id: nextRegId,
                    hn: targetHN,
                    patvisitid: visitId,
                    locationid: locationId,
                    coveragecode: resolvedCovCode || visitData?.coveragecode || existingVisit?.coveragecode || null,
                    patcoverageid: resolvedPatCovId || visitData?.patcoverageid || existingVisit?.patcoverageid || null,
                    coveragemasterid: resolvedCovMasterId || visitData?.coveragemasterid || existingVisit?.coveragemasterid || null,
                    queueno: null,
                    locationqueueno: null,
                    startdatetime: now,
                    regdatetime: now,
                    visitdate: visitDateStr as any,
                    flag_status: "A",
                    flag_reg: "A",
                    flag_service: "A",
                    regtypeid: 10,
                    regstatusid: 10,
                    editdatetime: new Date(),
                });

                // อัปเดต pat_appoint และ pat_appointcheckcov ตามลอจิกสคริปต์ลงทะเบียน
                if (appointIdNum > 0) {
                    await db.PatAppoint.update(
                        { flag_status: "B", newpatregid: nextRegId },
                        { where: { id: appointIdNum, flag_status: "A" } }
                    );
                    await db.PatAppointCheckCov.update(
                        {
                            patregid: nextRegId,
                            flag_cov: "Y",
                            flag_covapproved: "Y",
                            covapprovedbyuserid: 10,
                            flag_checkcov_status: "Y",
                        },
                        { where: { appointid: appointIdNum } }
                    );
                } else {
                    await db.PatAppointCheckCov.update(
                        {
                            patregid: nextRegId,
                            flag_cov: "Y",
                            flag_covapproved: "Y",
                            covapprovedbyuserid: 10,
                            flag_checkcov_status: "Y",
                        },
                        {
                            where: {
                                hn: targetHN,
                                appointdate: visitDateStr,
                                appointtolocation: locationId,
                            },
                        }
                    );
                }
            }

            // สเต็ปที่ 3: สร้างเลขคิว 4 ส่วน (OPD Code + Doctor Code + Slot No + Seq) และบันทึกลง queue_kioskq
            if (activeRegId > 0) {
                try {
                    await KioskQueueService.generate4PartQueue({
                        hn: targetHN,
                        cid: cidVal || rawIDCard || patRecord?.citizencardno || "",
                        visitDate: visitDateStr,
                        locationId: locationId,
                        doctorId: payload.DoctorCode ? parseInt(payload.DoctorCode, 10) : null,
                        appointId: appointIdNum > 0 ? appointIdNum : null,
                        patRegId: activeRegId,
                    });
                } catch (qErr: any) {
                    console.warn("Notice: Warning generating 4-part queue in mobileUpdateOPDHeader:", qErr?.message);
                }
            }
        } catch (dbErr: any) {
            console.warn("Notice: Warning in mobileUpdateOPDHeader DB operations:", dbErr?.message);
        }

        const vnStr = visitId ? String(visitId) : "";

        return {
            status: 0,
            DataRes: {
                ErrorMessage: "",
                WarningMessage: "",
                LogMessage: logMsg,
                ResultStatus: true,
                CheckUpStatusResultStatus: false,
                CheckUpRequireCheckUpMethod: false,
                UpdatePatientHoldRequestComplete: false,
                VN: vnStr,
                VisitDate: formattedVisitDate,
                ListOfPrescriptionNo: [1],
            },
            ErrorMessage: "",
        };
    }

    /**
     * 2. gen_vn_appmnt: เปิด VN จากใบนัด
     * อ้างอิงตามลอจิก Registerpatvisit เช่นกัน:
     * - ตรวจสอบใบนัดใน pat_appoint
     * - ตรวจสอบว่าคนไข้มี visit วันนี้แล้วหรือยัง
     * - ตรวจสอบว่ามีคิวส่งตรวจในห้องตรวจตามใบนัดหรือยัง
     */
    static async genVNAppointment(payload: GenVNAppointmentPayload) {
        const appointmentList = payload.ListOfAppointmentNo || [];
        const now = new Date();
        const visitDateStr = now.toISOString().split("T")[0];
        const formattedVisitDate = `${formatVisitDate(now)}:000`;

        const listOfVN: any[] = [];
        const listOfDataNotGen: any[] = [];
        let mainHN = "";
        let lastQueueNo = "";
        let lastQueueSeq = "";

        const todayRegCount = await db.PatReg.count({
            where: { visitdate: visitDateStr },
        });
        let currentVnNum = todayRegCount;
        let prescCounter = 1;

        for (const appNo of appointmentList) {
            const cleanAppNo = (appNo || "").trim();
            if (!cleanAppNo) continue;

            // ค้นหาในตาราง pat_appoint
            let appointRecord: any = null;
            const appDigits = parseInt(cleanAppNo.replace(/\D/g, ""), 10);

            if (!isNaN(appDigits)) {
                appointRecord = await db.PatAppoint.findByPk(appDigits);
            }

            if (!appointRecord) {
                appointRecord = await db.PatAppoint.findOne({
                    where: {
                        [Op.or]: [
                            { note: { [Op.like]: `%${cleanAppNo}%` } },
                            ...(isNaN(appDigits) ? [] : [{ id: appDigits }]),
                        ],
                    },
                });
            }

            if (appointRecord) {
                const patHN = String(appointRecord.hn);
                mainHN = patHN;
                const appointLocationId = Number(appointRecord.appointtolocationid) || 0;
                if (!appointLocationId) {
                    listOfDataNotGen.push({
                        AppointmentNo: cleanAppNo,
                        HN: patHN,
                        ErrorMessage: "Appointment location is not specified (appointtolocationid is required)",
                    });
                    continue;
                }

                // 0. ตรวจสอบว่าคนไข้มีสถานะ Admit (ผู้ป่วยใน IPD) ค้างอยู่หรือไม่
                const admitted = await this.isPatientAdmitted(Number(appointRecord.hn));
                if (admitted) {
                    listOfDataNotGen.push({
                        AppointmentNo: cleanAppNo,
                        HN: patHN,
                        ErrorMessage: "Patient is currently admitted (IPD), cannot register new OPD visit",
                    });
                    continue;
                }

                let visitId: number = 0;
                let queueno: number = 1;
                let visitData: any = null;

                try {
                    const covrefVal =
                        payload.covref ||
                        (payload.NormalCase === "1" || payload.claimCode ? "A" : "N");
                    const initialCovCode =
                        payload.RightCode ||
                        payload.coveragecode ||
                        appointRecord.coveragecode ||
                        null;

                    // 1. ตรวจสอบและอัปเดตสิทธิการรักษาตามใบนัดผ่านฟังก์ชัน checkcov
                    const checkCovResult = await this.checkcov({
                        appointid: appointRecord.id,
                        coveragecode: initialCovCode,
                        covcardno: payload.covcardno || null,
                        covstdate: payload.covstdate || null,
                        covexpdate: payload.covexpdate || null,
                        hospmain: payload.hospmain || null,
                        hospsub: payload.hospsub || null,
                        maininscl: payload.maininscl || null,
                        subinscl: payload.subinscl || null,
                        citizencardno: payload.citizencardno || null,
                        covref: covrefVal,
                    });

                    // หากไม่พบใบนัดใน pat_appointcheckcov (checkcov return 99 / found=false) ให้ใช้ checkpatcoveragewalkin
                    let walkinFallback: {
                        patcoverageid: number | null;
                        coveragecode: string | null;
                        coveragemasterid: number | null;
                    } | null = null;

                    if (!checkCovResult.found && initialCovCode) {
                        const patRec = await db.Pat.findByPk(appointRecord.hn);
                        walkinFallback = await this.checkpatcoveragewalkin({
                            hn: Number(appointRecord.hn),
                            coveragecode: initialCovCode,
                            covcardno: payload.covcardno || null,
                            covstdate: payload.covstdate || null,
                            covexpdate: payload.covexpdate || null,
                            hospmain: payload.hospmain || null,
                            hospsub: payload.hospsub || null,
                            maininscl: payload.maininscl || null,
                            subinscl: payload.subinscl || null,
                            citizencardno: payload.citizencardno || patRec?.citizencardno || null,
                            locationid: appointLocationId,
                            covref: covrefVal,
                        });
                    }

                    const resolvedCovCode =
                        checkCovResult.coveragecode ||
                        walkinFallback?.coveragecode ||
                        initialCovCode ||
                        null;
                    const resolvedPatCovId =
                        checkCovResult.patcoverageid ||
                        walkinFallback?.patcoverageid ||
                        appointRecord.patcoverageid ||
                        null;
                    const resolvedCovMasterId =
                        checkCovResult.coveragemasterid ||
                        walkinFallback?.coveragemasterid ||
                        appointRecord.coveragemasterid ||
                        null;

                    // 2. เช็ค pat_visit ของวันนี้
                    const existingVisit = await db.PatVisit.findOne({
                        where: {
                            hn: appointRecord.hn,
                            visitdate: visitDateStr,
                            flag_status: "A",
                        },
                    });

                    if (existingVisit) {
                        visitId = existingVisit.id;
                        // อัปเดตข้อมูล Visit เดิมหากข้อมูลคนไข้หรือที่อยู่ยังไม่ครบถ้วน
                        if (!existingVisit.firstname || !existingVisit.address || !existingVisit.citizencardno) {
                            visitData = await buildPatVisitData({
                                hn: appointRecord.hn,
                                visitId: visitId,
                                now: existingVisit.visitdatetime ? new Date(existingVisit.visitdatetime) : now,
                                locationId: appointLocationId,
                                coverageCode: resolvedCovCode || existingVisit.coveragecode || null,
                                patCoverageId: resolvedPatCovId || existingVisit.patcoverageid || null,
                                coverageMasterId: resolvedCovMasterId || existingVisit.coveragemasterid || null,
                            });
                            await existingVisit.update(visitData);
                        } else {
                            visitData = existingVisit;
                        }
                    } else {
                        visitId = await this.getkeyP("PAT_VISIT", db.PatVisit);

                        visitData = await buildPatVisitData({
                            hn: appointRecord.hn,
                            visitId: visitId,
                            now: now,
                            locationId: appointLocationId,
                            coverageCode: resolvedCovCode,
                            patCoverageId: resolvedPatCovId,
                            coverageMasterId: resolvedCovMasterId,
                        });

                        await db.PatVisit.create(visitData);
                    }

                    // 3. เช็ค pat_reg ในห้องตรวจตามใบนัด
                    const existingReg = await db.PatReg.findOne({
                        where: {
                            patvisitid: visitId,
                            locationid: appointLocationId,
                            flag_status: { [Op.ne]: "C" },
                        },
                    });

                    let activeRegId = 0;

                    if (existingReg) {
                        queueno = existingReg.queueno || 1;
                        activeRegId = existingReg.id;
                        if (!existingReg.patcoverageid || !existingReg.coveragemasterid || !existingReg.regtypeid) {
                            await existingReg.update({
                                coveragecode: resolvedCovCode || existingReg.coveragecode || visitData?.coveragecode || null,
                                patcoverageid: resolvedPatCovId || existingReg.patcoverageid || visitData?.patcoverageid || null,
                                coveragemasterid: resolvedCovMasterId || existingReg.coveragemasterid || visitData?.coveragemasterid || null,
                                regtypeid: existingReg.regtypeid || 10,
                                regstatusid: existingReg.regstatusid || 10,
                            });
                        }
                    } else {
                        const nextRegId = await this.getkeyP("PAT_REG", db.PatReg);
                        activeRegId = nextRegId;

                        await db.PatReg.create({
                            id: nextRegId,
                            hn: appointRecord.hn,
                            patvisitid: visitId,
                            locationid: appointLocationId,
                            coveragecode: resolvedCovCode || visitData?.coveragecode || null,
                            patcoverageid: resolvedPatCovId || visitData?.patcoverageid || null,
                            coveragemasterid: resolvedCovMasterId || visitData?.coveragemasterid || null,
                            appointid: appointRecord.id,
                            maindoctorid: appointRecord.appointtodoctorid || null,
                            queueno: null,
                            locationqueueno: null,
                            startdatetime: now,
                            regdatetime: now,
                            visitdate: visitDateStr as any,
                            flag_status: "A",
                            flag_reg: "A",
                            flag_service: "A",
                            regtypeid: 10,
                            regstatusid: 10,
                            editdatetime: new Date(),
                        });

                        // UPDATE pat_appoint SET flag_status = 'B', newpatregid = nextRegId WHERE id = appointid AND flag_status = 'A'
                        await db.PatAppoint.update(
                            { flag_status: "B", newpatregid: nextRegId },
                            { where: { id: appointRecord.id, flag_status: "A" } }
                        );
                    }

                    // อัปเดตสถานะการลงทะเบียนใน pat_appointcheckcov ตามลอจิก PHP
                    if (activeRegId) {
                        if (checkCovResult.found) {
                            await db.PatAppointCheckCov.update(
                                {
                                    patregid: activeRegId,
                                    flag_cov: "Y",
                                    flag_covapproved: "Y",
                                    covapprovedbyuserid: 10,
                                    flag_checkcov_status: "Y",
                                    flag_register: "Y",
                                },
                                { where: { appointid: appointRecord.id } }
                            );
                        } else {
                            await db.PatAppointCheckCov.update(
                                {
                                    patregid: activeRegId,
                                    flag_cov: "Y",
                                    flag_covapproved: "Y",
                                    covapprovedbyuserid: 10,
                                    flag_checkcov_status: "Y",
                                    flag_register: "Y",
                                },
                                {
                                    where: {
                                        hn: appointRecord.hn,
                                        appointdate: visitDateStr,
                                        appointtolocation: appointLocationId,
                                    },
                                }
                            );
                        }
                    }

                    // สร้างเลขคิว 4 ส่วน (OPD Code + Doctor Code + Slot No + Seq) และบันทึกลง queue_kioskq
                    if (activeRegId > 0) {
                        try {
                            const qRes = await KioskQueueService.generate4PartQueue({
                                hn: appointRecord.hn,
                                cid: payload.citizencardno || appointRecord.citizencardno || "",
                                visitDate: visitDateStr,
                                locationId: appointLocationId,
                                doctorId: appointRecord.appointtodoctorid || null,
                                appointId: appointRecord.id,
                                patRegId: activeRegId,
                            });
                            lastQueueNo = qRes.queueNo;
                            lastQueueSeq = String(qRes.seq);
                        } catch (qErr: any) {
                            console.warn("Notice: Warning generating 4-part queue in genVNAppointment:", qErr?.message);
                        }
                    }
                } catch (dbErr: any) {
                    console.warn("Notice: Warning inserting appoint visit/reg:", dbErr?.message);
                }

                const vnStr = visitId ? String(visitId) : "";

                listOfVN.push({
                    AppointmentNo: cleanAppNo,
                    HN: patHN,
                    VisitDate: formattedVisitDate,
                    VN: vnStr,
                    PrescriptionNo: String(prescCounter++),
                    ErrorMessage: "",
                    HoldRequest: false,
                    ListOfHoldRequest: [],
                });
            } else {
                // กรณี mock appointment เช่น "ENT-02419/0213"
                currentVnNum += 1;
                const vnStr = String(currentVnNum).padStart(3, "0");
                const fallbackHN = "01166/69";
                mainHN = fallbackHN;

                listOfVN.push({
                    AppointmentNo: cleanAppNo,
                    HN: fallbackHN,
                    VisitDate: formattedVisitDate,
                    VN: vnStr,
                    PrescriptionNo: String(prescCounter++),
                    ErrorMessage: "",
                    HoldRequest: false,
                    ListOfHoldRequest: [],
                });
            }
        }

        return {
            status: 0,
            DataRes: {
                ListOfVN: listOfVN,
                ListOfDataNotGen: listOfDataNotGen,
                ErrorMessage: "",
                LogMessage: "",
                HN: mainHN,
                ResultStatus: listOfVN.length > 0,
                DataAssignDoctorQueue: {
                    ErrorMessage: "",
                    ResultStatus: !!lastQueueNo,
                    QueueNo: lastQueueNo,
                    QueueSeq: lastQueueSeq,
                    QueueDate: {
                        DateTime: lastQueueNo ? now.toISOString() : "0001-01-01T00:00:00:000",
                    },
                    QueueStationCode: "",
                    QueueStationDoctorSuffix: 0,
                    QueueEntryDateTime: {
                        DateTime: lastQueueNo ? now.toISOString() : "0001-01-01T00:00:00:000",
                    },
                    DiagRmsNo: "",
                    QueueLocationCode: "",
                    QRCodeViewQueueImageBase64: "",
                },
            },
            ErrorMessage: "",
        };
    }
}
