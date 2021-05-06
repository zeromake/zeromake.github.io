---
title: 设计模式笔记
date: 2019-12-28T05:25:00.000Z
tags:
  - design
  - patterns
lastmod: 2021-04-30 17:36:00 +08:00
categories:
  - patterns
slug: design-patterns
draft: true
---

## 前言
- 前段时间面试发现各种设计模式并未正确使用，而且很多设计模式明明在用却不知道是什么设计模式。
- 记录一下这些设计模式。

<!--more-->

## 一、策略模式(Strategy Pattern) {#strategy_pattern}

> 定义一系列的算法,把它们一个个封装起来, 并且使它们可相互替换。

例如以下例子文件保存逻辑可以随意替换。

- 优点:
    1. 算法可以自由切换。
    2. 避免使用多重条件判断。
    3. 扩展性良好。
- 缺点:
    1. 策略类会增多。
    2. 所有策略类都需要对外暴露。
- 使用场景：
    1. 如果在一个系统里面有许多类，它们之间的区别仅在于它们的行为，那么使用策略模式可以动态地让一个对象在许多行为中选择一种行为。
    2. 一个系统需要动态地在几种算法中选择一种。
    3. 如果一个对象有很多的行为，如果不用恰当的模式，这些行为就只好使用多重的条件选择语句来实现。

``` go
// 声明一个
type File interface {
    Save(name string, r io.Reader, size int64) error
}

type LocalFile struct {

}
// 保存到本地
func Save(name string, r io.Reader, size int64) error {
    // ……
}

type RemoteFile struct {

}
// 保存到远端
func Save(name string, r io.Reader, size int64) error {
    // ……
}

type Upload struct {
    file File
}

func (u *Upload) Upload(req *http.Request, resp http.ResponseWriter) {
    // ……
    u.file.Save()
}

```

## 二、观察者模式(Observer Pattern) {#observer_pattern}

> 定义对象间的一种一对多的依赖关系，当一个对象的状态发生改变时，所有依赖于它的对象都得到通知并被自动更新。

- 优点：
    1. 观察者和被观察者是抽象耦合的。
    2. 建立一套触发机制。
- 缺点：
    1. 如果一个被观察者对象有很多的直接和间接的观察者的话，将所有的观察者都通知到会花费很多时间。
    2. 如果在观察者和观察目标之间有循环依赖的话，观察目标会触发它们之间进行循环调用，可能导致系统崩溃。
    3. 观察者模式没有相应的机制让观察者知道所观察的目标对象是怎么发生变化的，而仅仅只是知道观察目标发生了变化。

例如以下例子：

```go

type Observer interface {
    Update(...interface{}) error
}

type Subject interface {
    RegisterObserver(Observer)
    RemoveObserver(Observer)
    // 通知方法不是必须暴露的
    NotifyObservers(...interface{}) error
}

type SubjectImp struct {
    observers []Observer
}

func (s *SubjectImp) RegisterObserver(o Observer) {
    s.observers = append(s.observers, o)
}

func (s *SubjectImp) RemoveObserver(o Observer) {
    observers := []Observer
    for _, ob := range observers {
        if ob != o {
            observers = append(observers, ob)
        }
    }
    s.observers = observers
}

func (s *SubjectImp) NotifyObservers(args ...interface{}) (err error) {
    for _, ob := range observers {
        err = ob.Update(args...)
        if err != nil {
            return
        }
    }
}

```
## 三、装饰器模式(Decorator Pattern) {#decorator_pattern}

> 允许向一个现有的对象添加新的功能，同时又不改变其结构。这种类型的设计模式属于结构型模式，它是作为现有的类的一个包装。

- 优点：装饰类和被装饰类可以独立发展，不会相互耦合，装饰模式是继承的一个替代模式，装饰模式可以动态扩展一个实现类的功能。
- 缺点：多层装饰比较复杂。

示例可以见 `io.Reader` 的包装 `bufio.Reader`。

## 四、工厂模式(Factory Pattern) {#factory_pattern}

> 定义一个创建对象的接口，让其子类自己决定实例化哪一个工厂类，工厂模式使其创建过程延迟到子类进行。

- 优点：
    1. 一个调用者想创建一个对象，只要知道其名称就可以了。
    2. 扩展性高，如果想增加一个产品，只要扩展一个工厂类就可以。
    3. 屏蔽产品的具体实现，调用者只关心产品的接口。
- 缺点：每次增加一个产品时，都需要增加一个具体类和对象实现工厂，使得系统中类的个数成倍增加，在一定程度上增加了系统的复杂度，同时也增加了系统具体类的依赖。这并不是什么好事。

示例构建不同的接口实现，或者参考各种 `orm` 的数据库连接切换方式。

```go
// 如果是需要实例化参数请使用 struct
func Factory(name string) File {
    switch name {
        case "local":
            return new(LocalFile)
        case "remote":
            return new(RemoteFile)
        default:
            return nil
    }
}

func main() {
    file1 := Factory("local")
    file2 := Factory("remote")
}

```

## 五、抽象工厂模式(Abstract Factory Pattern) {#abstract_factory_pattern}
> 提供一个创建一系列相关或相互依赖对象的接口，而无需指定它们具体的类。

- 优点：当一个产品族中的多个对象被设计成一起工作时，它能保证客户端始终只使用同一个产品族中的对象。
- 缺点：产品族扩展非常困难，要增加一个系列的某一产品，既要在抽象的 Creator 里加代码，又要在具体的里面加代码。

## 六、单例模式(Singleton Pattern) {#singleton_pattern}
> 保证一个类仅有一个实例，并提供一个访问它的全局访问点。

- 优点：
    1. 在内存里只有一个实例，减少了内存的开销，尤其是频繁的创建和销毁实例（比如管理学院首页页面缓存）。
    2. 避免对资源的多重占用（比如写文件操作）。
- 缺点：没有接口，不能继承，与单一职责原则冲突，一个类应该只关心内部逻辑，而不关心外面怎么样来实例化

例如 `http.DefaultTransport` 就是一个全局单例。

``` go
var DefaultTransport RoundTripper = &Transport{
    // ……
}
```

## 七、命令模式(Command Pattern) {#command_pattern}
> 将一个请求封装成一个对象，从而使您可以用不同的请求对客户进行参数化。

- 优点：
    1. 降低了系统耦合度。
    2. 新的命令可以很容易添加到系统中去。
- 缺点：使用命令模式可能会导致某些系统有过多的具体命令类。
- 使用场景：认为是命令的地方都可以使用命令模式，比如： 1、GUI 中每一个按钮都是一条命令。 2、模拟 CMD, 3、日志输出。

```go
type Execute interface {
    Execute()
}

type ExecuteManager struct {
    executes []Execute
}

func (e *ExecuteManager) Execute() {
    for execute := range e.executes {
        execute.Execute()
    }
}

func (e *ExecuteManager) Add(execute Execute) {
    e.executes = append(e.executes, execute)
}

```

## 八、适配器模式(Adapter Pattern) {#adapter_pattern}
> 将一个类的接口转换成客户希望的另外一个接口。适配器模式使得原本由于接口不兼容而不能一起工作的那些类可以一起工作。

- 优点：
    1. 可以让任何两个没有关联的类一起运行。
    2. 提高了类的复用。
    3. 增加了类的透明度。
    4. 灵活性好。
- 缺点：
    1. 过多地使用适配器，会让系统非常零乱，不易整体进行把握。比如，明明看到调用的是 A 接口，其实内部被适配成了 B 接口的实现，一个系统如果太多出现这种情况，无异于一场灾难。因此如果不是很有必要，可以不使用适配器，而是直接对系统进行重构。
    2. 由于 JAVA 至多继承一个类，所以至多只能适配一个适配者类，而且目标类必须是抽象类。
- 使用场景：有动机地修改一个正常运行的系统的接口，这时应该考虑使用适配器模式。

实际实现与策略模式相同，不同的是适配器只有一个入口执行，而策略模式需要主动在入口传入策略。


## 九、外观模式(Facade Pattern) {#facade_pattern}
> 为子系统中的一组接口提供一个一致的界面，外观模式定义了一个高层接口，这个接口使得这一子系统更加容易使用。

- 优点： 1、减少系统相互依赖。 2、提高灵活性。 3、提高了安全性。
- 缺点：不符合开闭原则，如果要改东西很麻烦，继承重写都不合适。
- 使用场景： 1、为复杂的模块或子系统提供外界访问的模块。 2、子系统相对独立。 3、预防低水平人员带来的风险。

## 十、模板模式(Template Pattern) {#template_pattern}
> 定义一个操作中的算法的骨架，而将一些步骤延迟到子类中。模板方法使得子类可以不改变一个算法的结构即可重定义该算法的某些特定步骤。

- 优点：
    1. 封装不变部分，扩展可变部分。
    2. 提取公共代码，便于维护。
    3. 行为由父类控制，子类实现。
- 缺点：每一个不同的实现都需要一个子类来实现，导致类的个数增加，使得系统更加庞大。
- 使用场景：
    1. 有多个子类共有的方法，且逻辑相同。
    2. 重要的、复杂的方法，可以考虑作为模板方法。

```go
// 由于 go 没有抽象继承使用接口
type Game interface {
    Initialize()
    Start()
    End()
}

type GameManager struct {
    g Game
}

func (g *GameManager) Play() {
    g.g.Initialize()
    g.g.Start()
    g.g.End()
}

```

## 十一、迭代器模式
> 提供一种方法顺序访问一个聚合对象中各个元素, 而又无须暴露该对象的内部表示。

- 优点： 1、它支持以不同的方式遍历一个聚合对象。 2、迭代器简化了聚合类。 3、在同一个聚合上可以有多个遍历。 4、在迭代器模式中，增加新的聚合类和迭代器类都很方便，无须修改原有代码。
- 缺点：由于迭代器模式将存储数据和遍历数据的职责分离，增加新的聚合类需要对应增加新的迭代器类，类的个数成对增加，这在一定程度上增加了系统的复杂性。
- 使用场景： 1、访问一个聚合对象的内容而无须暴露它的内部表示。 2、需要为聚合对象提供多种遍历方式。 3、为遍历不同的聚合结构提供一个统一的接口。

```go
// go 不支持自定义迭代器，但是有替代品
type Map struct {}

func Range(r func(k, v interface{}) bool) {
    for{
        ok := r(k, v)
        if !ok {
            return
        }
    }
}

```

## 十二、组合模式(Composite Pattern) {#composite_pattern}


## 十三、状态模式


## 参考

1. [设计模式](https://refactoringguru.cn/design-patterns/catalog)