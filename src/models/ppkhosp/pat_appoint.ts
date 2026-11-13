import {
    Model,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
} from "sequelize";
import { sequelize } from "./index";

class PatAppoint extends Model<
    InferAttributes<PatAppoint>,
    InferCreationAttributes<PatAppoint>
> {
    declare id: number;
    declare hn: number;
    declare patvisitid: CreationOptional<number | null>;
    declare patregid: CreationOptional<number | null>;
    declare appointdate: CreationOptional<Date | null>;
    declare appointtime: CreationOptional<string | null>;
    declare appointtoroomno: CreationOptional<string | null>;
    declare appointtolocationid: CreationOptional<number | null>;
    declare appointtodoctorid: CreationOptional<number | null>;
    declare patcoverageid: CreationOptional<number | null>;
    declare coveragecode: CreationOptional<string | null>;
    declare coveragemasterid: CreationOptional<number | null>;
    declare note: CreationOptional<string | null>;
    declare flag_status: CreationOptional<string | null>;
    declare flag_appoint: CreationOptional<string | null>;
    declare flag_service: CreationOptional<string | null>;
    declare newpatregid: CreationOptional<number | null>;

    static associate(models: any) {}
}

PatAppoint.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        hn: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        patvisitid: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        patregid: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        appointdate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        appointtime: {
            type: DataTypes.STRING(30),
            allowNull: true,
        },
        appointtoroomno: {
            type: DataTypes.STRING(4),
            allowNull: true,
        },
        appointtolocationid: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        appointtodoctorid: {
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
        note: {
            type: DataTypes.STRING(250),
            allowNull: true,
        },
        flag_status: {
            type: DataTypes.STRING(1),
            allowNull: true,
        },
        flag_appoint: {
            type: DataTypes.STRING(1),
            allowNull: true,
        },
        flag_service: {
            type: DataTypes.STRING(1),
            allowNull: true,
        },
        newpatregid: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: "pat_appoint",
        timestamps: false,
    },
);

export default PatAppoint;

