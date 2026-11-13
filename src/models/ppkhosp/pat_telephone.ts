import {
    Model,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
} from "sequelize";
import { sequelize } from "./index";

class PatTelephone extends Model<
    InferAttributes<PatTelephone>,
    InferCreationAttributes<PatTelephone>
> {
    declare id: CreationOptional<number>;
    declare hn: number;
    declare telephone: string;
    declare contactname: CreationOptional<string | null>;
    declare userid: CreationOptional<number | null>;
    declare editdatetime: CreationOptional<Date | null>;
    declare flag_active: CreationOptional<string | null>;

    static associate(models: any) {}
}

PatTelephone.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        hn: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        telephone: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        contactname: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        userid: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        editdatetime: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        flag_active: {
            type: DataTypes.CHAR(1),
            allowNull: true,
            defaultValue: "Y",
        },
    },
    {
        sequelize,
        tableName: "pat_telephone",
        timestamps: false,
    },
);

export default PatTelephone;

