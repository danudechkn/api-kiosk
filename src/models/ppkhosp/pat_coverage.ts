import {
    Model,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
} from "sequelize";
import { sequelize } from "./index";

class PatCoverage extends Model<
    InferAttributes<PatCoverage>,
    InferCreationAttributes<PatCoverage>
> {
    declare id: CreationOptional<number>;
    declare hn: number;
    declare coveragemasterid: CreationOptional<number | null>;
    declare coveragecode: CreationOptional<string | null>;
    declare coveragecardno: CreationOptional<string | null>;
    declare startdate: CreationOptional<Date | null>;
    declare enddate: CreationOptional<Date | null>;
    declare flag_cup: CreationOptional<string | null>;
    declare flag_check: CreationOptional<string | null>;
    declare flag_status: CreationOptional<string | null>;
    declare flag_refer: CreationOptional<string | null>;
    declare lastreferinid: CreationOptional<number | null>;
    declare purchaserid: CreationOptional<number | null>;
    declare coverageowner: CreationOptional<string | null>;
    declare owneraddresscode: CreationOptional<string | null>;
    declare userid: CreationOptional<number | null>;
    declare editdatetime: CreationOptional<Date | null>;
    declare flag_max: CreationOptional<string | null>;
    declare remainmoney: CreationOptional<number | null>;
    declare flag_approved: CreationOptional<string | null>;
    declare maxmoney: CreationOptional<number | null>;
    declare flag_maxtype: CreationOptional<string | null>;
    declare siteid1: CreationOptional<number | null>;
    declare siteid2: CreationOptional<number | null>;
    declare note: CreationOptional<string | null>;

    static associate(models: any) {}
}

PatCoverage.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        hn: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        coveragemasterid: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        coveragecode: {
            type: DataTypes.STRING(5),
            allowNull: true,
        },
        coveragecardno: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        startdate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        enddate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        flag_cup: {
            type: DataTypes.CHAR(1),
            allowNull: true,
        },
        flag_check: {
            type: DataTypes.CHAR(1),
            allowNull: true,
        },
        flag_status: {
            type: DataTypes.STRING(1),
            allowNull: true,
        },
        flag_refer: {
            type: DataTypes.CHAR(1),
            allowNull: true,
        },
        lastreferinid: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        purchaserid: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        coverageowner: {
            type: DataTypes.STRING(80),
            allowNull: true,
        },
        owneraddresscode: {
            type: DataTypes.CHAR(6),
            allowNull: true,
        },
        userid: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        editdatetime: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        flag_max: {
            type: DataTypes.CHAR(1),
            allowNull: true,
        },
        remainmoney: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true,
        },
        flag_approved: {
            type: DataTypes.CHAR(1),
            allowNull: true,
        },
        maxmoney: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true,
        },
        flag_maxtype: {
            type: DataTypes.CHAR(1),
            allowNull: true,
        },
        siteid1: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        siteid2: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        note: {
            type: DataTypes.STRING(300),
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: "pat_coverage",
        timestamps: false,
    },
);

export default PatCoverage;

