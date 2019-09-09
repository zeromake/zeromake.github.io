import {
    Table,
    Column,
    Model,
    BelongsToMany,
    CreatedAt,
    UpdatedAt,
    DataType,
} from 'sequelize-typescript';
import Tag from './tag';
import PostTag from './post-tag';

@Table({
    tableName: 'posts'
})
export default class Post extends Model<Post> {
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

    @Column({
        type: DataType.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
    })
    public status: number;

    @Column
    public title: string;

    @Column
    public type: string;

    @BelongsToMany(() => Tag, () => PostTag)
    public tags: Tag[];

    @Column(DataType.STRING(2048))
    public preview: string;

    @CreatedAt
    public created_at!: Date;

    @UpdatedAt
    public updated_at!: Date;
}
