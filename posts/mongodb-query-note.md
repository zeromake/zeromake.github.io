---
title: Mongodb一些查询笔记
date: 2020-06-11 15:24:00+08:00
type: note
tags: [mongodb, db, note]
last_date: 2020-06-11 15:24:00+08:00
private: false
---

## 一、 $elemMatch 如何查询字段不为指定值的记录

```js
db.x.insert({"index": [{"id": "index-1", "value": "1"}]})
db.x.insert({"index": [{"id": "index-2", "value": "2"}]})
db.x.find({
    "index": {
        "$not": {
            "$elemMatch": {
                "id": "index-1"
            }
        }
    }
})
db.x.find({
    "index": {
        "$not": {
            "$elemMatch": {
                "id": "index-2"
            }
        }
    }
})
```

## 二、$elemMatch 查询字段值为空值

```js
db.x.insert({"index": [{"id": "index-1", "value": ""}]})
db.x.insert({"index": [{"id": "index-1", "value": null}]})
db.x.find({
    "index": {
        "$elemMatch": {
            "id": "index-1",
            "$or": [
                {"value": ""},
                {"value": null}
            ]
        }
    }
})
```

## 三、$elemMatch 查询字段值不为指定值，或者值对且另一个字段为空值的记录

```js
db.x.find({
    "$or": [
        // 匹配字段 id 值不为 index-1 的记录
        {
            "index": {
                "$not": {
                    "$elemMatch": {
                        "id": "index-1"
                    }
                }
            }
        },
        // 匹配字段 id 值为 index-1 的记录，字段 value 去匹配空值
        {
            "index": {
                "$elemMatch": {
                    "id": "index-1",
                    "$or": [
                        {"value": ""},
                        {"value": null}
                    ]
                }
            }
        }
    ]
})
```


### 四、$elemMatch 查询字段值为指定值，且另一个字段不为空值的记录

```js
db.x.find({
    "index": {
        "$elemMatch": {
            "id": "index-1",
            "$and": [
                {"value": {"$ne": ""}},
                {"value": {"$ne": null}}
            ]
        }
    }
})
```


## 五、参考

- [mongodb-query-doc](https://docs.mongodb.com/manual/reference/operator/query/)
