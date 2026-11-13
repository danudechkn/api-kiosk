import {
    Model,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
} from "sequelize";
import { sequelize } from "./index";

class PatAppointCheckCov extends Model<
    InferAttributes<PatAppointCheckCov>,
    InferCreationAttributes<PatAppointCheckCov>
> {
    declare id: CreationOptional<number>;
    declare hn: CreationOptional<number | null>;
    declare cid: CreationOptional<string | null>;
    declare appointid: CreationOptional<number | null>;
    declare appointdate: CreationOptional<Date | string | null>;
    declare appointtolocation: CreationOptional<number | null>;
    declare appointtodoctorid: CreationOptional<number | null>;
    declare appointcovid: CreationOptional<number | null>;
    declare appointcovcode: CreationOptional<string | null>;
    declare appointcovmaster: CreationOptional<number | null>;
    declare patcovcode: CreationOptional<string | null>;
    declare patcovcodename: CreationOptional<string | null>;
    declare nhsomaininscl: CreationOptional<string | null>;
    declare nhsomaininsclname: CreationOptional<string | null>;
    declare insuresuccesscode: CreationOptional<string | null>;
    declare insuresuccessname: CreationOptional<string | null>;
    declare checkdatetime: CreationOptional<Date | null>;
    declare flag_cov: CreationOptional<string | null>;
    declare flag_appointtype: CreationOptional<string | null>;
    declare flag_refer: CreationOptional<string | null>;
    declare refer_untilldate: CreationOptional<Date | string | null>;
    declare flag_doc: CreationOptional<string | null>;
    declare flag_appointstatus: CreationOptional<string | null>;
    declare flag_covapproved: CreationOptional<string | null>;
    declare covapprovedbyuserid: CreationOptional<number | null>;
    declare flag_checkcov_status: CreationOptional<string | null>;
    declare qslot: CreationOptional<number | null>;
    declare qseq: CreationOptional<number | null>;
    declare qtext: CreationOptional<string | null>;
    declare flag_register: CreationOptional<string | null>;
    declare patregid: CreationOptional<number | null>;
    declare covreftype: CreationOptional<string | null>;

    static associate(models: any) {}
}

PatAppointCheckCov.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        hn: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        cid: {
            type: DataTypes.CHAR(13),
            allowNull: true,
        },
        appointid: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        appointdate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        appointtolocation: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        appointtodoctorid: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        appointcovid: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        appointcovcode: {
            type: DataTypes.CHAR(5),
            allowNull: true,
        },
        appointcovmaster: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        patcovcode: {
            type: DataTypes.CHAR(5),
            allowNull: true,
        },
        patcovcodename: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        nhsomaininscl: {
            type: DataTypes.CHAR(10),
            allowNull: true,
        },
        nhsomaininsclname: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        insuresuccesscode: {
            type: DataTypes.CHAR(5),
            allowNull: true,
        },
        insuresuccessname: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        checkdatetime: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        flag_cov: {
            type: DataTypes.CHAR(1),
            allowNull: true,
        },
        flag_appointtype: {
            type: DataTypes.CHAR(1),
            allowNull: true,
        },
        flag_refer: {
            type: DataTypes.CHAR(1),
            allowNull: true,
        },
        refer_untilldate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        flag_doc: {
            type: DataTypes.CHAR(1),
            allowNull: true,
        },
        flag_appointstatus: {
            type: DataTypes.CHAR(1),
            allowNull: true,
        },
        flag_covapproved: {
            type: DataTypes.CHAR(1),
            allowNull: true,
        },
        covapprovedbyuserid: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        flag_checkcov_status: {
            type: DataTypes.CHAR(1),
            allowNull: true,
        },
        qslot: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        qseq: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
        },
        qtext: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        flag_register: {
            type: DataTypes.CHAR(1),
            allowNull: true,
        },
        patregid: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        covreftype: {
            type: DataTypes.CHAR(1),
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: "pat_appointcheckcov",
        timestamps: false,
    },
);

export default PatAppointCheckCov;

