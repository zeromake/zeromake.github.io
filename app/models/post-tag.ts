import {
    Table,
    Model,
    BelongsTo,
    Column,
    DataType,
    CreatedAt,
    UpdatedAt,
} from "sequelize-typescript";
import Post from "./post";
import Tag from "./tag";

@Table({
    tableName: 'post_tags'
})
export default class PostTag extends Model<PostTag> {
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

    @BelongsTo(() => Post)
    @Column({
        type: DataType.INTEGER.UNSIGNED,
        allowNull: false,
    })
    public post_id!: number;

    @BelongsTo(() => Tag)
    @Column({
        type: DataType.INTEGER.UNSIGNED,
        allowNull: false,
    })
    public tag_id!: number;

    @CreatedAt
    public created_at!: Date;

    @UpdatedAt
    public updated_at!: Date;
}
