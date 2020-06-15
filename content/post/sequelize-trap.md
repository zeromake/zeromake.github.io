---
title: sequelize一些陷阱
date: 2019-09-19T08:58:00.000Z
tags:
  - orm
  - node
  - trap
lastmod: 2019-10-24T07:12:00.000Z
categories:
  - orm
slug: sequelize-trap
draft: false
---

## 前言
- 最近接手一些公司的其它 `node` 项目，`orm` 框架从 `knex` + `bookshelf` 切换到了 `sequelize` 了。
- 在试着像 `knex` + `bookshelf` 一样来使用 `sequelize` 发现了一些问题，记录下来。

<!--more-->

## 模型定义
model/book.js

``` js
module.exports = (sequelize, DataTypes) => {
  const Books = sequelize.define('books', {
    name: DataTypes.STRING
  });
  Books.associate = function(models) {
    const { Books, Tags } = models;
    Books.hasMany(Tags, {
      sourceKey: 'id',
      foreignKey: 'book_id',
    });
  };
  return Books;
};
```

model/tag.js

``` js
module.exports = (sequelize, DataTypes) => {
  const Tags = sequelize.define('tags', {
    name: DataTypes.STRING,
    book_id: DataTypes.INTEGER
  });
  Tags.associate = function(models) {
  };
  return Tags;
};
```

model/index.js
``` js
const fs        = require('fs');
const path      = require('path');
const Sequelize = require('sequelize');
const basename  = path.basename(__filename);
const env       = process.env.NODE_ENV || 'development';
const config    = require('../config/config.js')[env];
const db        = {};
const sequelize = new Sequelize(config);

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    var model = sequelize['import'](path.join(__dirname, file));
    const name = model.name;
    db[name[0].toUpperCase() + name.substring(1)] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.dialect = config.dialect;

module.exports = db;
```

config/config.js

``` js
const defaultConfig = {
  storage: "./test.db",
  dialect: "sqlite",
  define: {
    // 关闭更新和创建时间
    timestamps: false,
    // 字段名格式使用 underscored
    underscored: true,
    // 表名与 model 定义一致
    freezeTableName: true,
  }
};
module.exports = {
  development: defaultConfig,
  test: defaultConfig,
  production: defaultConfig,
};
```

seeders/20190920072110-Init.js
``` js
module.exports = {
  /**
   *
   * @param {import('sequelize').QueryInterface} queryInterface
   * @param {import('sequelize')} Sequelize
   */
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('books', [{
      name: 'Test',
    }], {});
    const [book] = await queryInterface.select(null, 'books', {
      attributes: ['id'],
      limit: 1,
      order: [
        ['id', 'DESC']
      ]
    });
    const id = book.id;
    await queryInterface.bulkInsert('tags', [
      {
        name: 'test',
        book_id: id,
      },
      {
        name: 'tag',
        book_id: id,
      }
    ]);
  },

  /**
   *
   * @param {import('sequelize').QueryInterface} queryInterface
   * @param {import('sequelize')} Sequelize
   */
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('tags', null, {});
    await queryInterface.bulkDelete('books', null, {});
  }
};
```

## 一、表关联 + 分页的奇怪子查询嵌套

例如以上的 `model` 关联情况下，我希望通过 `Tag` 的字段来筛选出 `Book` 的列表。

``` js
const db = require('../models');
const { Books, Tags } = db;
const Op = db.Sequelize.Op;

async function main() {
    const books = await Books.findAll({
        include: [
            {
                model: Tags,
                required: true,
            }
        ],
        limit: 20
    });
    console.log(books);
}
```

最终输出的 `sql` 为一个两层子查询嵌套的语句：
``` sql
SELECT `books`.*, `tags`.`id` AS `tags.id`, `tags`.`name` AS `tags.name`, `tags`.`book_id` AS `tags.book_id` FROM (SELECT `books`.`id`, `books`.`name` FROM `books` AS `books` WHERE ( SELECT `book_id` FROM `tags` AS `tags` WHERE (`tags`.`book_id` = `books`.`id`) LIMIT 1 ) IS NOT NULL LIMIT 20) AS `books` INNER JOIN `tags` AS `tags` ON `books`.`id` = `tags`.`book_id`;
```

这明显对于我想要的效果不太符合，其中有两次的 `tags.id` 的过滤，明显是多余的。
通过查找资料发现这个是 `sequelize` 自带的优化效果，需要设置 `subQuery` 选项为 `false`。

``` js
const db = require('../models');
const { Books, Tags } = db;
const Op = db.Sequelize.Op;

async function main() {
    const books = await Books.findAll({
        subQuery: false,
        include: [
            {
                model: Tags,
                required: true,
            }
        ],
        limit: 20
    });
    console.log(books);
}
```

这样手动关闭自动的子查询优化就得到正常的连接查询了：
``` sql
SELECT `books`.`id`, `books`.`name`, `tags`.`id` AS `tags.id`, `tags`.`name` AS `tags.name`, `tags`.`book_id` AS `tags.book_id` FROM `books` AS `books` INNER JOIN `tags` AS `tags` ON `books`.`id` = `tags`.`book_id` LIMIT 20;
```

以上对于单条数据是没有问题，但是如果我使用多个 `Tags.id` 来查询 `Book` 的话就有可能出现 `Book` 列表的数据重复。
当然 `sequelize` 是已经处理了这个重复的问题了，但是还有很多东西没有处理，例如 `count` 还有分页使用关联数据进行排序。
还有一对多关联的查询问题。


## 二、表关联后的总数问题

``` js
const rawCount = await Books.count();
const count = await Books.count({
    include: [
        {
            model: Tags,
            required: true,
        }
    ],
});
console.log(rawCount, count);
// 1, 2
```
``` sql
SELECT count(`books`.`id`) AS `count` FROM `books` AS `books` INNER JOIN `tags` AS `tags` ON `books`.`id` = `tags`.`book_id`;
```

使用默认的 `count` 去查询会出现一对多重复，然后造成 `count` 的值不正确。

``` js
const rawCount = await Books.count();
const count = await Books.count({
    subQuery: false,
    include: [
        {
            model: Tags,
            required: true,
        }
    ],
});
console.log(rawCount, count);
// 1, 2
```

``` sql
SELECT count(`books`.`id`) AS `count` FROM `books` AS `books` INNER JOIN `tags` AS `tags` ON `books`.`id` = `tags`.`book_id`;
```

就算使用了 `subQuery: false` 也不能解决这个问题，和上面的结果一样还是不正确，而且在 `count` 方法里 `subQuery` 是无效的。

``` js
const rawCount = await Books.count();
const count = await Books.count({
    subQuery: false,
    distinct: true,
    col: 'id',
    include: [
        {
            model: Tags,
            required: true,
        }
    ],
});
console.log(rawCount, count);
```

``` sql
SELECT count(DISTINCT(`books`.`id`)) AS `count` FROM `books` AS `books` INNER JOIN `tags` AS `tags` ON `books`.`id` = `tags`.`book_id`;
```

这里我们可以使用 `distinct` + `col` 来生成 `SELECT COUNT(DISTINCT(books.id)) AS count` 来解决这个问题。
很明显 `sequelize` 几乎对于这种连接表的情况根本没有处理，我这边写了一个简单的 `options` 转换方法，不过是基于 `GROUP BY` 来做的，也许可以考虑从 `bookshelf` 抄过来。

``` js
function countOptions(options) {
    const countOptions = Object.assign({}, options);

    // group use COUNT(DISTINCT(`group`)) 只对需要 group 的做转换
    if(countOptions.group) {
        const group = countOptions.group;
        delete countOptions.group;
        countOptions.distinct = true;
        // 处理 col
        let col = Array.isArray(group) ? group[0] : group;
        // col
        if(col.col) {
            col = col.col;
        }

        if(typeof col === 'string') {
            if(col.includes('.')) {
                col = col.split('.')[1];
            }
        }
        else {
            col = null;
        }
        if(col) {
            countOptions.col = col;
        }
    }
    // del page, order, attributes 删除掉不需要的配置
    delete countOptions.offset;
    delete countOptions.limit;
    delete countOptions.order;
    delete countOptions.attributes;

    return countOptions;
};
```

## 三、表关联后的关联表字段分页+排序问题

``` js
function query(offset = 0) {
    return Books.findAll({
        include: [
            {
                model: Tags,
                required: true,
            }
        ],
        offset,
        limit: 1,
        subQuery: false,
        order: [
            [Tags, 'id', 'DESC']
        ]
    });
}
let books = await query();
const id = books[0].get('id');
books = await query(1);
console.log(id, books[0].get('id'));
// 1, 1
```

``` sql

SELECT `books`.`id`, `books`.`name`, `tags`.`id` AS `tags.id`, `tags`.`name` AS `tags.name`, `tags`.`book_id` AS `tags.book_id` FROM `books` AS `books` INNER JOIN `tags` AS `tags` ON `books`.`id` = `tags`.`book_id` ORDER BY `tags`.`id` DESC LIMIT 0, 1;

SELECT `books`.`id`, `books`.`name`, `tags`.`id` AS `tags.id`, `tags`.`name` AS `tags.name`, `tags`.`book_id` AS `tags.book_id` FROM `books` AS `books` INNER JOIN `tags` AS `tags` ON `books`.`id` = `tags`.`book_id` ORDER BY `tags`.`id` DESC LIMIT 1, 1;
```

以上的明明跳过了一条记录但是取出的 `book` 还是原来那条，这个就是内连接表出现的 `book` 如果一条有多个 `tag` 这个 `book` 也会补全。
上面初始化了一个 `book(1)` 对应的 `tag(1, 2)` 一对多的情况下关闭了 `subQuery` 会造成分页异常。
解决方法为使用 `GROUP BY` 来汇总去重。

``` js
function query(offset = 0) {
    return Books.findAll({
        attributes: ['id'],
        include: [
            {
                attributes: [],
                model: Tags,
                required: true,
            }
        ],
        offset,
        limit: 1,
        subQuery: false,
        group: `${Books.name}.id`,
    });
}
const books1 = await query();
const books2 = await query(1);
console.log(books1.length, books2.length);
// 1, 0
```

``` sql
SELECT `books`.`id` FROM `books` AS `books` INNER JOIN `tags` AS `tags` ON `books`.`id` = `tags`.`book_id` GROUP BY `books`.`id` LIMIT 0, 1;

SELECT `books`.`id` FROM `books` AS `books` INNER JOIN `tags` AS `tags` ON `books`.`id` = `tags`.`book_id` GROUP BY `books`.`id` LIMIT 1, 1;
```


## 四、关闭子查询优化出现的关联数据不全

以上处理完了 `count` 问题还有一些让人难受的问题，比如关闭了 `subQuery` 的话，使用 `findOne` 或者 `limit` 会出现关联的数据不全。

``` js
let book = await Books.findOne({
    include: [
        {
            model: Tags,
            required: true,
        }
    ]
});
let tags = book.get('tags');
const rawLen = tags.length;
// 2

book = await Books.findOne({
    subQuery: false,
    include: [
        {
            model: Tags,
            required: true,
        }
    ]
});
tags = book.get('tags');
const len = tags.length;
// 1
```

``` sql
-- subQuery is close
SELECT `books`.`id`, `books`.`name`, `tags`.`id` AS `tags.id`, `tags`.`name` AS `tags.name`, `tags`.`book_id` AS `tags.book_id` FROM `books` AS `books` INNER JOIN `tags` AS `tags` ON `books`.`id` = `tags`.`book_id` LIMIT 1;
-- subQuery is open
SELECT `books`.*, `tags`.`id` AS `tags.id`, `tags`.`name` AS `tags.name`, `tags`.`book_id` AS `tags.book_id` FROM (SELECT `books`.`id`, `books`.`name` FROM `books` AS `books` WHERE ( SELECT `book_id` FROM `tags` AS `tags` WHERE (`tags`.`book_id` = `books`.`id`) LIMIT 1 ) IS NOT NULL ORDER BY `books`.`id` DESC LIMIT 1) AS `books` INNER JOIN `tags` AS `tags` ON `books`.`id` = `tags`.`book_id` ORDER BY `books`.`id` DESC;
```

很明显关闭了 `subQuery` 虽然得到了更好的 `sql`，但是也破坏了 `sequelize` 的表连接使得 `tags` 无法获得全部。
但是这里有一点如果无需查出关联表数据，或者说我只要关联表的一条数据，是可以使用 `subQuery: false` 的。

## 五、对于 subQuery 和分页的终极方案

``` js
async function findItems(pageOptions, options) {
    const countOptions = Object.assign({}, options);

    // group use COUNT(DISTINCT(`group`))
    if(countOptions.group) {
        const group = countOptions.group;
        delete countOptions.group;
        countOptions.distinct = true;
        let col = Array.isArray(group) ? group[0] : group;
        // col
        if(col.col) {
            col = col.col;
        }

        if(typeof col === 'string') {
            if(col.includes('.')) {
                col = col.split('.')[1];
            }
        }
        else {
            col = null;
        }
        if(col) {
            countOptions.col = col;
        }
    }
    // del page, order, attributes
    delete countOptions.offset;
    delete countOptions.limit;
    delete countOptions.order;
    delete countOptions.attributes;

    const total = await this.count(countOptions);
    // page
    const pageSize = +pageOptions.page_size || 20;
    const pageNum = +pageOptions.page_num || 1;
    options.offset = (pageNum- 1) * pageSize;
    options.limit = pageSize;

    const result = await this.findAll(options);
    return [result, total];
};

module.exports = function(Sequelize) {
    Sequelize.Model.findItems = findItems;
};
```
为 `Model` 类扩展一个静态方法 `findItems` 能够处理上面的大部分分页，总数问题，但是无法解决关联数据缺失。

使用示例：
``` js
const rawCount = await Books.count();
const [_, count] = await Books.findItems({
    page_num: 1,
    page_size: 20
}, {
    subQuery: false, // 不强制设置 subQuery
    include: [
        {
            model: Tags,
            required: true,
        }
    ],
    group: `${Books.name}.id`,
});
console.log(rawCount, count);
// 1, 1
```

``` sql
SELECT count(*) AS `count` FROM `books` AS `books`;
SELECT count(DISTINCT(`books`.`id`)) AS `count` FROM `books` AS `books` INNER JOIN `tags` AS `tags` ON `books`.`id` = `tags`.`book_id`;
SELECT `books`.`id`, `books`.`name`, `tags`.`id` AS `tags.id`, `tags`.`name` AS `tags.name`, `tags`.`book_id` AS `tags.book_id` FROM `books` AS `books` INNER JOIN `tags` AS `tags` ON `books`.`id` = `tags`.`book_id` GROUP BY `books`.`id` LIMIT 0, 20;
```

关联数据缺失得和 `bookshelf` 一样使用两次查询来解决这个问题。

## 六、更新的 sql 错误

``` js
const book = await Books.findOne();
book.set({
    name: undefined,
});
await book.save();
```
以上代码会报错在不同的数据库错误不一样但是都会出错，mysql: **Query was empty**, sqlite: **SQLITE_ERROR: near "WHERE": syntax error**。

这个问题我查了蛮久的，很少资料，然后才发现为什么大家都不会出这个错误，公司项目在连接配置里关闭了 `timestamps` 选项造成了和正常使用 `sequelize` 不同的问题

这个实际上应该算 `bug` 在 `Model.__prop__.set` 时没有处理值为 `undefined` 的设置，但是在生成 `sql` 的时候却过滤了造成 `sql` 语句错误。

处理方法也有很多种一个是开启 `timestamps` 这样每次更新都会有更新时间字段就不会出错了，还有就是提交 `issues` 等 `sequelize` 修。
还有一个紧急方案，那就是 `set` 前我把所有的 `undefined` 的去掉就好了。

``` js

function filterObjectUndefined(obj) {
    const target = {};
    for(const key in obj) {
        if(obj[key] !== undefined) {
            target[key] = obj[key];
        }
    }
    return target;
}

const book = await Books.findOne();
book.set(filterObjectUndefined({
    name: undefined,
}));
await book.save();
```

## 六、参考

- [query-was-empty-nodejs-sequelize](https://stackoverflow.com/questions/48061748/query-was-empty-nodejs-sequlize/48075383)
- [本文代码](https://github.com/zeromake/sequelize-demo)
