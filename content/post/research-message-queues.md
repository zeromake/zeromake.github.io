---
title: 调研消息队列
date: 2022-11-17T16:16:00 +08:00
tags:
  - go
  - mq
lastmod: 2022-11-17T16:16:00 +08:00
categories:
  - go
  - php
  - mq
slug: research-message-queues
draft: false
---

## 前言

公司之前使用的消息队列方案由于是云平台提供的按次费的产品，这种产品都有一个问题，就是项目流量用户访问量上去以后就会不划算了，但是由于是平台的产品不存在直接替代品，并且为了方便维护要求是云平台上有提供的消息队列服务，这边选择 `Kafka`，`Redis` 的使用方式来调研。


## 一、`Kafka`、`Redis` 部署

由于时间关系就不搞什么特别的部署方式全部走 `docker` 快速部署了。

**Redis**

``` bash
docker pull redis

docker run -d --name redis -p 6379:6379 redis
```

**Kafka**

``` bash
# curl -L -o docker-compose.yml https://raw.githubusercontent.com/bitnami/containers/main/bitnami/kafka/docker-compose.yml
cat > docker-compose.yml <<EOF
version: "2"

services:
  zookeeper:
    image: docker.io/bitnami/zookeeper:3.8
    ports:
      - "2181:2181"
    volumes:
      - "zookeeper_data:/bitnami"
    environment:
      - ALLOW_ANONYMOUS_LOGIN=yes
  kafka:
    image: docker.io/bitnami/kafka:3.3
    ports:
      - "9092:9092"
    volumes:
      - "kafka_data:/bitnami"
    environment:
      - KAFKA_CFG_LISTENERS=PLAINTEXT://:9092
      - KAFKA_CFG_ADVERTISED_LISTENERS=PLAINTEXT://127.0.0.1:9092
      - KAFKA_CFG_ZOOKEEPER_CONNECT=zookeeper:2181
      - ALLOW_PLAINTEXT_LISTENER=yes
    depends_on:
      - zookeeper

volumes:
  zookeeper_data:
    driver: local
  kafka_data:
    driver: local
EOF

docker-compose up -d
```


## 二、Redis 的 stream 使用


下面用 go 调用 redis 描述了一个简单的生产消费逻辑。

``` go
package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"github.com/go-redis/redis/v8"
)

var streamKey = "redis_stream"

// 生产者
func produce(ctx context.Context) {
	var err error
	defer func() {
		if err != nil {
			log.Println("produce err:", err)
		}
	}()
	cli := redis.NewClient(&redis.Options{
		Addr:     os.Getenv("REDIS_HOST") + ":" + os.Getenv("REDIS_PORT"),
		Password: os.Getenv("REDIS_PASS"),
		DB:       0,
		PoolSize: 10,
	})
	timer := time.NewTimer(time.Minute)
	timer.Stop()
	var id int
	for {
		id++
		_, err = cli.XAdd(ctx, &redis.XAddArgs{
            Stream: streamKey,
			MaxLen: 100,
            // 链表实现是一个树 Approx 表示让 redis 优化删除逻辑，这个 stream 可能会超过 100，但是不会小于 100
			Approx: true,
            Values: []string{
                "id",
                strconv.FormatInt(int64(id), 10),
                "name",
                "value2",
		    }}).Result()
		if err != nil {
			return
		}
		log.Println("produce:", id)
		timer.Reset(time.Second)
		select {
		case <-timer.C:
		case <-ctx.Done():
			return
		}
	}
}


// 消费者
func consume(ctx context.Context) {
	var err error
	defer func() {
		if err != nil {
			log.Println("consume err:", err)
		}
	}()
	cli := redis.NewClient(&redis.Options{
		Addr:     os.Getenv("REDIS_HOST") + ":" + os.Getenv("REDIS_PORT"),
		Password: os.Getenv("REDIS_PASS"),
		DB:       0,
		PoolSize: 10,
	})
	var id int
	var result []redis.XStream
    var prevId string = "0"
	for {
		id++
		result, err = cli.XRead(ctx, &redis.XReadArgs{
            // 0 代表从该 stream 顶部开始读取，$ 代表最新的，旧数据不再处理，当然只有第一次调用这么做，后面应该是每次的数组的最后一个 id。
			Streams: []string{streamKey, prevId},
			Block:   time.Minute,
		}).Result()
		if err != nil {
			return
		}
		for _, item := range result {
			for _, message := range item.Messages {
				log.Println("consume:", message.ID, message.Values)
                prevId = message.ID
			}
		}
        // stream 是定长的无需再处理删除问题，不过没有处理消费游标，服务退出后就丢弃了游标，需要这种强消费的应该用 xreadgroup 来做游标保持。
	}
}

func initSignal() {
	var gracefulStop = make(chan os.Signal, 1)
	signal.Notify(gracefulStop, syscall.SIGTERM, syscall.SIGINT)
	<-gracefulStop
}

func main() {
	ctx, cancel := context.WithCancel(context.Background())
	var cmd = "all"
	if len(os.Args) > 1 {
		cmd = os.Args[1]
	}
	if cmd == "produce" {
		go produce(ctx)
	} else if cmd == "consume" {
		go consume(ctx)
	} else {
		go produce(ctx)
		go consume(ctx)
	}
	initSignal()
	cancel()
}

```


`php` 也差不多，只是 `predis` 没有封装 `stream` 的命令方法需要走 `executeRaw` 方法。
```php
<?php

require 'vendor/predis/predis/src/Autoloader.php';

Predis\Autoloader::register();

$streamKey = "redis_stream";

$client = new Predis\Client([
    'scheme' => 'tcp',
    'host'   => '127.0.0.1',
    'port'   => 6379,
]);

function produce() {
    global $client;
    global $streamKey;
    $id = 1;
    $err = null;
    while (True) {
        $client->executeRaw(["XADD", $streamKey, "MAXLEN", "~", "100", "*", "id", "".$id, "name", "vvv"]);
        echo "produce: ", $id, PHP_EOL;
        sleep(1);
        $id++;
    }
}

function consume() {
    global $client;
    global $streamKey;
    $prevId = "0";
    while (True) {
        $result = $client->executeRaw(["XREAD", "BLOCK", "50000", "STREAMS", $streamKey, $prevId]);
        if ($result != null && count($result) > 0) {
            foreach ($result as $item) {
                foreach (array_slice($item, 1) as $arr) {
                    foreach ($arr as $item2) {
                        $prevId = $item2[0];
                        echo "consume: ", $item2[0], json_encode($item2[1]), PHP_EOL;
                    }
                }
            }
        }
    }
}

$cmd = "produce";

if ($argc > 1) {
    $cmd = $argv[1];
}

if ($cmd == "produce") {
    produce();
} elseif ($cmd == "consume") {
    consume();
}

```

刚整 php 脚本示例请自行使用 `php steam.php produce` 和 `php steam.php consume` 启动两个不同的进程。

## 三、`Kafka` 使用

运行以下示例会发现 `kafka` 的消费感觉并没有那么及时，实际上是因为 `kafka` 是以收到字节计数到达 min 才会开始消费模式，毕竟 `kafka` 的主要用途还是日志传递。

``` go
package main

import (
	"context"
	"github.com/segmentio/kafka-go"
	"log"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"
)

const (
	broker  = "127.0.0.1:9092"
	topic   = "local-topic"
	groupId = "local-group"
)

func initSignal() {
	var gracefulStop = make(chan os.Signal, 1)
	signal.Notify(gracefulStop, syscall.SIGTERM, syscall.SIGINT)
	<-gracefulStop
}

func main() {
	ctx, cancel := context.WithCancel(context.Background())
	var cmd = "all"
	if len(os.Args) > 1 {
		cmd = os.Args[1]
	}
	if cmd == "produce" {
		go produce(ctx)
	} else if cmd == "consume" {
		go consume(ctx)
	} else if cmd == "create" {
		createTopic(ctx)
		return
	} else {
		go produce(ctx)
		go consume(ctx)
	}
	initSignal()
	cancel()
}

func createTopic(ctx context.Context) {
	conn, err := kafka.Dial("tcp", broker)
	if err != nil {
		panic(err.Error())
	}
	defer conn.Close()
	topicConfigs := []kafka.TopicConfig{
		{
			Topic:             topic,
			NumPartitions:     1,
			ReplicationFactor: 1,
		},
	}
	err = conn.CreateTopics(topicConfigs...)
	if err != nil {
		panic(err.Error())
	}
}

func produce(ctx context.Context) {
	var err error
	defer func() {
		if err != nil {
			log.Println("produce err:", err)
		}
	}()
	writer := kafka.Writer{
		Addr:     kafka.TCP(broker),
		Topic:    topic,
		Balancer: &kafka.LeastBytes{},
	}
	timer := time.NewTimer(time.Minute)
	timer.Stop()
	var id int64
	for {
		err = writer.WriteMessages(ctx, kafka.Message{
			Key:   []byte("id"),
			Value: []byte(strconv.FormatInt(id, 10)),
		})
		if err != nil {
			return
		}
		log.Println("produce:", id)
		id++
		timer.Reset(time.Second)
		select {
		case <-timer.C:
		case <-ctx.Done():
			return
		}
	}
}

func consume(ctx context.Context) {
	var err error
	defer func() {
		if err != nil {
			log.Println("consume err:", err)
		}
	}()
	reader := kafka.NewReader(kafka.ReaderConfig{
		Brokers:        []string{broker},
		GroupID:        groupId,
		Topic:          topic,
		MinBytes:       1,    // 10KB
		MaxBytes:       10e6, // 10MB
		CommitInterval: time.Second,
	})
	var m kafka.Message
	for {
		m, err = reader.ReadMessage(ctx)
		if err != nil {
			break
		}
		log.Printf("message at topic/partition/offset %v/%v/%v: %s = %s\n", m.Topic, m.Partition, m.Offset, string(m.Key), string(m.Value))
	}
	err = reader.Close()
}
```

## 参考

- [Redis之Stream](https://www.cnblogs.com/bruceChan0018/p/15764320.html)
- [Redis之Stream](https://blog.csdn.net/cainiao1412/article/details/122348103)
- [简悦 · Redis 教程](http://redis.jianyue.wiki/commands/xadd)
- [Redis Streams 介绍](http://www.redis.cn/topics/streams-intro.html)