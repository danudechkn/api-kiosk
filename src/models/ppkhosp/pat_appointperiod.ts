import {
    Model,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
} from "sequelize";
import { sequelize } from "./index";

class PatAppointPeriod extends Model<
    InferAttributes<PatAppointPeriod>,
    InferCreationAttributes<PatAppointPeriod>
> {
    declare appointid: number;
    declare periodmainid: number;
    declare periodid: number;
    declare slotno: number;
    declare seq: CreationOptional<number | null>;
    declare startendtext: CreationOptional<string | null>;
    declare flagappoint: CreationOptional<string | null>;
    declare editdatetime: CreationOptional<Date | null>;

    static associate(models: any) {}
}

PatAppointPeriod.init(
    {
        appointid: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
        },
        periodmainid: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        periodid: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        slotno: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        seq: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        startendtext: {
            type: DataTypes.STRING(80),
            allowNull: true,
        },
        flagappoint: {
            type: DataTypes.CHAR(1),
            allowNull: true,
        },
        editdatetime: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: "pat_appointperiod",
        timestamps: false,
    }
);

export default PatAppointPeriod;

