"use strict";

import fs from "fs";
import path from "path";
import { Sequelize, DataTypes } from "sequelize"; // เปลี่ยนมาใช้ sequelize package หลักของ v6

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";

// 1. ดึงค่า Config
const rawConfig = require(
  path.resolve(__dirname, "..", "..", "config", "config"),
);
const config = rawConfig.default ? rawConfig.default[env] : rawConfig[env];

// 2. สร้างอินสแตนซ์ Sequelize v6 ก่อน
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect || "mysql", // ระบุเป็น string เช่น 'mysql', 'postgres'
    port: Number(config.port) || 3306,
    logging: config.logging !== false ? console.log : false,
  },
);

// สร้าง object เปล่าแบบยังไม่ระบุเจาะจงชนิดในช่วงแรก
const db: any = {};

// 3. ค้นหาและโหลดคลาสโมเดลทั้งหมดในโฟลเดอร์นี้แบบอัตโนมัติ
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      (file.slice(-3) === ".js" || file.slice(-3) === ".ts") &&
      file.indexOf(".test.js") === -1 &&
      file.indexOf(".test.ts") === -1 &&
      file !== "db.d.ts" // ป้องกันการโหลดไฟล์ Type Definition
    );
  })
  .forEach((file) => {
    const modelModule = require(path.join(__dirname, file));
    // รองรับทั้ง export default และ export ปกติ
    let model = modelModule.default || modelModule;

    // ระบบ v6 มักใช้โครงสร้างฟังก์ชันข้ามไฟล์ (โมเดลแบบเก่า) หรือคลาสที่เขียนแบบใช้สืบทอด
    if (typeof model === "function" && model.init) {
      // สำหรับคลาสโมเดล v6 ที่เขียนสืบทอดมาจาก Model และมีเมธอด init ไว้เรียกใช้งาน
      // ในกรณีนี้โมเดลมักถูกอินิทโครงสร้างแยกในไฟล์ตัวเองแล้ว เราจับยัดเข้า db object ได้เลย
      db[model.name] = model;
    } else if (typeof model === "function") {
      // สำหรับสไตล์ดั้งเดิมของ Sequelize CLI ที่ส่งฟังก์ชันมาให้รันอินิท
      model = model(sequelize, DataTypes);
      db[model.name] = model;
    } else if (model && typeof model === "object") {
      // เก็บตกกรณีที่มีการนำคลาสใส่ไว้ใน object ตัวแปรย่อย
      const actualModel = Object.values(model)[0];
      if (typeof actualModel === "function" && (actualModel as any).init) {
        db[(actualModel as any).name] = actualModel;
      }
    }
  });

// 4. เรียกใช้การเชื่อมความสัมพันธ์ (Associations) หากตัวโมเดลมีฟังก์ชัน associate ตั้งไว้
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// เชื่อมความสัมพันธ์ระหว่างตาราง
if (db.Pat && db.PatAddress) {
  db.Pat.hasOne(db.PatAddress, {
    foreignKey: "hn",
    as: "address",
  });
}

if (db.PatCoverage && db.Coveragecode) {
  db.PatCoverage.belongsTo(db.Coveragecode, {
    foreignKey: "coveragecode",
    targetKey: "coveragecode",
    as: "coverage",
  });

  db.Coveragecode.hasMany(db.PatCoverage, {
    foreignKey: "coveragecode",
    sourceKey: "coveragecode",
    as: "patCoverages",
  });
}

if (db.PatCoverage && db.Coveragesite) {
  db.PatCoverage.belongsTo(db.Coveragesite, {
    foreignKey: "siteid1",
    targetKey: "siteid",
    as: "site1",
  });

  db.PatCoverage.belongsTo(db.Coveragesite, {
    foreignKey: "siteid2",
    targetKey: "siteid",
    as: "site2",
  });
}

// ความสัมพันธ์สำหรับ ผู้ป่วย (Pat) กับ สิทธิการรักษา และ เบอร์โทรศัพท์
if (db.Pat && db.PatCoverage) {
  db.Pat.hasMany(db.PatCoverage, {
    foreignKey: "hn",
    sourceKey: "hn",
    as: "coverages",
  });

  db.PatCoverage.belongsTo(db.Pat, {
    foreignKey: "hn",
    targetKey: "hn",
    as: "patient",
  });
}

if (db.Pat && db.PatTelephone) {
  db.Pat.hasMany(db.PatTelephone, {
    foreignKey: "hn",
    sourceKey: "hn",
    as: "telephones",
  });

  db.PatTelephone.belongsTo(db.Pat, {
    foreignKey: "hn",
    targetKey: "hn",
    as: "patient",
  });
}

// ความสัมพันธ์สำหรับ Visit และ Registration (PatVisit <-> PatReg)
if (db.Pat && db.PatVisit) {
  db.Pat.hasMany(db.PatVisit, {
    foreignKey: "hn",
    sourceKey: "hn",
    as: "visits",
  });

  db.PatVisit.belongsTo(db.Pat, {
    foreignKey: "hn",
    targetKey: "hn",
    as: "patient",
  });
}

if (db.PatVisit && db.PatReg) {
  db.PatVisit.hasMany(db.PatReg, {
    foreignKey: "patvisitid",
    sourceKey: "id",
    as: "regs",
  });

  db.PatReg.belongsTo(db.PatVisit, {
    foreignKey: "patvisitid",
    targetKey: "id",
    as: "visit",
  });
}

// ความสัมพันธ์ระหว่าง PatReg กับ Location (ห้องตรวจ/คลินิก)
if (db.PatReg && db.Location) {
  db.PatReg.belongsTo(db.Location, {
    foreignKey: "locationid",
    targetKey: "id",
    as: "location",
  });

  db.Location.hasMany(db.PatReg, {
    foreignKey: "locationid",
    sourceKey: "id",
    as: "regs",
  });
}

// ความสัมพันธ์สำหรับ ใบนัดหมาย (PatAppoint)
if (db.Pat && db.PatAppoint) {
  db.Pat.hasMany(db.PatAppoint, {
    foreignKey: "hn",
    sourceKey: "hn",
    as: "appointments",
  });

  db.PatAppoint.belongsTo(db.Pat, {
    foreignKey: "hn",
    targetKey: "hn",
    as: "patient",
  });
}

if (db.PatAppoint && db.Location) {
  db.PatAppoint.belongsTo(db.Location, {
    foreignKey: "appointtolocationid",
    targetKey: "id",
    as: "appointLocation",
  });
}

if (db.PatAppoint && db.PatAppointCheckCov) {
  db.PatAppoint.hasOne(db.PatAppointCheckCov, {
    foreignKey: "appointid",
    sourceKey: "id",
    as: "checkCov",
  });

  db.PatAppointCheckCov.belongsTo(db.PatAppoint, {
    foreignKey: "appointid",
    targetKey: "id",
    as: "appointment",
  });
}

if (db.Pat && db.PatAppointCheckCov) {
  db.Pat.hasMany(db.PatAppointCheckCov, {
    foreignKey: "hn",
    sourceKey: "hn",
    as: "appointCheckCovs",
  });

  db.PatAppointCheckCov.belongsTo(db.Pat, {
    foreignKey: "hn",
    targetKey: "hn",
    as: "patient",
  });
}

if (db.Pat && db.PatAdmit) {
  db.Pat.hasMany(db.PatAdmit, {
    foreignKey: "hn",
    sourceKey: "hn",
    as: "admits",
  });

  db.PatAdmit.belongsTo(db.Pat, {
    foreignKey: "hn",
    targetKey: "hn",
    as: "patient",
  });
}

// ความสัมพันธ์สำหรับ QueueKioskq
if (db.PatReg && db.QueueKioskq) {
  db.PatReg.hasOne(db.QueueKioskq, {
    foreignKey: "patregid",
    sourceKey: "id",
    as: "kioskQueue",
  });

  db.QueueKioskq.belongsTo(db.PatReg, {
    foreignKey: "patregid",
    targetKey: "id",
    as: "reg",
  });
}

if (db.Pat && db.QueueKioskq) {
  db.Pat.hasMany(db.QueueKioskq, {
    foreignKey: "hn",
    sourceKey: "hn",
    as: "kioskQueues",
  });

  db.QueueKioskq.belongsTo(db.Pat, {
    foreignKey: "hn",
    targetKey: "hn",
    as: "patient",
  });
}

// ความสัมพันธ์สำหรับ AppointPeriodLocation
if (db.Location && db.AppointPeriodLocation) {
  db.Location.hasOne(db.AppointPeriodLocation, {
    foreignKey: "locationid",
    sourceKey: "id",
    as: "periodLocation",
  });

  db.AppointPeriodLocation.belongsTo(db.Location, {
    foreignKey: "locationid",
    targetKey: "id",
    as: "location",
  });
}

// ความสัมพันธ์สำหรับ DoctorLocation
if (db.Location && db.DoctorLocation) {
  db.Location.hasMany(db.DoctorLocation, {
    foreignKey: "locationid",
    sourceKey: "id",
    as: "doctorLocations",
  });

  db.DoctorLocation.belongsTo(db.Location, {
    foreignKey: "locationid",
    targetKey: "id",
    as: "location",
  });
}

// ความสัมพันธ์สำหรับ PatAppointPeriod
if (db.PatAppoint && db.PatAppointPeriod) {
  db.PatAppoint.hasOne(db.PatAppointPeriod, {
    foreignKey: "appointid",
    sourceKey: "id",
    as: "appointPeriod",
  });

  db.PatAppointPeriod.belongsTo(db.PatAppoint, {
    foreignKey: "appointid",
    targetKey: "id",
    as: "appointment",
  });
}

// 5. ส่งออกระบบไปใช้ร่วมกัน
db.sequelize = sequelize;
db.Sequelize = Sequelize;

export { sequelize, Sequelize };
export default db;
