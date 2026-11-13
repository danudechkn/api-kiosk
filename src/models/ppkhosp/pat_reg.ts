import {
    Model,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
} from "sequelize";
import { sequelize } from "./index";

class PatReg extends Model<
    InferAttributes<PatReg>,
    InferCreationAttributes<PatReg>
> {
    declare id: number;
    declare hn: CreationOptional<number | null>;
    declare an: CreationOptional<number | null>;
    declare patvisitid: CreationOptional<number | null>;
    declare regtypeid: CreationOptional<number | null>;
    declare regstatusid: CreationOptional<number | null>;
    declare departcode: CreationOptional<string | null>;
    declare locationid: CreationOptional<number | null>;
    declare roomno: CreationOptional<string | null>;
    declare patcoverageid: CreationOptional<number | null>;
    declare coveragecode: CreationOptional<string | null>;
    declare coveragemasterid: CreationOptional<number | null>;
    declare queueno: CreationOptional<number | null>;
    declare locationqueueno: CreationOptional<number | null>;
    declare startdatetime: CreationOptional<Date | null>;
    declare enddatetime: CreationOptional<Date | null>;
    declare dischargetypeid: CreationOptional<number | null>;
    declare flag_status: CreationOptional<string | null>;
    declare flag_reg: CreationOptional<string | null>;
    declare flag_service: CreationOptional<string | null>;
    declare appointid: CreationOptional<number | null>;
    declare maindoctorid: CreationOptional<number | null>;
    declare visitdate: CreationOptional<Date | null>;
    declare regdatetime: CreationOptional<Date | null>;
    declare editdatetime: CreationOptional<Date | null>;

    static associate(models: any) {}
}

PatReg.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        hn: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        an: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        patvisitid: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        regtypeid: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        regstatusid: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        departcode: {
            type: DataTypes.CHAR(6),
            allowNull: true,
        },
        locationid: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        roomno: {
            type: DataTypes.CHAR(4),
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
        queueno: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        locationqueueno: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        startdatetime: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        enddatetime: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        dischargetypeid: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        flag_status: {
            type: DataTypes.CHAR(1),
            allowNull: true,
        },
        flag_reg: {
            type: DataTypes.CHAR(1),
            allowNull: true,
        },
        flag_service: {
            type: DataTypes.CHAR(1),
            allowNull: true,
        },
        appointid: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        maindoctorid: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        visitdate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        regdatetime: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        editdatetime: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        tableName: "pat_reg",
        timestamps: false,
    },
);

export default PatReg;

