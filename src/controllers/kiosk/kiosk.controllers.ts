import { Request, Response } from "express";
import { KioskAddressService } from "../../services/kiosk/kiosk.address.service";
import { KioskSlipService } from "../../services/kiosk/kiosk.slip.service";
import { KioskVNService } from "../../services/kiosk/kiosk.vn.service";

export class KioskController {
    static async getPatAddress(req: Request, res: Response) {
        try {
            const { HN, hn } = req.body as { HN?: string; hn?: string; PathFileResult?: string };
            const patientHN = HN || hn;

            if (!patientHN) {
                return res.status(400).json({
                    status: 1,
                    DataRes: null,
                    ErrorMessage: "HN is required",
                });
            }

            const result = await KioskAddressService.getPatAddress(patientHN);
            return res.status(200).json(result);
        } catch (error: any) {
            console.error("getPatAddress error:", error);
            return res.status(500).json({
                status: 1,
                DataRes: null,
                ErrorMessage: error?.message || "Internal server error",
            });
        }
    }

    static async changePhoneNumber(req: Request, res: Response) {
        try {
            const { HN, OldTelephone, NewTelephone } = req.body as {
                HN?: string;
                OldTelephone?: string;
                NewTelephone?: string;
            };

            // 1. Validation (ตรวจสอบเบื้องต้น)
            if (!HN || !OldTelephone || !NewTelephone) {
                return res.status(400).json({
                    status: 1,
                    DataRes: null,
                    ErrorMessage: "Please provide HN, old telephone, and new telephone completely",
                });
            }

            // 2 & 3. ตรวจสอบข้อมูลในระบบและอัปเดตเบอร์ใหม่
            const result = await KioskAddressService.Chagnphonnumber({
                HN,
                OldTelephone,
                NewTelephone,
            });

            if (result.status !== 0) {
                return res.status(400).json(result);
            }

            // 4. ส่ง Response สำเร็จ
            return res.status(200).json({
                status: 0,
                DataRes: {
                    Message: "",
                    ResultStatus: true,
                },
                ErrorMessage: "",
            });
        } catch (error: any) {
            console.error("changePhoneNumber error:", error);
            return res.status(500).json({
                status: -1,
                DataRes: {
                    Message: "",
                    ResultStatus: false,
                },
                ErrorMessage: error?.message || "Internal server error",
            });
        }
    }

    static async printNHSOLabelOrSlipKiosk(req: Request, res: Response) {
        try {
            const payload = req.body || {};
            const result = await KioskSlipService.printNHSOLabelOrSlipKiosk(payload);
            return res.status(200).json(result);
        } catch (error: any) {
            console.error("printNHSOLabelOrSlipKiosk error:", error);
            return res.status(500).json({
                status: -1,
                DataRes: {
                    Message: "",
                    PrintStatus: false,
                },
                ErrorMessage: error?.message || "Internal server error",
            });
        }
    }

    static async printVNLabelOrSlipKiosk(req: Request, res: Response) {
        try {
            const payload = req.body || {};
            const result = await KioskSlipService.printVNLabelOrSlipKiosk(payload);
            return res.status(200).json(result);
        } catch (error: any) {
            console.error("printVNLabelOrSlipKiosk error:", error);
            return res.status(500).json({
                status: -1,
                DataRes: {
                    Message: "",
                    InternalMessage: "",
                    QueueNo: "",
                    AssignClinicName: "",
                    PrintStatus: false,
                },
                ErrorMessage: error?.message || "Internal server error",
            });
        }
    }

    static async mobileUpdateOPDHeader(req: Request, res: Response) {
        try {
            const payload = req.body || {};
            const result = await KioskVNService.mobileUpdateOPDHeader(payload);
            return res.status(200).json(result);
        } catch (error: any) {
            console.error("mobileUpdateOPDHeader error:", error);
            return res.status(500).json({
                status: -1,
                DataRes: null,
                ErrorMessage: error?.message || "Internal server error",
            });
        }
    }

    static async genVnAppmnt(req: Request, res: Response) {
        try {
            const payload = req.body || {};
            const result = await KioskVNService.genVNAppointment(payload);
            return res.status(200).json(result);
        } catch (error: any) {
            console.error("genVnAppmnt error:", error);
            return res.status(500).json({
                status: -1,
                DataRes: null,
                ErrorMessage: error?.message || "Internal server error",
            });
        }
    }
}
