---
title: "Understanding Harvest Now, Decrypt Later (HNDL) Attacks"
excerpt: "Why adversaries archiving encrypted traffic today is already a live threat, even before large-scale quantum computers exist."
date: "2026-01-14"
author: "Sthitha Quantum Innovations"
category: "Post-Quantum Security"
---

Adversaries do not need a working quantum computer today to threaten your data tomorrow. Under a Harvest Now, Decrypt Later (HNDL) strategy, encrypted traffic - VPN handshakes, TLS sessions, archived backups - is intercepted and stored now, with the expectation that a sufficiently powerful quantum computer will eventually be able to break the underlying RSA or ECC keys.

## Why this matters today

Any data with a confidentiality shelf life longer than the time it takes quantum computers to mature is already at risk. For critical infrastructure - grid telemetry, defence communications, long-term financial records - that shelf life can run into decades.

## What to do about it

The first step is knowing where you are exposed. That means finding where cryptography is used across your systems, and identifying which of it protects information that has to stay confidential for a long time.

That is the starting point of [AEGIS](/aegis), Sthitha's post-quantum security initiative: discover cryptographic assets, assess quantum risk and prepare for post-quantum migration. For the wider picture, read [Understanding Post-Quantum Security](/research/insights/understanding-post-quantum-security).
