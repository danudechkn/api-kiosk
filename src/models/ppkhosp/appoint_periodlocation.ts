import {
    Model,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
} from "sequelize";
import { sequelize } from "./index";

class AppointPeriodLocation extends Model<
    InferAttributes<AppointPeriodLocation>,
    InferCreationAttributes<AppointPeriodLocation>
> {
    declare locationid: number;
    declare flag_period: CreationOptional<string | null>;
    declare flag_queue: CreationOptional<string | null>;
    declare defqueue: CreationOptional<string | null>;
    declare loccode: CreationOptional<string | null>;
    declare flag_lockappointdate: CreationOptional<string | null>;
    declare flag_overlimit: CreationOptional<string | null>;
    declare flag_apiktb: CreationOptional<string | null>;
    declare flag_a: CreationOptional<string | null>;
    declare flag_b: CreationOptional<string | null>;
    declare flag_c: CreationOptional<string | null>;
    declare flag_d: CreationOptional<string | null>;

    static associate(models: any) {}
}

AppointPeriodLocation.init(
    {
        locationid: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
        },
        flag_period: {
            type: DataTypes.CHAR(1),
            allowNull: true,
        },
        flag_queue: {
            type: DataTypes.CHAR(1),
            allowNull: true,
        },
        defqueue: {
            type: DataTypes.STRING(10),
            allowNull: true,
        },
        loccode: {
            type: DataTypes.STRING(10),
            allowNull: true,
        },
        flag_lockappointdate: {
            type: DataTypes.CHAR(1),
            allowNull: true,
        },
        flag_overlimit: {
            type: DataTypes.CHAR(1),
            allowNull: true,
        },
        flag_apiktb: {
            type: DataTypes.CHAR(1),
            allowNull: true,
        },
        flag_a: {
            type: DataTypes.CHAR(3),
            allowNull: true,
        },
        flag_b: {
            type: DataTypes.CHAR(3),
            allowNull: true,
        },
        flag_c: {
            type: DataTypes.CHAR(3),
            allowNull: true,
        },
        flag_d: {
            type: DataTypes.CHAR(3),
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: "appoint_periodlocation",
        timestamps: false,
    }
);

export default AppointPeriodLocation;

