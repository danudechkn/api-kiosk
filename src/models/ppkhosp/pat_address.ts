import {
    Model,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
} from "sequelize";
import { sequelize } from "./index";

// 1. สร้าง Class สำหรับตาราง pat_address
class PatAddress extends Model<
    InferAttributes<PatAddress>,
    InferCreationAttributes<PatAddress>
> {
    declare id: CreationOptional<number>;
    declare hn: number;
    declare house: CreationOptional<string>;
    declare moo: CreationOptional<string>;
    declare soy: CreationOptional<string>;
    declare road: CreationOptional<string>;
    declare tambon: CreationOptional<string>;
    declare amphur: CreationOptional<string>;
    declare province: CreationOptional<string>;
    declare country: CreationOptional<number>;
    declare postcode: CreationOptional<string>;
    declare phone: CreationOptional<string>;
    declare email: CreationOptional<string>;
    declare flag_status: CreationOptional<string>;
    declare userid: CreationOptional<number>;

    static associate(models: any) { }
}

// 2. กำหนดโครงสร้างคอลัมน์ (Schema) ของตาราง
PatAddress.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        hn: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        house: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        moo: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        soy: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        road: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        tambon: {
            type: DataTypes.STRING(6),
            allowNull: true,
        },
        amphur: {
            type: DataTypes.STRING(6),
            allowNull: true,
        },
        province: {
            type: DataTypes.STRING(6),
            allowNull: true,
        },
        country: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        postcode: {
            type: DataTypes.STRING(10),
            allowNull: true,
        },
        phone: {
            type: DataTypes.STRING(40),
            allowNull: true,
        },
        email: {
            type: DataTypes.STRING(40),
            allowNull: true,
        },
        flag_status: {
            type: DataTypes.STRING(1),
            allowNull: true,
        },
        userid: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: "pat_address",
        timestamps: false,
    },
);

export default PatAddress;
