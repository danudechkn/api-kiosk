import {
    Model,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
} from "sequelize";
import { sequelize } from "./index";

class DoctorLocation extends Model<
    InferAttributes<DoctorLocation>,
    InferCreationAttributes<DoctorLocation>
> {
    declare locationid: number;
    declare doctorid: number;
    declare doctorcode: CreationOptional<string | null>;

    static associate(models: any) {}
}

DoctorLocation.init(
    {
        locationid: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
        },
        doctorid: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
        },
        doctorcode: {
            type: DataTypes.CHAR(10),
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: "doctor_location",
        timestamps: false,
    }
);

export default DoctorLocation;

