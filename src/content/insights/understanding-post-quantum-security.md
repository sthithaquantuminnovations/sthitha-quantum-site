---
title: "Understanding Post-Quantum Security"
excerpt: "What quantum computers could change about the cryptography we rely on, what post-quantum cryptography is, and why organisations are starting to prepare now."
date: "2026-10-07"
author: "Sthitha Quantum Innovations"
category: "Post-Quantum Security"
---

Almost everything sent over a network is protected by cryptography. When you log in to a bank, send a message or update software, a small number of mathematical techniques are doing the work of keeping that exchange private and proving it is genuine.

Post-quantum security is about what happens to those techniques once large quantum computers exist, and what to do about it beforehand.

## What is protected today, and how

Two families of cryptography do most of the work.

**Public-key cryptography**, such as RSA and elliptic-curve cryptography (ECC), lets two parties agree on a secret key and verify digital signatures without having met before. Its security rests on mathematical problems that ordinary computers cannot solve in any practical amount of time, such as factoring very large numbers.

**Symmetric cryptography and hash functions**, such as AES and the SHA family, encrypt the data itself and check that it has not been altered.

## What a quantum computer changes

In 1994, Peter Shor described an algorithm that a sufficiently large quantum computer could use to solve the problems RSA and ECC depend on. A machine able to run it at scale would be able to break those systems.

A second algorithm, by Lov Grover, speeds up brute-force search. Its effect on symmetric cryptography and hashing is much smaller: in broad terms it weakens them rather than breaking them, and longer keys restore the margin.

So the exposure is uneven. Public-key systems are the main concern. Symmetric encryption and hashing are less affected.

No quantum computer can do this today. Building one that can is a hard engineering problem, and nobody knows exactly when it will be solved. That uncertainty is the reason the subject is treated as something to prepare for rather than something to panic about.

## Why start before the threat exists

Three things make early preparation sensible.

**Some data has a long life.** Information that must stay confidential for many years can be intercepted and stored now, then decrypted later once the capability exists. This is often called "harvest now, decrypt later".

**Migration is slow.** Cryptography is built into applications, devices, networks and third-party systems. Finding it all, and changing it without breaking what depends on it, takes years rather than months.

**Most organisations do not know where their cryptography is.** You cannot plan a migration for assets you have not found.

## What post-quantum cryptography is

Post-quantum cryptography (PQC) is a set of new public-key algorithms designed to resist attacks from both ordinary and quantum computers. It runs on today's computers and networks. It does not require quantum hardware.

In August 2024 the US National Institute of Standards and Technology (NIST) published its first finalised post-quantum standards, including ML-KEM (FIPS 203) for establishing keys and ML-DSA (FIPS 204) for digital signatures. These give organisations something concrete to move towards.

## What preparing looks like

The work usually follows three steps.

**Discover.** Build an inventory of the cryptography in use: which algorithms, keys and certificates, and which systems rely on them.

**Assess.** Work out which assets are most exposed and which protect information that has to stay confidential longest.

**Plan the migration.** Set out a phased roadmap so the most critical systems move first.

This is the thinking behind [AEGIS](/aegis), Sthitha's post-quantum security initiative: help organisations see where their cryptography is, understand their exposure, and prepare a practical path forward.

The goal is not to create fear. The goal is to prepare early.
