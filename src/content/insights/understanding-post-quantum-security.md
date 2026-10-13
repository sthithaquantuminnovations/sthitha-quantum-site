---
title: "Understanding Post-Quantum Security"
excerpt: "How quantum computers threaten modern asymmetric cryptography, the mathematics of post-quantum lattice algorithms, and how organizations are preparing for the post-quantum era."
date: "2026-03-02"
author: "Sthitha Quantum Innovations"
category: "Post-Quantum Security"
readingTime: "7 min read"
---

Modern digital commerce, banking, communications, and national infrastructure rely on a foundation of cryptographic mathematics. When you authenticate an identity, establish a secure web session, or sign a software update, a small set of mathematical algorithms operates silently to guarantee confidentiality and verify authenticity.

**Post-Quantum Cryptography (PQC)** is the science of securing digital systems against attacks executed by quantum computers. It focuses on replacing vulnerable public-key cryptographic algorithms with mathematical structures that neither classical supercomputers nor future quantum computers can break.

Crucially, **post-quantum cryptography runs on conventional computers and standard networks today**. It does not require quantum hardware to deploy—it simply defends against adversaries who will eventually possess it.

## The Dual Foundation of Classical Cryptography

To understand the quantum threat, it is necessary to examine the two primary families of modern cryptography:

### 1. Asymmetric (Public-Key) Cryptography
Asymmetric algorithms enable two parties to exchange encrypted data across an insecure channel without previously sharing a secret key. They also enable digital signatures that prove the author of a message or software binary.
- **Representative Algorithms:** RSA, Diffie-Hellman (DH), Elliptic-Curve Diffie-Hellman (ECDH), Elliptic-Curve Digital Signature Algorithm (ECDSA).
- **Underlying Hard Problems:** The difficulty of factoring large composite integers into prime factors (RSA) and computing discrete logarithms in finite fields or elliptic curve groups (ECDH / ECDSA).
- **Classical Complexity:** Solving these problems on classical supercomputers requires sub-exponential time (via the General Number Field Sieve), making brute-force cracking completely infeasible within cosmic timescales.

### 2. Symmetric Cryptography and Cryptographic Hashes
Symmetric algorithms use a single secret key shared between parties to encrypt and decrypt bulk payloads. Hash functions generate fixed-length cryptographic fingerprints of data.
- **Representative Algorithms:** Advanced Encryption Standard (AES-128, AES-256), SHA-256, SHA-3.
- **Security Foundation:** Complex substitution-permutation networks and diffusion matrices with no known analytical shortcuts.

```
+-----------------------------------------------------------------------------------------+
|                           THE CLASSICAL CRYPTOGRAPHY MAP                                |
+-----------------------------------------------------------------------------------------+
|  ASYMMETRIC (PUBLIC-KEY)                 |  SYMMETRIC ENCRYPTION & HASHING              |
|  - Key Exchange (RSA, ECDH, X25519)      |  - Bulk Cipher (AES-128, AES-256)            |
|  - Digital Signatures (ECDSA, Ed25519)   |  - Integrity Hashes (SHA-256, SHA-3)         |
|                                          |                                              |
|  Mathematical Foundation:                |  Mathematical Foundation:                    |
|  - Integer Factoring Problem             |  - Substitution-Permutation Networks         |
|  - Discrete Logarithm Problem            |  - Confusion & Diffusion Mathematics         |
|                                          |                                              |
|  Quantum Threat:                         |  Quantum Threat:                             |
|  - SHOR'S ALGORITHM                      |  - GROVER'S ALGORITHM                        |
|  - Complete collapse in polynomial time  |  - Quadratic speedup (doubling key restores) |
+-----------------------------------------------------------------------------------------+
```

## The Quantum Impact: Shor's vs Grover's Algorithms

Quantum computers do not simply calculate faster than classical computers; they process information using the quantum principles of **superposition**, **quantum entanglement**, and **constructive/destructive interference**. This allows them to execute specialized algorithms that bypass classical computational barriers:

### Shor’s Algorithm (1994): The Asymmetric Collapse
Peter Shor proved that a quantum computer equipped with sufficient error-corrected qubits can solve both integer factorisation and discrete logarithms in **polynomial time**:

$$O((\log N)^3)$$

On a classical machine, cracking a 2048-bit RSA key requires hundreds of thousands of computing years. On a fault-tolerant quantum computer running Shor’s algorithm, the same operation can be executed in a matter of hours.

Because elliptic-curve cryptography relies directly on discrete logarithms, it is broken with even fewer quantum resources than RSA. **Consequently, RSA, ECDH, and ECDSA will all become obsolete once a Cryptanalytically Relevant Quantum Computer (CRQC) is realized.**

### Grover’s Algorithm (1996): The Symmetric Slowdown
Lov Grover developed an algorithm that accelerates unstructured database search from classical $O(N)$ trials to:

$$O(\sqrt{N})$$

When applied to symmetric block ciphers like AES, Grover’s algorithm effectively halves the effective key length:
- **AES-128:** Reduced to an effective security level of 64 bits—bringing it within potential brute-force reach of future adversaries.
- **AES-256:** Reduced to 128 bits of quantum security—which remains computationally intractable and entirely safe for the foreseeable future.
- **SHA-256 / SHA-3:** Preimage resistance is reduced, but hash lengths of 256 or 384 bits retain sufficient safety margins.

**Conclusion:** The quantum transition is fundamentally an **asymmetric migration**. Symmetric encryption simply requires ensuring key sizes are at or above 256 bits, whereas all public-key infrastructures (PKI) must be fundamentally redesigned and replaced.

## What is Post-Quantum Cryptography?

Post-quantum cryptography (PQC) consists of newly developed public-key algorithms whose mathematical foundations resist attacks from both classical supercomputers and quantum algorithms.

Rather than relying on factoring or discrete logarithms, PQC algorithms are based on diverse mathematical problems known as **quantum-hard problems**:

### 1. Lattice-Based Cryptography
The most prominent and versatile family of PQC. Its security is derived from the hardness of finding the shortest or closest vector in high-dimensional geometric lattices—specifically the **Learning With Errors (LWE)** and **Module-LWE** problems. These algorithms offer excellent execution speeds and balanced key sizes.

### 2. Hash-Based Cryptography
Uses one-time signatures combined with Merkle tree hierarchies. Its security relies solely on the collision and preimage resistance of established cryptographic hash functions (such as SHA-256), making its theoretical security guarantees exceptionally mature.

### 3. Code-Based Cryptography
Based on the difficulty of decoding general linear error-correcting codes (such as the McEliece cryptosystem). Extremely fast decryption and high confidence, balanced by comparatively large public keys.

### 4. Multivariate Cryptography
Relies on the difficulty of solving systems of multivariate quadratic polynomial equations over finite fields.

## The Finalized NIST Standards (FIPS 203, 204, 205)

In August 2024, the National Institute of Standards and Technology (NIST) reached a historic milestone by publishing its first official, finalized Federal Information Processing Standards (FIPS) for post-quantum cryptography:

| Standard | Original Name | Category | Mathematical Basis | Primary Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **FIPS 203** (ML-KEM) | CRYSTALS-Kyber | Key Encapsulation Mechanism (KEM) | Module Lattice (MLWE) | General key exchange, TLS 1.3, VPN handshakes |
| **FIPS 204** (ML-DSA) | CRYSTALS-Dilithium | Digital Signature Algorithm | Module Lattice (MLWE) | Identity certificates, PKI, code signing |
| **FIPS 205** (SLH-DSA) | SPHINCS+ | Stateless Hash-Based Signature | Cryptographic Hash Trees | High-security firmware signing, backup signature scheme |

NIST is also finalizing **FIPS 206** (FN-DSA / FALCON) for applications requiring compact digital signature sizes.

## Enterprise Migration Challenges: Key Sizes and Latency

Migrating an enterprise ecosystem to PQC is significantly more complex than simply upgrading an SSL certificate. Post-quantum algorithms introduce altered performance and structural characteristics:

```
Key Size Comparison: Classical vs Post-Quantum (Bytes)
---------------------------------------------------------------------------------
Algorithm            Type            Public Key Size       Ciphertext / Signature
---------------------------------------------------------------------------------
RSA-2048 (Classical) Asymmetric      256 bytes             256 bytes
X25519 (Classical)   ECDH            32 bytes              32 bytes
ML-KEM-768 (NIST)    PQC KEM         1,184 bytes           1,088 bytes
ML-DSA-65 (NIST)     PQC Signature   1,952 bytes           3,293 bytes
---------------------------------------------------------------------------------
```

Because public keys and signatures are substantially larger in lattice algorithms:
- **Packet Fragmentation:** Network packets exceeding Maximum Transmission Unit (MTU) thresholds may fragment over legacy network appliances.
- **Embedded Constraints:** Microcontrollers, IoT devices, and smart cards with constrained RAM must be re-engineered to handle larger key buffers.
- **PKI Certificate Bloat:** X.509 certificate chains containing multiple post-quantum certificates will expand in size, requiring optimization to avoid latency spikes during handshake negotiation.

## The Three-Phase Enterprise Readiness Roadmap

Preparing an enterprise for post-quantum resilience requires structured, systematic execution:

### Phase 1: Cryptographic Discovery & Inventory
Establish visibility across your cryptographic footprint:
- Discover all instances of public-key algorithms across application code, container registries, TLS terminators, and API integrations.
- Generate an automated **Cryptographic Bill of Materials (CBOM)**.
- Classify data assets by regulatory confidentiality shelf-life.

### Phase 2: Hybrid Deployments & Agility Testing
Begin incorporating post-quantum algorithms without removing classical defenses:
- Implement hybrid TLS 1.3 handshakes combining `X25519` with `ML-KEM-768`.
- Validate that network middleboxes, load balancers, and firewalls gracefully handle larger handshake payloads.
- Abstract cryptography through modern middleware interfaces to achieve true crypto-agility.

### Phase 3: Full PQC Transition & Deprecation
- Migrate internal certificate authorities (Root and Intermediate CAs) to post-quantum signature schemes (ML-DSA).
- Deprecate legacy cipher suites and transition hardware security modules (HSMs) to post-quantum firmware.
- Mandate post-quantum compliance across third-party software supply chains.

## How Sthitha is Enabling the Quantum Transition

At Sthitha Quantum Innovations, our mission is to make advanced quantum technologies understandable and practically actionable:

- **AEGIS:** Our dedicated post-quantum security initiative delivers automated cryptographic discovery, risk posture analysis, and hybrid migration frameworks tailored for enterprise IT and critical infrastructure.
- **Sthitha Academy:** Structured educational courses providing software engineers, architects, and students with fundamental grounding in quantum computing principles and algorithms.
- **Research & Innovation:** Ongoing investigations into applied quantum algorithms, quantum machine learning, and emerging security architectures.

The transition to post-quantum security is the largest cryptographic migration in the history of computing. Organizations that act deliberately today will navigate the shift smoothly; those that wait until quantum supremacy is realized will face an urgent, disruptive crisis.

*Learn more about how to protect your systems against emerging quantum risks with [AEGIS](/aegis), or start building foundational quantum literacy with [Sthitha Academy](/academy).*
