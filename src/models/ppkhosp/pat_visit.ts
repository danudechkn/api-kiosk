import {
    Model,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
} from "sequelize";
import { sequelize } from "./index";

class PatVisit extends Model<
    InferAttributes<PatVisit>,
    InferCreationAttributes<PatVisit>
> {
    declare id: number;
    declare hn: number;
    declare an: CreationOptional<number | null>;
    declare prename: CreationOptional<string | null>;
    declare firstname: CreationOptional<string | null>;
    declare lastname: CreationOptional<string | null>;
    declare visitdatetime: CreationOptional<Date | null>;
    declare dischdatetime: CreationOptional<Date | null>;
    declare lastregtypeid: CreationOptional<number | null>;
    declare patcoverageid: CreationOptional<number | null>;
    declare coveragecode: CreationOptional<string | null>;
    declare coveragemasterid: CreationOptional<number | null>;
    declare regstatusid: CreationOptional<number | null>;
    declare lastlocationid: CreationOptional<number | null>;
    declare dischargetypeid: CreationOptional<number | null>;
    declare sex: CreationOptional<number | null>;
    declare ageday: CreationOptional<number | null>;
    declare address: CreationOptional<string | null>;
    declare tambon: CreationOptional<string | null>;
    declare amphur: CreationOptional<string | null>;
    declare province: CreationOptional<string | null>;
    declare zipcode: CreationOptional<string | null>;
    declare citizencardno: CreationOptional<string | null>;
    declare flag_status: CreationOptional<string | null>;
    declare admitlocationid: CreationOptional<number | null>;
    declare admitdatetime: CreationOptional<Date | null>;
    declare dischlocationid: CreationOptional<number | null>;
    declare visitdate: CreationOptional<Date | null>;

    static associate(models: any) {}
}

PatVisit.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        hn: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        an: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        prename: {
            type: DataTypes.STRING(25),
            allowNull: true,
        },
        firstname: {
            type: DataTypes.STRING(25),
            allowNull: true,
        },
        lastname: {
            type: DataTypes.STRING(30),
            allowNull: true,
        },
        visitdatetime: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        dischdatetime: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        lastregtypeid: {
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
        regstatusid: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        lastlocationid: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        dischargetypeid: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        sex: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        ageday: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        address: {
            type: DataTypes.STRING(120),
            allowNull: true,
        },
        tambon: {
            type: DataTypes.CHAR(6),
            allowNull: true,
        },
        amphur: {
            type: DataTypes.CHAR(6),
            allowNull: true,
        },
        province: {
            type: DataTypes.CHAR(6),
            allowNull: true,
        },
        zipcode: {
            type: DataTypes.CHAR(5),
            allowNull: true,
        },
        citizencardno: {
            type: DataTypes.CHAR(13),
            allowNull: true,
        },
        flag_status: {
            type: DataTypes.STRING(1),
            allowNull: true,
        },
        admitlocationid: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        admitdatetime: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        dischlocationid: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        visitdate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: "pat_visit",
        timestamps: false,
    },
);

export default PatVisit;

