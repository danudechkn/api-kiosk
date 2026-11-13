import {
    Model,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
} from "sequelize";
import { sequelize } from "./index";

class Pat extends Model<InferAttributes<Pat>, InferCreationAttributes<Pat>> {
    declare hn: number;
    declare prename: CreationOptional<string | null>;
    declare firstname: CreationOptional<string | null>;
    declare lastname: CreationOptional<string | null>;
    declare citizencardno: CreationOptional<string | null>;
    declare sex: CreationOptional<number | null>;
    declare birthdatetime: CreationOptional<Date | null>;
    declare flag_status: CreationOptional<string | null>;

    static associate(models: any) {}
}

Pat.init(
    {
        hn: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        prename: {
            type: DataTypes.STRING(25),
            allowNull: true,
        },
        firstname: {
            type: DataTypes.STRING(25),
            allowNull: true,
        },
        lastname: {
            type: DataTypes.STRING(30),
            allowNull: true,
        },
        citizencardno: {
            type: DataTypes.STRING(13),
            allowNull: true,
        },
        sex: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        birthdatetime: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        flag_status: {
            type: DataTypes.STRING(1),
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: "pat",
        timestamps: false,
    },
);

export default Pat;

