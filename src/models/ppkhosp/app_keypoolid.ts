import {
    Model,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
} from "sequelize";
import { sequelize } from "./index";

class AppKeypoolId extends Model<
    InferAttributes<AppKeypoolId>,
    InferCreationAttributes<AppKeypoolId>
> {
    declare keyname: string;
    declare keyvalue: number;

    static associate(models: any) {}
}

AppKeypoolId.init(
    {
        keyname: {
            type: DataTypes.STRING(40),
            primaryKey: true,
        },
        keyvalue: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: "app_keypoolid",
        timestamps: false,
    },
);

export default AppKeypoolId;

