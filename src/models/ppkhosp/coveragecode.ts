import {
    Model,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
} from "sequelize";
import { sequelize } from "./index";

class Coveragecode extends Model<
    InferAttributes<Coveragecode>,
    InferCreationAttributes<Coveragecode>
> {
    declare coveragecode: string;
    declare detailtext: CreationOptional<string | null>;
    declare coveragegroup: CreationOptional<string | null>;
    declare defaultmasterid: CreationOptional<number | null>;
    declare flag_active: CreationOptional<string | null>;
    declare flag_check: CreationOptional<string | null>;
    declare userid: CreationOptional<number | null>;
    declare editdatetime: CreationOptional<Date | null>;
    declare flag_alert: CreationOptional<string | null>;
    declare flag_cost: CreationOptional<string | null>;
    declare flag_site: CreationOptional<string | null>;
    declare pttype: CreationOptional<string | null>;
    declare nhso_subinscl: CreationOptional<string | null>;
    declare nhso_maininscl: CreationOptional<string | null>;
    declare coveragepurchasercode: CreationOptional<string | null>;

    static associate(models: any) {}
}

Coveragecode.init(
    {
        coveragecode: {
            type: DataTypes.STRING(5),
            primaryKey: true,
        },
        detailtext: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        coveragegroup: {
            type: DataTypes.STRING(2),
            allowNull: true,
        },
        defaultmasterid: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        flag_active: {
            type: DataTypes.STRING(1),
            allowNull: true,
        },
        flag_check: {
            type: DataTypes.STRING(1),
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
        flag_alert: {
            type: DataTypes.STRING(1),
            allowNull: true,
        },
        flag_cost: {
            type: DataTypes.CHAR(1),
            allowNull: true,
        },
        flag_site: {
            type: DataTypes.CHAR(1),
            allowNull: true,
        },
        pttype: {
            type: DataTypes.STRING(2),
            allowNull: true,
        },
        nhso_subinscl: {
            type: DataTypes.STRING(5),
            allowNull: true,
        },
        nhso_maininscl: {
            type: DataTypes.STRING(5),
            allowNull: true,
        },
        coveragepurchasercode: {
            type: DataTypes.STRING(10),
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: "coveragecode",
        timestamps: false,
    },
);

export default Coveragecode;

