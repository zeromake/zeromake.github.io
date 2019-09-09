import {
    Table,
    Model,
    DataType,
    Column,
    CreatedAt,
    UpdatedAt,
} from "sequelize-typescript";

@Table({
    tableName: 'tags'
})
export default class Tag extends Model<Tag> {
    @Column({
        type: DataType.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    })
    public id: number;

    @Column({
        type: DataType.TINYINT.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
    })
    public deleted: number;

    @Column
    public name!: string;

    @CreatedAt
    public created_at!: Date;

    @UpdatedAt
    public updated_at!: Date;
}
