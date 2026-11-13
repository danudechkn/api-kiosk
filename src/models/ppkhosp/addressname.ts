import {
    Model,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
} from "sequelize";
import { sequelize } from "./index";

class Addressname extends Model<
    InferAttributes<Addressname>,
    InferCreationAttributes<Addressname>
> {
    declare addresscode: string; // 6 หลัก เช่น "100801", "100800", "100000"
    declare province: CreationOptional<string>; // 2 หลัก เช่น "10"
    declare amphur: CreationOptional<string>;   // 2 หลัก เช่น "08"
    declare tambon: CreationOptional<string>;   // 2 หลัก เช่น "01"
    declare detailtext: CreationOptional<string>; // เช่น "ป้อมปราบ", "เขตป้อมปราบศัตรูพ่าย", "กรุงเทพมหานคร"
    declare zipcode: CreationOptional<string | null>;
    declare shortkey: CreationOptional<string | null>;

    static associate(models: any) {}
}

Addressname.init(
    {
        addresscode: {
            type: DataTypes.STRING(6),
            primaryKey: true,
        },
        province: {
            type: DataTypes.STRING(2),
            allowNull: true,
        },
        amphur: {
            type: DataTypes.STRING(2),
            allowNull: true,
        },
        tambon: {
            type: DataTypes.STRING(2),
            allowNull: true,
        },
        detailtext: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        zipcode: {
            type: DataTypes.STRING(10),
            allowNull: true,
        },
        shortkey: {
            type: DataTypes.STRING(10),
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: "addressname",
        timestamps: false,
    },
);

export default Addressname;

