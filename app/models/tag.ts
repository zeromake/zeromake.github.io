import {
    Table,
    Model,
    DataType,
    Column,
    CreatedAt,
    UpdatedAt,
} from 'sequelize-typescript';

@Table({
    tableName: 'tags',
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
    @Column({
        field: 'created_at',
    })
    public createdAt!: Date;

    @UpdatedAt
    @Column({
        field: 'updated_at',
    })
    public updatedAt!: Date;
}
