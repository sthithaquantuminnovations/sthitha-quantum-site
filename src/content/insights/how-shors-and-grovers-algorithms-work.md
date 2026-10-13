---
title: "Inside Shor's and Grover's Algorithms: How Quantum Computing Solves Hard Problems"
excerpt: "A technical exploration of the two landmark quantum algorithms—Peter Shor's period-finding method for prime factorisation and Lov Grover's amplitude amplification search."
date: "2026-05-04"
author: "Sthitha Quantum Innovations"
category: "Quantum Algorithms"
readingTime: "8 min read"
---

When physicists and computer scientists discuss the transformative potential of quantum computers, two landmark algorithms invariably take center stage: **Shor’s Algorithm** (1994) and **Grover’s Algorithm** (1996). 

Together, they established the theoretical foundation of quantum advantage—proving that quantum computers can achieve exponential and polynomial speedups over the most efficient classical algorithms known to science.

This article explores the internal mechanics of both algorithms: how they work, the mathematics behind their speedups, and their real-world consequences for cryptography and optimization.

## Part I: Shor’s Algorithm — Factoring in Polynomial Time

Modern public-key cryptography—specifically RSA—relies on the mathematical premise that **multiplying two large prime numbers is easy, but factoring their composite product is computationally intractable**.

For an $n$-bit composite integer $N = p \cdot q$:
- **Classical Factoring:** The most advanced classical algorithm is the **General Number Field Sieve (GNFS)**, which runs in sub-exponential time:
  $$O\left(\exp\left(c \cdot (\ln N)^{1/3} (\ln \ln N)^{2/3}\right)\right)$$
  Factoring a 2048-bit RSA modulus classically would require millions of core-years on modern supercomputing clusters.
- **Shor’s Quantum Factoring:** Runs in **polynomial time**:
  $$O\left((\log N)^3\right)$$
  On a fault-tolerant quantum computer, a 2048-bit key could be factored in a matter of hours.

```
+-------------------------------------------------------------------------------+
|                       SHOR'S ALGORITHM WORKFLOW                               |
+-------------------------------------------------------------------------------+
|                                                                               |
|  [Classical Step] Pick coprime integer 'a' < N                                |
|         |                                                                     |
|         v                                                                     |
|  [Quantum Step: Order Finding]                                                |
|  - Initialize quantum registers in superposition                              |
|  - Compute modular exponentiation: |x⟩|a^x mod N⟩                             |
|  - Apply Quantum Fourier Transform (QFT) to extract period 'r'               |
|  - Measure register -> yields period r where a^r ≡ 1 (mod N)                  |
|         |                                                                     |
|         v                                                                     |
|  [Classical Step] If r is even and a^(r/2) ≢ -1 (mod N):                      |
|  - Compute gcd(a^(r/2) ± 1, N) using Euclidean algorithm                      |
|  - Result: Non-trivial prime factors p and q discovered!                      |
|                                                                               |
+-------------------------------------------------------------------------------+
```

### The Core Insight: Factoring is Period Finding
Peter Shor made the brilliant realization that prime factorisation can be reduced to the problem of **order-finding** (finding the period of a modular exponential function).

For a chosen random integer $a$ coprime to $N$, consider the function:

$$f(x) = a^x \pmod{N}$$

Because modular arithmetic in a finite group is cyclic, this function is strictly periodic. There exists an integer $r$ (the period or order) such that:

$$a^r \equiv 1 \pmod{N}$$

Once the period $r$ is known, if $r$ is even, we can rewrite the congruence as:

$$a^r - 1 = \left(a^{r/2} - 1\right)\left(a^{r/2} + 1\right) \equiv 0 \pmod{N}$$

This implies that $N$ divides the product $(a^{r/2} - 1)(a^{r/2} + 1)$. By computing the **Greatest Common Divisor (GCD)** between $(a^{r/2} \pm 1)$ and $N$ using Euclid’s algorithm (which runs instantaneously on a classical computer), we extract the non-trivial prime factors $p$ and $q$.

### The Quantum Fourier Transform (QFT)
Finding the period $r$ classically requires computing $a^x \pmod{N}$ for consecutive values of $x$ until repetition is found—an exponential task.

Shor’s algorithm solves this on a quantum processor using the **Quantum Fourier Transform (QFT)**:
1. Two quantum registers are prepared: an input register of $2n$ qubits and an output register initialized to $|0\rangle$.
2. Hadamard gates create a uniform superposition over all possible exponents $x$ in the input register.
3. A modular exponentiation quantum circuit computes $|x\rangle |a^x \pmod{N}\rangle$ simultaneously for all $x$.
4. Applying the QFT converts the periodic sequence of amplitudes in the state vector into sharp peaks in frequency space.
5. Measurement of the register collapses the state, yielding a value with high probability from which the period $r$ can be extracted using continued fraction expansion.

## Part II: Grover’s Algorithm — The Quadratic Search Engine

While Shor’s algorithm solves a specific algebraic problem exponentially, **Grover’s Algorithm** addresses an extraordinarily broad class of problems: **searching an unsorted database of $N$ items**.

Suppose you are looking for a unique item $w$ in an unsorted list of $N = 2^n$ elements:
- **Classical Search:** Requires examining on average $N/2$ items, with worst-case complexity of $O(N)$.
- **Grover’s Search:** Finds the target item with high probability using only:
  $$O\left(\sqrt{N}\right)$$
  oracle evaluations.

```
Classical Unsorted Search:
N = 1,000,000 items  ---> ~500,000 checks required

Grover's Quantum Search:
N = 1,000,000 items  ---> ~1,000 checks required (√1,000,000)
```

### The Mechanism: Amplitude Amplification
A common misconception is that Grover’s algorithm simply inspects all elements simultaneously in superposition and picks the answer. If you measured an equal superposition across $N$ elements, the probability of measuring the target item $w$ would be merely $1/N$—identical to a random classical guess!

Grover’s algorithm succeeds through **Amplitude Amplification**: repeatedly rotating the state vector so that the probability amplitude of the target state grows while all other amplitudes shrink.

```
Grover Iteration Cycle:
1. Equal Superposition: |s⟩ = (1/√N) ∑ |x⟩
2. Apply Oracle O: Flips the phase of the target item |w⟩ (amplitude becomes negative)
3. Apply Diffusion Operator D: Inverts all amplitudes around their mean
4. Repeat ~ (π/4)√N times
5. Measure: Target item |w⟩ observed with probability near 100%!
```

### Mathematical Steps of a Grover Iteration
Each Grover iteration consists of two unitary operations:

#### 1. The Phase Oracle ($U_w$)
The oracle identifies the target state $|w\rangle$ and flips its phase by $180^\circ$ (multiplying by $-1$):

$$U_w |x\rangle = \begin{cases} -|x\rangle & \text{if } x = w \\ \phantom{-}|x\rangle & \text{if } x \neq w \end{cases}$$

#### 2. The Diffusion Operator ($U_s$)
Also known as the **inversion about the mean**, the diffusion operator reflects all amplitudes about the average amplitude of the register:

$$U_s = 2|s\rangle\langle s| - I$$

Geometrically, flipping the target amplitude negative lowers the overall average amplitude of the register. Inverting all states around this new lower mean causes the target state's amplitude to jump dramatically upward while suppressing non-target states.

Repeating this pair of operations approximately:

$$R \approx \frac{\pi}{4}\sqrt{N}$$

times rotates the state vector directly toward the target $|w\rangle$. Measuring the qubits at this point outputs the target item with near certainty.

## Summary of Algorithmic Impacts

| Metric | Shor’s Algorithm | Grover’s Algorithm |
| :--- | :--- | :--- |
| **Problem Type** | Period finding / Factoring / Discrete Log | Unstructured search / Inverting one-way functions |
| **Speedup Class** | Exponential ($O((\log N)^3)$ vs sub-exponential) | Polynomial / Quadratic ($O(\sqrt{N})$ vs $O(N)$) |
| **Target Cryptography** | RSA, Diffie-Hellman, ECDH, ECDSA | AES-128, AES-256, SHA-256, SHA-3 |
| **Practical Impact** | Completely breaks legacy public-key cryptography | Halves effective key length of symmetric ciphers |
| **Enterprise Remedy** | Migrate to Post-Quantum Cryptography (ML-KEM / ML-DSA) | Upgrade AES to 256-bit keys |

## Exploring Quantum Algorithms at Sthitha

Mastering Shor’s and Grover’s algorithms is an essential milestone for anyone pursuing quantum computing, quantum engineering, or post-quantum cybersecurity.

- **Learn Circuit Implementation:** In our [Quantum Computing Crash Course](/academy/quantum-computing-crash-course), learners construct quantum circuits, explore phase kickback, build the Quantum Fourier Transform, and simulate Grover search routines step-by-step.
- **Enterprise Preparedness:** Explore how Sthitha’s [AEGIS](/aegis) platform helps enterprises discover cryptographic assets exposed to Shor's algorithm and prepare for seamless post-quantum migration.

*Explore additional articles on quantum technology and post-quantum migration in our [Insights Section](/research/insights).*
