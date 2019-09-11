import {
    Table,
    Model,
    BelongsTo,
    Column,
    DataType,
    CreatedAt,
    UpdatedAt,
} from 'sequelize-typescript';
import Post from './post';
import Tag from './tag';

@Table({
    tableName: 'post_tags',
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
        field: 'post_id',
    })
    public postId!: number;

    @BelongsTo(() => Tag)
    @Column({
        type: DataType.INTEGER.UNSIGNED,
        allowNull: false,
        field: 'tag_id',
    })
    public tagId!: number;

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
