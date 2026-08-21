---
title: "Rust 异步的隐形成本：一次 Pin 与 Waker 的内存考古"
date: 2025-06-07
description: "为什么你的 Future 在堆上反复横跳？用 perf 和火焰图追查 tokio 任务调度的真实开销，以及何时应该回到同步代码。"
tags: ["tokio", "async", "pin"]
categories: ["Rust"]
image: "https://picsum.photos/seed/rust-future-pin/900/620"
draft: false
---

## 为什么 Future 需要 Pin

## 内存布局的意外

## 性能实测

## 结论