import {
    Model,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
} from "sequelize";
import { sequelize } from "./index";

class QueueKioskq extends Model<
    InferAttributes<QueueKioskq>,
    InferCreationAttributes<QueueKioskq>
> {
    declare hn: number;
    declare cid: CreationOptional<string | null>;
    declare visitdate: string;
    declare squeue: string;
    declare patregid: CreationOptional<number | null>;

    static associate(models: any) {}
}

QueueKioskq.init(
    {
        hn: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
        },
        cid: {
            type: DataTypes.CHAR(13),
            allowNull: true,
        },
        visitdate: {
            type: DataTypes.DATEONLY,
            primaryKey: true,
            allowNull: false,
        },
        squeue: {
            type: DataTypes.CHAR(10),
            primaryKey: true,
            allowNull: false,
        },
        patregid: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: "queue_kioskq",
        timestamps: false,
    }
);

export default QueueKioskq;

