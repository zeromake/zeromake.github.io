---
title: gd32vw553 开发板入门笔记（带 LCD1062 驱动）
date: 2025-05-25 16:28:26 +08:00
tags:
  - embedded
  - c
  - hardware
lastmod: 2025-05-25 16:28:26 +08:00
categories:
  - embedded
slug: gd32vw553-introductory
draft: false
---


## 前言

最近开始玩嵌入式，看到 iceasy 在做样品评测活动就申请了一片，这里记录一下点灯和点 1602 LCD 屏的过程。

## 一、资源下载与环境搭建


先去 [RISC-V 下载专区](https://www.iceasy.com/cloud/RISC-V?pid=0)，下载 《GD32VW553-IOT开源硬件下载资料》条目后的一个打包下载。

这篇文章中只用到以下文件：

- GD32VW553-IOT开源硬件下载资料/应用软件/GD32AllInOneProgrammer_win_V4.2.10.28180.7z -> 串口下载工具。
- GD32VW553-IOT开源硬件下载资料/应用软件/GD32EmbeddedBuilder_v1.4.12.28625.7z -> GD32 基于 Eclipse 制作的集成 ide，内置了 RISC-V 编译器和 GD32VW553-IOT 的硬件库支持。

解压即可完成搭建。

![unzip](/public/img/gd32vw553/unzip.webp)


## 二、使用 GD32EmbeddedBuilder 创建默认点灯项目

建议参考 [样片外观及GPIO测评](https://www.iceasy.com/review/1907819582555959297)

也没什么好写的就是简单步骤：
1. 新建一个 c 项目。
2. 填写项目名称，选择为 RISC-V 编译环境。
3. 选择 GD32VW553HMQ7 芯片型号。

完成后就会有一个默认点灯的程序


![new-project0](/public/img/gd32vw553/new-project0.webp)

![new-project1](/public/img/gd32vw553/new-project1.webp)

![new-project2](/public/img/gd32vw553/new-project2.webp)

![new-project3](/public/img/gd32vw553/new-project3.webp)


## 三、官方点灯项目源码解析


``` c
#include "gd32vw55x.h"
#include "systick.h"
#include <stdio.h>
#include "main.h"
#include "gd32vw553h_eval.h"

// 中断函数会调用这个 1ms 一次，所以刚好是 500ms 切换一次
void led_spark(void)
{
  static __IO uint32_t timingdelaylocal = 0U;
  if(timingdelaylocal) {
    if(timingdelaylocal < 500U) {
      gd_eval_led_on(LED2);
      gd_eval_led_on(LED3);
    } else {
      gd_eval_led_off(LED2);
      gd_eval_led_off(LED3);
    }

    timingdelaylocal--;
  } else {
    timingdelaylocal = 1000U;
  }
}

/*!
    \brief      main function
    \param[in]  none
    \param[out] none
    \retval     none
*/
int main(void)
{
#ifdef __FIRMWARE_VERSION_DEFINE
  uint32_t fw_ver = 0;
#endif /* __FIRMWARE_VERSION_DEFINE */

  // 应该是初始化系统时钟
  systick_config();
  // 应该是初始化中断
  eclic_priority_group_set(ECLIC_PRIGROUP_LEVEL3_PRIO1);
  // 初始化几个 GPIO
  gd_eval_led_init(LED1);
  gd_eval_led_init(LED2);
  gd_eval_led_init(LED3);
  // 开启 USART，也就是串口通信
  gd_eval_com_init(EVAL_COM0);
  // 初始化一个 GPIO 为按键模式
  gd_eval_key_init(KEY_TAMPER_WAKEUP, KEY_MODE_GPIO);

#ifdef __FIRMWARE_VERSION_DEFINE
  fw_ver = gd32vw55x_firmware_version_get();
  /* print firmware version */
  printf("\r\nGD32VW55X series firmware version: V%d.%d.%d", (uint8_t)(fw_ver >> 24), (uint8_t)(fw_ver >> 16), (uint8_t)(fw_ver >> 8));
#endif /* __FIRMWARE_VERSION_DEFINE */

  // 打印硬件状态
  printf("\r\nCK_SYS is %d\r\n", rcu_clock_freq_get(CK_SYS));
  printf("\r\nCK_AHB is %d\r\n", rcu_clock_freq_get(CK_AHB));
  printf("\r\nCK_APB1 is %d\r\n", rcu_clock_freq_get(CK_APB1));
  printf("\r\nCK_APB2 is %d\r\n", rcu_clock_freq_get(CK_APB2));

  while(1) {
    // 检查 PA1 的状态，也就是按键按下
    if(RESET == gd_eval_key_state_get(KEY_TAMPER_WAKEUP)) {
      delay_1ms(50);
      if(SET == gd_eval_key_state_get(KEY_TAMPER_WAKEUP)) {
        // 按键抬起就切换，效果就是
        gd_eval_led_toggle(LED1);
      }
    }
  }
}

```

## 四、下载程序

> 下载程序有个 usb-ttl 就行了，想调试的话得买 `gd-link` 或者 `jlink v9`，我手里用的 `CH341A` 的 ttl 和另一个 `DAPLink` 的 ttl。

直接用之前新建的项目编译后获得一个 10+KB 的 xxx.bin 文件，打开 GD32 All In One Programmer 选择好文件。


![build](/public/img/gd32vw553/build.webp)

用 ttl 方式连接开发板（可以用 ch341 或者各种 link 的 ttl 模式），插上后会看到串口多出一个，我这里是 COM3。

选择对应 COM 口，直接点 Connect 是不行的，因为这个开发板没有做下载按钮，记得先把开发板上的 r4 r5 直接短接（接个 100Ω 电阻也行）。

![connect](/public/img/gd32vw553/connect-error.webp)

你要手动用跳线帽改了以后， boot0 设置为 1，按 reset 按键。

然后点连接就会连接上了，点击右手边的下载就会下载到开发板里了。

![download](/public/img/gd32vw553/download.webp)


这个开发板的跳线帽比较松，我掉了一个直接把 boot1 的 0 接线直接焊死了。

ttl 接线

![ttl](/public/img/gd32vw553/ttl.webp)

缺少的丝印

![jump0](/public/img/gd32vw553/jump0.webp)

焊接了 r4 r5 的情况，下图情况是 boot0 = 0, boot1 = 0。

![jump1](/public/img/gd32vw553/jump1.webp)


## 五、led 灯电路

这里用面包板把电路搭起来，原理就是 led 灯正极接 1k 电阻再接 3.3v 电源，负极接程序里的 GPIO 口。

搭建完硬件电路把开发板放上去，并且把 boot0 调整回 0， type-c 上电后就能看到 LED2，LED3 在间断闪烁，LED1 在长亮。

![lde](/public/img/gd32vw553/lde.webp)

## 六、LCD1062 驱动代码

搜了老半天全网没有找到有人用 GD32 玩 LCD1602，然后就参考 51 的 4 线版本做了一个，实际上大部分逻辑是不用自己写的，核心就三个函数。

``` c
// 对应 LCD1602 上面的 7 个引脚，由于全是 GPIOA 就不定义 PORT 了，只定义 PIN
#define LCD_RS_PIN    	GPIO_PIN_4  // PA4
#define LCD_RW_PIN    	GPIO_PIN_5  // PA5 这个可以省掉，直接接 GND
#define LCD_E_PIN     	GPIO_PIN_6  // PA6

#define LCD_D4_PIN    	GPIO_PIN_0  // PA0
#define LCD_D5_PIN    	GPIO_PIN_1  // PA1
#define LCD_D6_PIN    	GPIO_PIN_2  // PA2
#define LCD_D7_PIN    	GPIO_PIN_3  // PA3

#include "gd32vw55x.h"
#include "systick.h"

#define LCD1602_RS_L() GPIO_BC(GPIOA) = LCD_RS_PIN
#define LCD1602_RS_H() GPIO_BOP(GPIOA) = LCD_RS_PIN

#define LCD1602_RW_L() GPIO_BC(GPIOA) = LCD_RW_PIN
#define LCD1602_RW_H() GPIO_BOP(GPIOA) = LCD_RW_PIN

#define LCD1602_E_L() GPIO_BC(GPIOA) = LCD_E_PIN
#define LCD1602_E_H() GPIO_BOP(GPIOA) = LCD_E_PIN

// 等待 1us
static void delay_us(uint32_t us)
{
  uint32_t i = us * 160;
  while (i--) {}
}


// 初始化所有用到的 GPIO 为输出模式，且无上下拉电阻模式，并且全部设置为低位
void LCD1602_4L_Init(void) {
  rcu_periph_clock_enable(RCU_GPIOA);
  // 配置RS引脚
  gpio_mode_set(GPIOA, GPIO_MODE_OUTPUT, GPIO_PUPD_NONE, LCD_RS_PIN);
  gpio_output_options_set(GPIOA, GPIO_OTYPE_PP, GPIO_OSPEED_10MHZ, LCD_RS_PIN);
  GPIO_BC(GPIOA) = LCD_RS_PIN;  // 初始置低

  // 配置RW引脚（建议接地，此处保留可配置性）
  gpio_mode_set(GPIOA, GPIO_MODE_OUTPUT, GPIO_PUPD_NONE, LCD_RW_PIN);
  gpio_output_options_set(GPIOA, GPIO_OTYPE_PP, GPIO_OSPEED_10MHZ, LCD_RW_PIN);
  GPIO_BC(GPIOA) = LCD_RW_PIN;  // 初始置低

  // 配置E引脚
  gpio_mode_set(GPIOA, GPIO_MODE_OUTPUT, GPIO_PUPD_NONE, LCD_E_PIN);
  gpio_output_options_set(GPIOA, GPIO_OTYPE_PP, GPIO_OSPEED_10MHZ, LCD_E_PIN);
  GPIO_BC(GPIOA) = LCD_E_PIN;    // 初始置低

  // 配置数据线D4-D7
  gpio_mode_set(GPIOA, GPIO_MODE_OUTPUT, GPIO_PUPD_NONE, LCD_D4_PIN);
  gpio_output_options_set(GPIOA, GPIO_OTYPE_PP, GPIO_OSPEED_10MHZ, LCD_D4_PIN);
  GPIO_BC(GPIOA) = LCD_D4_PIN;    // 初始置低

  gpio_mode_set(GPIOA, GPIO_MODE_OUTPUT, GPIO_PUPD_NONE, LCD_D5_PIN);
  gpio_output_options_set(GPIOA, GPIO_OTYPE_PP, GPIO_OSPEED_10MHZ, LCD_D5_PIN);
  GPIO_BC(GPIOA) = LCD_D5_PIN;    // 初始置低

  gpio_mode_set(GPIOA, GPIO_MODE_OUTPUT, GPIO_PUPD_NONE, LCD_D6_PIN);
  gpio_output_options_set(GPIOA, GPIO_OTYPE_PP, GPIO_OSPEED_10MHZ, LCD_D6_PIN);
  GPIO_BC(GPIOA) = LCD_D6_PIN;    // 初始置低

  gpio_mode_set(GPIOA, GPIO_MODE_OUTPUT, GPIO_PUPD_NONE, LCD_D7_PIN);
  gpio_output_options_set(GPIOA, GPIO_OTYPE_PP, GPIO_OSPEED_10MHZ, LCD_D7_PIN);
  GPIO_BC(GPIOA) = LCD_D7_PIN;    // 初始置低

  // 初始化 lcd
  LCD1602_4L_WriteCMD(0x28);//四线模式
  LCD1602_4L_WriteCMD(0x0c);
  LCD1602_4L_WriteCMD(0x06);
  LCD1602_4L_WriteCMD(0x01);//清屏
  delay_us(50);
}


static void LCD1602_4L_Write(unsigned char cmd, unsigned char data) {
  // 写命令和写数据只有一个 RS 寄存器不同
  if (cmd) LCD1602_RS_L(); else LCD1602_RS_H();
  // RW 是可以不整的，如果不需要读的话
  LCD1602_RW_L();
  // 开启写入数据
  LCD1602_E_H();

  // 按倒序写 0b11110000 的数据到 D4-D7
  // gpio_bit_write 是 GPIO_BC GPIO_BOP 的包装
  gpio_bit_write(GPIOA, LCD_D4_PIN, data&0x10);
  gpio_bit_write(GPIOA, LCD_D5_PIN, data&0x20);
  gpio_bit_write(GPIOA, LCD_D6_PIN, data&0x40);
  gpio_bit_write(GPIOA, LCD_D7_PIN, data&0x80);

  // 等待并开启下一次写入
  delay_us(1);
  LCD1602_E_L();
  delay_us(1);
  LCD1602_E_H();

  // 按倒序写 0b00001111 的数据到 D4-D7
  gpio_bit_write(GPIOA, LCD_D4_PIN, data&0x01);
  gpio_bit_write(GPIOA, LCD_D5_PIN, data&0x02);
  gpio_bit_write(GPIOA, LCD_D6_PIN, data&0x04);
  gpio_bit_write(GPIOA, LCD_D7_PIN, data&0x08);

  // 最后再关闭写入
  delay_us(1);
  LCD1602_E_L();
	delay_us(100);
}

void LCD1602_4L_WriteCMD(unsigned char CMD) {
  LCD1602_4L_Write(1, CMD);
}

void LCD1602_4L_WriteData(unsigned char CMD) {
  LCD1602_4L_Write(0, CMD);
}

// 设置位置
void LCD1602_4L_SetCursor(unsigned char Line,unsigned char Column)
{
  if(Line==1)
  {
    LCD1602_4L_WriteCMD(0x80|(Column-1));
  }
  if(Line==2)
  {
    LCD1602_4L_WriteCMD(0x80|(Column-1)+0x40);
  }
  if(Line==3)
  {
    LCD1602_4L_WriteCMD(0x80|(Column-1)+20);
  }
  if(Line==4)
  {
    LCD1602_4L_WriteCMD(0x80|(Column-1)+0x54);
  }
}

// 补一个这个用来直接写文字，比较方便
void LCD1602_4L_PrintString(unsigned char Line,unsigned char Column,unsigned char *String)
{
  unsigned char i;
  LCD1602_4L_SetCursor(Line, Column);
  for(i=0;String[i]!=0;i++)
  {
    LCD1602_4L_WriteData(String[i]);
  }
}

// 补一个这个用来直接清理文字
void LCD1602_4L_Clear(unsigned char Line,unsigned char Column, unsigned char Length) {
  unsigned char i;
  LCD1602_4L_SetCursor(Line, Column);
  for(i=0;i<Length;i++)
  {
    LCD1602_4L_WriteData(' ');
  }
}
```

最后是示例运行代码

``` c
// 去掉了 LED 灯了，这里不需要
void led_spark(void) {}

int main(void)
{
#ifdef __FIRMWARE_VERSION_DEFINE
  uint32_t fw_ver = 0;
#endif /* __FIRMWARE_VERSION_DEFINE */

  systick_config();
  eclic_priority_group_set(ECLIC_PRIGROUP_LEVEL3_PRIO1);

  // 串口还是初始化一下，在没有 link 来做调试的情况下可以用 printf 大法手动调试
  gd_eval_com_init(EVAL_COM0);
  
  // 初始化 lcd
  LCD1602_4L_Init();


#ifdef __FIRMWARE_VERSION_DEFINE
  fw_ver = gd32vw55x_firmware_version_get();
  /* print firmware version */
  printf("\r\nGD32VW55X series firmware version: V%d.%d.%d", (uint8_t)(fw_ver >> 24), (uint8_t)(fw_ver >> 16), (uint8_t)(fw_ver >> 8));
#endif /* __FIRMWARE_VERSION_DEFINE */

  /* print out the clock frequency of system, AHB, APB1 and APB2 */
  printf("\r\nCK_SYS is %d\r\n", rcu_clock_freq_get(CK_SYS));
  printf("\r\nCK_AHB is %d\r\n", rcu_clock_freq_get(CK_AHB));
  printf("\r\nCK_APB1 is %d\r\n", rcu_clock_freq_get(CK_APB1));
  printf("\r\nCK_APB2 is %d\r\n", rcu_clock_freq_get(CK_APB2));

  while(1) {
    // 每两秒切换文字，在两行上，并且清理掉之前的文字。
    LCD1602_4L_PrintString(1, 1, "GD32,OK");
    delay_1ms(2000);
    LCD1602_4L_Clear(1, 1, 16);
    LCD1602_4L_PrintString(2, 1, "iCEasy,Yes");
    delay_1ms(2000);
    LCD1602_4L_Clear(2, 1, 16);
  }
}

```

顺便说一下我的接线:

| LCD 针脚 | 目标 | 说明 |
|----------|------|-----|
| GND | GND | 接开发板地 |
| VDD | +5V | 接开发板5V(必须用 5V 给开发板供电) |
| VO | 2KΩ -> GND | 通过 2KΩ 接开发板地 |
| RS | PA4 | 接开发板 PA4 |
| RW | PA5 | 接开发板 PA5(可以忽略直接接地) |
| E | PA6 | 接开发板 PA6 |
| D4-D7 | PA0-PA3 | 4 个数据线接到开发板的 PA0-PA3 |
| BLA | 100Ω -> +5V | 通过 100Ω 接开发板 5V |
| BLK | GND | 接开发板地 |


程序写入后接线的效果

![lcd1](/public/img/gd32vw553/lcd1.webp)

![lcd2](/public/img/gd32vw553/lcd2.webp)
