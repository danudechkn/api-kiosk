import express from "express";
import { KioskController } from "../controllers/kiosk/kiosk.controllers";

const router = express.Router();

// Routes สำหรับ ppkv1
router.post("/ppkv1/get_pat_address", KioskController.getPatAddress);
router.post("/ppkv1/kiosk_change_phone_number", KioskController.changePhoneNumber);
router.post("/ppkv1/kiosk_PrintNHSOLabelOrSlipKiosk", KioskController.printNHSOLabelOrSlipKiosk);
router.post("/ppkv1/kiosk_PrintVNLabelOrSlipKiosk", KioskController.printVNLabelOrSlipKiosk);
router.post("/ppkv1/kiosk_MobileUpdateOPDHeader", KioskController.mobileUpdateOPDHeader);
router.post("/ppkv1/mobileUpdateOPDHeader", KioskController.mobileUpdateOPDHeader);
router.post("/ppkv1/gen_vn_appmnt", KioskController.genVnAppmnt);

// Direct routes (without /ppkv1 prefix)
router.post("/get_pat_address", KioskController.getPatAddress);
router.post("/kiosk_change_phone_number", KioskController.changePhoneNumber);
router.post("/kiosk_PrintNHSOLabelOrSlipKiosk", KioskController.printNHSOLabelOrSlipKiosk);
router.post("/kiosk_PrintVNLabelOrSlipKiosk", KioskController.printVNLabelOrSlipKiosk);
router.post("/kiosk_MobileUpdateOPDHeader", KioskController.mobileUpdateOPDHeader);
router.post("/mobileUpdateOPDHeader", KioskController.mobileUpdateOPDHeader);
router.post("/gen_vn_appmnt", KioskController.genVnAppmnt);


export default router;
