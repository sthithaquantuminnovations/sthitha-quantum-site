---
title: "Understanding Harvest Now, Decrypt Later (HNDL) Attacks"
excerpt: "Why adversaries intercepting and archiving encrypted enterprise traffic today represents an active, present-day threat—years before cryptanalytically relevant quantum computers exist."
date: "2026-02-18"
author: "Sthitha Quantum Innovations"
category: "Post-Quantum Security"
readingTime: "6 min read"
---

Adversaries do not need access to a functioning, large-scale quantum computer today to compromise the confidentiality of your data tomorrow. Under a **Harvest Now, Decrypt Later (HNDL)** strategy—also termed *Store Now, Decrypt Later (SNDL)*—state-sponsored adversaries and sophisticated threat actors are passively intercepting, mirroring, and storing encrypted communications today. 

Their objective is straightforward: archive high-value encrypted traffic in mass data centers until a Cryptanalytically Relevant Quantum Computer (CRQC) becomes operational, at which point Shor’s algorithm will be deployed to break the underlying public-key cryptographic algorithms (such as RSA, Diffie-Hellman, and Elliptic Curve Cryptography) and decrypt the plaintext.

## The Mathematical & Strategic Reality of HNDL

Traditional cybersecurity operates under a reactive model: vulnerabilities are patched after discovery, and compromise occurs upon breach. HNDL turns this paradigm upside down: **the breach is occurring today, but the exploit execution is deferred.**

Public-key cryptography protects virtually every digital communication channel:
- **TLS Handshakes:** Transport Layer Security protecting HTTPS, API gateways, and web traffic.
- **VPN Tunnels:** IPsec and WireGuard endpoints safeguarding remote branch office and enterprise interconnects.
- **Encrypted Email & Messaging:** S/MIME, PGP, and encrypted signaling protocols.
- **Archival Cloud Backups:** Long-term cold storage archives and intellectual property repositories.

When an adversary intercepts a TLS 1.3 session negotiated using standard ECDH (such as `X25519` or `secp256r1`), they cannot decipher the ephemeral symmetric session key using classical computers. However, if they capture and store the complete encrypted handshake and subsequent cipherstream, that ciphertext remains vulnerable perpetually.

```
+----------------------------------------------------------------------------+
|                          HNDL ATTACK LIFECYCLE                             |
+----------------------------------------------------------------------------+
|                                                                            |
|  [PRESENT DAY]                                                             |
|  Encrypted Network Traffic  ---> Intercepted & Copied ---> Exfiltrated to  |
|  (Protected by RSA / ECC)        by Adversary              Adversary Storage|
|                                                                            |
|                                     |                                      |
|                                     v (Archived for 5 - 15+ years)         |
|                                                                            |
|  [POST-QUANTUM ERA]                                                        |
|  Cryptanalytically Relevant ---> Shor's Algorithm Applied ---> Full Plaintext|
|  Quantum Computer (CRQC)        Breaks RSA/ECC Ephemeral Keys  Exposed     |
|                                                                            |
+----------------------------------------------------------------------------+
```

## Why HNDL is a Present-Day Threat: Mosca's Theorem

The urgency of HNDL is formalized by **Mosca’s Theorem** (the Theorem of Quantum Risk):

> If **$X + Y > Z$**, then your organization is already in a state of cryptographic failure.

Where:
- **$X$ (Data Shelf-Life):** The number of years your data must remain strictly confidential.
- **$Y$ (Migration Time):** The time required for your enterprise to discover all cryptographic dependencies, test post-quantum algorithms, and fully migrate infrastructure.
- **$Z$ (Collapse Time):** The time remaining until a cryptanalytically relevant quantum computer is operational.

```
       Timeline Comparison
       |------------------------ X (Shelf Life: e.g. 15 Years) ------------------------|
       |------------ Y (Migration: 4-6 Yrs) ------------|
|<------------------------ Z (Quantum Arrival: ~8-12 Years) ------------------------>|
▲                                                                                     ▲
TODAY                                                                               Q-DAY
```

For many regulated sectors, $X$ easily spans 10 to 30 years:
- **Critical Infrastructure & Energy:** SCADA telemetry, smart grid topologies, and nuclear command systems have operational lifespans exceeding 20 years.
- **Defense & Intelligence:** Diplomatic cables, satellite telemetry, and covert operational files demand 25 to 50 years of confidentiality.
- **Healthcare & Genomics:** Patient genetic sequences, biometric identities, and clinical trial records must remain confidential for the lifetime of the patient.
- **Financial Institutions & Banking:** Core banking ledgers, SWIFT communications, trade secret formulas, and sovereign debt records.

If an enterprise requires 4 years to complete cryptographic migration ($Y = 4$), and its data must remain secret for 15 years ($X = 15$), the total window is 19 years. If a quantum computer capable of breaking RSA arrives in 10 years ($Z = 10$), that organization has already exceeded its safety threshold by 9 years. Every megabyte of encrypted traffic intercepted today will be readable during its mandated confidentiality window.

## Asymmetric Exposure: What Breaks and What Survives

A common misconception is that quantum computers will uniformly shatter all encryption. In reality, the vulnerability profile is highly asymmetrical:

| Cryptographic Primitive | Common Standard | Quantum Vulnerability | Impact | Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **Public-Key Key Exchange** | RSA, ECDH, X25519 | Complete break via Shor’s algorithm | **Catastrophic (HNDL target)** | Migrate to ML-KEM (FIPS 203) / Hybrid Key Exchange |
| **Digital Signatures** | RSA-PSS, ECDSA, Ed25519 | Complete break via Shor’s algorithm | **Severe (Authentication)** | Migrate to ML-DSA (FIPS 204) / SLH-DSA (FIPS 205) |
| **Symmetric Encryption** | AES-128 | Halved security margin via Grover’s | **Moderate** | Upgrade to AES-256 (provides 128-bit quantum security) |
| **Symmetric Encryption** | AES-256 | Retains ~128 bits of security | **Negligible** | Maintain AES-256 |
| **Cryptographic Hash** | SHA-256, SHA-3 | Collision / Preimage resistance weakened | **Low** | Upgrade to SHA-384 / SHA-512 |

Adversaries executing HNDL specifically target **public-key key exchanges**. Once the ephemeral key exchange is broken post-quantum, the symmetric key protecting the session payload is derived effortlessly.

## The Mitigation Playbook: How Enterprises Must Defend Today

Defending against HNDL attacks cannot wait until quantum hardware reaches physical fault tolerance. The following four-stage defense roadmap is essential:

### 1. Cryptographic Discovery and Inventory (CBOM)
You cannot remediate cryptographic risks that you have not catalogued. Organizations must generate a **Cryptographic Bill of Materials (CBOM)** across network perimeters, microservices, databases, and third-party SaaS integrations:
- Identify every endpoint utilizing RSA, Diffie-Hellman, or ECC.
- Map which data streams carry long-shelf-life sensitive assets.
- Pinpoint legacy protocols that lack cipher negotiation flexibility.

### 2. Immediate Deployment of Hybrid Key Exchange
Rather than waiting for full deprecation of classical algorithms, leading standards bodies (IETF, NIST) recommend deploying **hybrid key exchange** mechanisms in TLS 1.3:
- In a hybrid handshake, two independent key exchanges are performed simultaneously: a classical ECDH exchange (such as `X25519`) combined with a post-quantum lattice-based mechanism (such as `ML-KEM-768`).
- The final session key is derived by feeding the shared secrets of *both* algorithms into a Key Derivation Function (KDF).
- If ML-KEM is later found to possess an unforeseen mathematical flaw, classical ECDH ensures standard security. If a quantum computer arrives tomorrow, ML-KEM renders the archived ciphertext unbreakable.

### 3. Implementing Cryptographic Agility
Hard-coded cryptographic algorithms in firmware, microcontrollers, and application libraries represent massive technical debt. Cryptographic agility means abstracting cryptographic libraries so that algorithms, key sizes, and signature schemes can be rotated via configuration rather than extensive refactoring.

### 4. Engaging with AEGIS
This operational imperative is precisely why **AEGIS** was built at Sthitha Quantum Innovations:
- **Automated Discovery:** Uncovering hidden cryptographic dependencies throughout codebases, network services, and containerized clusters.
- **Risk Prioritization:** Quantifying data shelf-life against quantum arrival estimates.
- **Migration Architecture:** Engineering dual-mode and post-quantum hybrid architectures without interrupting live traffic.

## Conclusion

The Harvest Now, Decrypt Later doctrine proves that quantum computing is not a future risk—it is an **active adversary strategy happening today**. Every day an organization delays cryptographic inventory and post-quantum key exchange deployment is another day of archived data surrendered to future decryption.

*To explore how Sthitha assists organizations in discovering cryptographic assets and engineering quantum-resilient pipelines, explore [AEGIS](/aegis) or read our primer on [Understanding Post-Quantum Security](/research/insights/understanding-post-quantum-security).*
