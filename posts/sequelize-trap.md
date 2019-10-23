---
title: sequelize一些陷阱
date: 2019-09-19 16:58:00+08:00
type: orm
tags: [orm, node, trap]
last_date: 2019-09-19 16:58:00+08:00
private: true
---

## 前言
- 最近接手一些公司的其它 `node` 项目，`orm` 框架从 `knex` + `bookshelf` 切换到了 `sequelize` 了。
- 在试着像 `knex` + `bookshelf` 一样来使用 `sequelize` 发现了一些问题，记录下来。

## 表关联 + 分页

model/book.js

``` js
module.exports = (sequelize, DataTypes) => {
  const Book = sequelize.define('Book', {
    name: DataTypes.STRING
  }, {});
  Book.associate = function(models) {
    const { Book, Tag } = models;
    Book.hasMany(Tag, {
      sourceKey: 'id',
      foreignKey: 'bookId',
    });
  };
  return Book;
};
```

model/tag.js

``` js
module.exports = (sequelize, DataTypes) => {
  const Tag = sequelize.define('Tag', {
    name: DataTypes.STRING,
    bookId: DataTypes.INTEGER
  }, {});
  Tag.associate = function(models) {
    const { Book, Tag } = models;
    Tag.belongsTo(Book);
  };
  return Tag;
};
```

例如以上的 `model` 关联情况下，我希望通过 `Tag` 的字段来筛选出 `Book` 的列表。

``` js
const db = require('./models');
const Op = db.Sequelize.Op;
async function main() {
    const { Book, Tag } = db;
    const books = await Book.findAll({
        include: [
            {
                model: Tag,
                required: true,
                where: {
                    id: 1,
                }
            }
        ],
        limit: 20,
    });
    console.log(books);
}
```

最终输出的 `sql` 为一个两层子查询嵌套的语句：
``` sql
SELECT `Book`.*, `Tags`.`id` AS `Tags.id`, `Tags`.`name` AS `Tags.name`, `Tags`.`bookId` AS `Tags.bookId`, `Tags`.`createdAt` AS `Tags.createdAt`, `Tags`.`updatedAt` AS `Tags.updatedAt` FROM (SELECT `Book`.`id`, `Book`.`name`, `Book`.`createdAt`, `Book`.`updatedAt` FROM `Books` AS `Book` WHERE ( SELECT `bookId` FROM `Tags` AS `Tags` WHERE (`Tags`.`id` = 1 AND `Tags`.`bookId` = `Book`.`id`) LIMIT 1 ) IS NOT NULL LIMIT 20) AS `Book` INNER JOIN `Tags` AS `Tags` ON `Book`.`id` = `Tags`.`bookId` AND `Tags`.`id` = 1;
```

这明显对于我想要的效果不太符合，其中有两次的 `Tags.id` 的过滤，明显是多余的。
通过查找资料发现这个是 `sequelize` 自带的优化效果，需要设置 `subQuery` 选项为 `false`。

``` js
const db = require('./models');
const Op = db.Sequelize.Op;
async function main() {
    const { Book, Tag } = db;
    const books = await Book.findAll({
        include: [
            {
                model: Tag,
                required: true,
                where: {
                    id: 1,
                }
            }
        ],
        limit: 20,
        subQuery: false,
    });
    console.log(books);
}
```

这样手动关闭自动的子查询优化就得到正常的连接查询了：
``` sql
SELECT `Book`.`id`, `Book`.`name`, `Book`.`createdAt`, `Book`.`updatedAt`, `Tags`.`id` AS `Tags.id`, `Tags`.`name` AS `Tags.name`, `Tags`.`bookId` AS `Tags.bookId`, `Tags`.`createdAt` AS `Tags.createdAt`, `Tags`.`updatedAt` AS `Tags.updatedAt` FROM `Books` AS `Book` INNER JOIN `Tags` AS `Tags` ON `Book`.`id` = `Tags`.`bookId` AND `Tags`.`id` = 1 LIMIT 20;
```

以上对于单条数据是没有问题，但是如果我使用多个 `Tags.id` 来查询 `Book` 的话就有可能出现 `Book` 列表的数据重复。
当然 `Sequlize` 是已经处理了这个重复的问题了，但是还有很多东西没有处理，例如 `count` 还有分页使用关联数据进行排序。


## 更新的 query-was-empty 错误



https://stackoverflow.com/questions/48061748/query-was-empty-nodejs-sequlize/48075383
