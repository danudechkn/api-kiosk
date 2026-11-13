import {
    Model,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
} from "sequelize";
import { sequelize } from "./index";

class Coveragesite extends Model<
    InferAttributes<Coveragesite>,
    InferCreationAttributes<Coveragesite>
> {
    declare siteid: number;
    declare sitecode: CreationOptional<string | null>;
    declare sitedesc: CreationOptional<string | null>;
    declare provcode: CreationOptional<string | null>;
    declare provdesc: CreationOptional<string | null>;
    declare officetype: CreationOptional<string | null>;
    declare typecode: CreationOptional<string | null>;
    declare areacode: CreationOptional<string | null>;
    declare mastersiteid: CreationOptional<number | null>;
    declare hcode9: CreationOptional<string | null>;

    static associate(models: any) {}
}

Coveragesite.init(
    {
        siteid: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        sitecode: {
            type: DataTypes.CHAR(12),
            allowNull: true,
        },
        sitedesc: {
            type: DataTypes.CHAR(250),
            allowNull: true,
        },
        provcode: {
            type: DataTypes.CHAR(2),
            allowNull: true,
        },
        provdesc: {
            type: DataTypes.CHAR(50),
            allowNull: true,
        },
        officetype: {
            type: DataTypes.CHAR(40),
            allowNull: true,
        },
        typecode: {
            type: DataTypes.CHAR(1),
            allowNull: true,
        },
        areacode: {
            type: DataTypes.CHAR(1),
            allowNull: true,
        },
        mastersiteid: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        hcode9: {
            type: DataTypes.CHAR(12),
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: "coveragesite",
        timestamps: false,
    },
);

export default Coveragesite;

