import {
    Model,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
} from "sequelize";
import { sequelize } from "./index";

class PatAdmit extends Model<
    InferAttributes<PatAdmit>,
    InferCreationAttributes<PatAdmit>
> {
    declare an: number;
    declare hn: CreationOptional<number | null>;
    declare patvisitid: CreationOptional<number | null>;
    declare frompatregid: CreationOptional<number | null>;
    declare fromlocationid: CreationOptional<number | null>;
    declare tolocationid: CreationOptional<number | null>;
    declare dischlocationid: CreationOptional<number | null>;
    declare startdepartcode: CreationOptional<string | null>;
    declare enddepartcode: CreationOptional<string | null>;
    declare admitdatetime: CreationOptional<Date | null>;
    declare admitdate: CreationOptional<Date | string | null>;
    declare dischargedatetime: CreationOptional<Date | null>;
    declare dischargedate: CreationOptional<Date | string | null>;
    declare los: CreationOptional<number | null>;
    declare patcoverageid: CreationOptional<number | null>;
    declare coveragecode: CreationOptional<string | null>;
    declare coveragemasterid: CreationOptional<number | null>;
    declare flag_status: CreationOptional<string | null>;
    declare flag_cancel: CreationOptional<string | null>;
    declare adddatetime: CreationOptional<Date | null>;
    declare adduserid: CreationOptional<number | null>;
    declare presentlocationid: CreationOptional<number | null>;
    declare admitdoctorid: CreationOptional<number | null>;
    declare dc_type: CreationOptional<string | null>;
    declare dc_status: CreationOptional<string | null>;
    declare presentipdregid: CreationOptional<number | null>;
    declare flag_return: CreationOptional<string | null>;
    declare returndatetime: CreationOptional<Date | null>;
    declare flag_code: CreationOptional<string | null>;
    declare codedatetime: CreationOptional<Date | null>;
    declare flag_money: CreationOptional<string | null>;
    declare moneydatetime: CreationOptional<Date | null>;
    declare flag_chart: CreationOptional<string | null>;
    declare weight: CreationOptional<number | null>;
    declare height: CreationOptional<number | null>;
    declare flag_claim: CreationOptional<string | null>;
    declare flag_1: CreationOptional<string | null>;
    declare flag_2: CreationOptional<string | null>;
    declare updatedatetime: CreationOptional<Date | null>;

    static associate(models: any) {}
}

PatAdmit.init(
    {
        an: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        hn: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        patvisitid: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        frompatregid: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        fromlocationid: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        tolocationid: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        dischlocationid: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        startdepartcode: {
            type: DataTypes.CHAR(6),
            allowNull: true,
        },
        enddepartcode: {
            type: DataTypes.CHAR(6),
            allowNull: true,
        },
        admitdatetime: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        admitdate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        dischargedatetime: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        dischargedate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        los: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        patcoverageid: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        coveragecode: {
            type: DataTypes.STRING(5),
            allowNull: true,
        },
        coveragemasterid: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        flag_status: {
            type: DataTypes.STRING(1),
            allowNull: true,
        },
        flag_cancel: {
            type: DataTypes.CHAR(1),
            allowNull: true,
        },
        adddatetime: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        adduserid: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        presentlocationid: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        admitdoctorid: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        dc_type: {
            type: DataTypes.CHAR(1),
            allowNull: true,
        },
        dc_status: {
            type: DataTypes.CHAR(1),
            allowNull: true,
        },
        presentipdregid: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        flag_return: {
            type: DataTypes.CHAR(1),
            allowNull: true,
        },
        returndatetime: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        flag_code: {
            type: DataTypes.CHAR(1),
            allowNull: true,
        },
        codedatetime: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        flag_money: {
            type: DataTypes.CHAR(1),
            allowNull: true,
        },
        moneydatetime: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        flag_chart: {
            type: DataTypes.CHAR(1),
            allowNull: true,
        },
        weight: {
            type: DataTypes.DECIMAL(6, 3),
            allowNull: true,
        },
        height: {
            type: DataTypes.DECIMAL(4, 1),
            allowNull: true,
        },
        flag_claim: {
            type: DataTypes.CHAR(1),
            allowNull: true,
        },
        flag_1: {
            type: DataTypes.STRING(10),
            allowNull: true,
        },
        flag_2: {
            type: DataTypes.STRING(10),
            allowNull: true,
        },
        updatedatetime: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: "pat_admit",
        timestamps: false,
    },
);

export default PatAdmit;

