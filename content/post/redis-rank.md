---
title: 使用 Redis 做排行榜
date: 2021-04-07T11:51:00Z
tags:
  - redis
  - sort-set
lastmod: 2021-12-20T18:51:00Z
categories:
  - game
slug: redis-rank
draft: false
---

## 前言

## 一、需求

1. 用户打开排行榜及加入该排行榜。
2. 排行榜以排行榜积分和加入排行榜时间来排序。
3. 排行榜满一定数量就开始分榜，每个分榜单独进行排名。
4. 排行榜有段位晋升掉段，每个段位的晋升掉段比率不同。
5. 前多少名有特殊奖励在下一次入榜时。
6. 排行榜有周期刷新，刷新后根据上一次的名次进行段位变动。

## 二、设计

**排行榜存储**

通过以上的需求，排行榜的访问会是非常频繁的，更新也是不少的，这样的情况直接放数据库的话必然要加缓存，但是要求明显是非常实时，使用数据库加缓存是不行的。
查了一下资料发现很多排行榜的实现依赖于 `Redis` 的 `Sorted Sets`。

`Sorted Sets` 说是 set 但是用起来非常的像一个 `map[string]float64` 不过是默认按 value, key 的方式升序的，也支持倒序。
通过 `ZADD`, `ZREVRANGE` 的 `redis` 命令就可以完成排行榜写入和排行榜读出了。

**排行榜分榜**

先不考虑排行榜周期，也不考虑多个档次的分别要分榜，要求是每个排行榜到达固定人数，就新开一个榜单，这样我在 `redis` 里用一个 `Incr` 数据就解决了。

新加入一个榜单直接对这个榜单人数做 `Incr` 操作，再用 `math.Ceil()` 方法对总榜单人数向上取余，这样就可以根据每个榜单的人数去分榜了。

然后现在再考虑档次和周期的问题，这里我设计为把多个档次的排行榜用户数量组装为一个 `HASH`，然后再把每个 `HASH` 作为一个周期的。

**用户的排行榜数据**

由于 `Sorted Sets` 本身无法存放更多的信息，但是我们也要存放一些例如用户是否加入了榜单，榜单的key，榜单的档次，榜单是否已经过期。

并且还能够存放一些用户的头像昵称的数据，防止这些排行榜必须的数据必须要去数据库重新取，毕竟排行榜的访问必然是非常高频的。


## 三、排行名次存取

> 核心内容就在这里了，使用 redis 的 sort set 做高性能的排行榜。

一个实时的排行榜需求便是高更新率，而之前做过的都是一些定时发布排行榜，也就是直接把用户的数据存入 db 然后在截止时间去统一计算，而这种并不能应付高更新的情况下同时实时的计算排行榜。

添加分数和更新分数
```bash
> zadd rank_key 0 user1
> (integer) 1
> zadd rank_key 20 user3
> (integer) 2
> zadd rank_key 100 user2
> (integer) 3
```

查询排行榜按分数倒序(注意两个数字为排名从 0 开始，并且均为闭区间，-1 代表无限大)

```bash
# 取所有
> zrevrank rank_key 0 -1 withscores
> 1) "user2"
> 2) "100"
> 3) "user3"
> 4) "20"
> 5) "user1"
> 6) "0"
# 前几名
> zrevrank rank_key 0 1 withscores
> 1) "user2"
> 2) "100"
> 3) "user3"
> 4) "20"
```

当然这个方案实际上是有问题的，这里我的需求是越早入榜的用户排越前面，而上面的方案就会出现同分的会按字典续排序，有两种方案去解决他。

**3.1 在分数里记录入榜顺序**

在分数里记录顺序，如果是顺序序列的数字，并且不会一个榜太大的话比较推荐放这里

```go
func generateScore(originScore, number int64) float64 {
    // 记得序号要是倒序
    return float64(originScore * 1000 + number)
}
```
不过由于 `redis` 用的 c 语言的 `double` 有上限的 `2^53-1`。


**3.2 在key里记录入榜顺序**

这个方案比较通用，不会出现榜单人过多导致分数的范围放不下，不过需要注意一下 key 的排序是按字符串排序的。

```go
func generateKey(originKey string, number int64) string {
    // 记得自己补零，记得序号要是倒序
    return fmt.Sprintf("%d:%s", number, originKey)
}
```


## 四、排行榜分榜

因为需求，需要对排行榜做限制，一个排行榜里只有 100 人，然后大家的排名只在榜内生效。

通过一个 `redis` 存放每个子榜的人数，然后使用 `HIncrBy` 就可以知道新加入的用户需要分配到第几个榜单。
```go
func JoinRankTypeNumber(ctx context.Context, key, mkey string) (string, error) {
	count, err := redis.HIncrBy(ctx, key, mkey, 1)
	if err != nil {
		return 0, err
	}
	rankTypeNumber := int(math.Ceil(float64(count) / float64(100)))
	return fmt.String(rankTypeNumber), nil
}
```
## 五、排行榜的周期切换

实际上这个更简单，只需要在上面使用到的 `key` 里去拼接入周期切换的数字或者字符串 `key`。

```go
const (
	RankCount      = "rank_%d" // rank_周期 map存放每个子榜的数量
	RankSet        = "rank_%d_%d_%d" // rank_周期_子榜单_第几个分榜 zset存放榜单数据
)
```

## 参考

- [redis的命令参考](http://www.redis.cn/commands.html#sorted_set)
- [使用Redis的有序集合实现排行榜功能](https://juejin.cn/post/6844903795131056135)
- [REdis zset和double](https://www.cnblogs.com/aquester/p/10769827.html)
