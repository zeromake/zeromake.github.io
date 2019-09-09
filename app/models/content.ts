import {
    Table,
    Model,
    Column,
    DataType,
    CreatedAt,
    UpdatedAt,
} from "sequelize-typescript";

@Table({
    tableName: 'contents'
})
export default class Content extends Model<Content> {
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
    public type: string;

    @Column({
        type: DataType.TEXT,
    })
    public content: string;

    @CreatedAt
    public created_at!: Date;

    @UpdatedAt
    public updated_at!: Date;
}
