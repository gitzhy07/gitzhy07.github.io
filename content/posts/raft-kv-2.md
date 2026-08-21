---
title: "用 Raft 手搓 KV 存储（二）：线性一致读与 Lease Read 的取舍"
date: 2025-06-18
description: "从一条丢包的 AppendEntries 讲起。本文实现并压测了支持 ReadIndex 与 Lease Read 的教学级 KV 存储，分析两种读策略在网络分区下的行为差异。"
tags: ["raft", "consensus", "kv"]
categories: ["分布式系统"]
image: "https://picsum.photos/seed/raft-kv-leader-election/900/620"
draft: false
---

## 背景

从一条丢包的 AppendEntries 讲起……

## 线性一致读

### ReadIndex

### Lease Read

## 压测数据

## 结论

---

{{< highlight go >}}
func (n *Node) readIndex(ctx context.Context) (uint64, error) {
    n.mu.Lock()
    if n.state != StateLeader {
        n.mu.Unlock()
        return 0, ErrNotLeader
    }
    commit := n.commitIndex
    n.mu.Unlock()

    select {
    case <-ctx.Done():
        return 0, ctx.Err()
    case <-n.applyCh:
        return commit, nil
    }
}
{{< /highlight >}}