import {
    Model,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
} from "sequelize";
import { sequelize } from "./index";

// 1. สร้าง Class สำหรับตาราง location
class Location extends Model<
    InferAttributes<Location>,
    InferCreationAttributes<Location>
> {
    declare id: CreationOptional<number>;
    declare detailtext: CreationOptional<string | null>;
    declare locationtypeid: CreationOptional<number | null>;
    declare departmentid: CreationOptional<number | null>;
    declare buildingid: CreationOptional<number | null>;
    declare floor: CreationOptional<number | null>;
    declare active: CreationOptional<string | null>;
    declare progno: CreationOptional<number | null>;
    declare shortkey: CreationOptional<string | null>;
    declare locationconsultid: CreationOptional<number | null>;
    declare shortname: CreationOptional<string | null>;
    declare telephone: CreationOptional<string | null>;
    declare flag_1: CreationOptional<number | null>;
    declare locationgroup: CreationOptional<string | null>;
    declare locationcode: CreationOptional<string | null>;

    static associate(models: any) { }
}

// 2. กำหนดโครงสร้างคอลัมน์ (Schema) ของตาราง
Location.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        detailtext: {
            type: DataTypes.STRING(150),
            allowNull: true,
        },
        locationtypeid: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        departmentid: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        buildingid: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        floor: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        active: {
            type: DataTypes.STRING(1),
            allowNull: true,
        },
        progno: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        shortkey: {
            type: DataTypes.CHAR(4),
            allowNull: true,
        },
        locationconsultid: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        shortname: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        telephone: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        flag_1: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        locationgroup: {
            type: DataTypes.CHAR(10),
            allowNull: true,
        },
        locationcode: {
            type: DataTypes.STRING(2),
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: "location",
        timestamps: false,
    },
);

export default Location;
