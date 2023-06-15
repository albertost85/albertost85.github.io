---
layout: post
title: What is a Signal
date: 2023-05-10 09:16:00 +0200
categories: [Signals and Systems, Introduction]
tags: [Signals, Signal processing, Information]
math: true
img_path: /assets/img/
---
This is the content of an introductory lesson to Signals. It lacks the introduction to System concept. But Systems will not be introduced until mid semester.

Time: Exposition time: about 30 minutes.

## Some definitions

Signal.
: We can define a **signal** as the physical representation of information.

The properties of a signal allow its use in communication, storage, and presentation of **information**. Quantitatively speaking, information is anything that can increase our level of knowledge.

The transfer of information involves communication, which is the process of transferring information from a source to a recipient through a more or less complex system.

Signal processing consists of manipulating the signal to provide it with useful properties or extract useful properties from it.

Signal processing is also aimed at facilitating direct or indirect interaction with **physical systems**; these, in a broad sense, are an interconnection of components, devices, or subsystems.

In contexts ranging from signal processing and communications to electromechanical motors, vehicles, and chemical process plants, a \textbf{system} can be considered as a **process** in which input **signals** are transformed by the system or cause it to respond in some way, resulting in other signals as output. Understanding how to handle these signals is crucial when designing or simulating systems.

## Classification of signals
### Based on their evolution over time
- Deterministic: Signals that, with a certain knowledge about them, are completely specified for any point in time; in other words, signals that admit an analytical expression.
    - Deterministic stationary: Signals whose spectrum does not significantly change over time.
- Random: These signals can take on one value from a set of values at each point in time with a preferred probability. However, it is not possible to determine their value with complete certainty without direct observation. They do not have a mathematical model.

Communication only makes sense using signals that, in some way, are random. Although not useful in communication, deterministic signals serve as the conceptual foundation for studying the next type of signals, as they share some properties.

### Based on their energy
- Finite energy: Ideal signals, or signals existing only at a specific period of time. \begin{equation}
	W_x=\int_{-\infty}^{\infty} x(t)^2 \mathop{dt} < \infty
\end{equation}

- Finite average power: When dealing with periodical signals, it is worth to define those whose energy in a period of time is limited to a certain value. \begin{equation}
	P_T=\lim_{T\rightarrow \infty}\frac{1}{T} \int_{-T/2}^{T/2} x(t)^2 \mathop{dt} < \infty
\end{equation}


### Based on their morphology
- Domain: Signals can be classified as continuous or discrete based on the domain, which is the set of time instances in which the signal is defined.
- Range: Signals can be classified as analog or digital based on the range, which is the set of values the signal can take within its domain.

<div style="display: flex; justify-content: center; align-items: center; width= 100%;">
    <div>
        <img src="Signal_Analog.svg" alt="Signal Analog">
        <p style="text-align: center;">(a) Analog Signal, continuous value range</p>
    </div>
    <div>
        <img src="Signal_Holded.svg" alt="Signal Holded">
        <p style="text-align: center;">(b) Holded Signal, discrete value range</p>
    </div>
</div>
<p style="text-align: center;">Figure: Continuous Signals in the Time Domain</p>

<div style="display: flex; justify-content: center; align-items: center; width: 100%;">
    <div>
        <img src="Signal_Sampled.svg" alt="Signal Sampled">
        <p style="text-align: center;">(a) Sampled Signal, continuous value range</p>
    </div>
    <div>
        <img src="Signal_Digital.svg" alt="Signal Digital">
        <p style="text-align: center;">(b) Digital Signal, discrete value range</p>
    </div>
</div>
<p style="text-align: center;">Figure: Discrete Signals in the Time Domain</p>

A further clarification about this criteria. Students are often more familiar with *discrete time* concept. It is a natural assumtion that a microcontroller or any digital system samples analog values (and process them) at specific intervals of time; *regular intervals of time*, to be more practical. This is linked to the idea of processor, computing operations based on a main frequency.

In what comes to *discrete range*, not every students are aware of ADC concept. An ADC converts analog values (continuous values in its range, between two extremes, a maximal and a minimal voltage input) to binary values. ADC's resolution are expressed in bits. To provide a valid example, let's check practical values of [ADC12010](https://www.ti.com/product/ADC12010) chip. With typical operation range of analog inputs peak-to-peak (V_PP) set to 4.0V, quantification of a single bit increase is the same as **LSB** (*Less Significat Bit*, or 0000 0000 0001 for 12 bit value) correspondant with analog value of 0.9768 $\mu V$. In practical, this ADC converter have a resolution of 1 mV. Any input voltage difference below 1 mV might be translated into the same binary value. A binary value of 0011 0111 1111 migh represent either an input voltage of 0.874302V or an input voltage of 0.874970V.

Input of an ADC is called *Sampler* typically, a capacitance charged before each conversion. Value of capacitance is continuous (ideally takes the same voltage as the input. *Ideally*), but it might retain its value only until conversion process start. That's an example of *Sampled Signal*.

Another important parameter of an ADC is the conversion frequency. It can be fixed or it can be related to the input difference. Deppending on the architecture, conversion happens until a certain level of error is granted, up to a maximal conversion time. That makes the output of an ADC a *Digital Signal*: both, range (values) are discrete and changes happen at quantified domain moments (periods of time).

An example of a discrete-range and continuous-time system might be the ouput of a DAC *Digital to Analog Converter*. The output values are discrete because input values (typically from a digital system like a microcontroller or a computer) are binary. But the output of a DAC is a signal continuous over its domain (time). It is an example of *Holded Signal* in the images.



### Based on their spectrum in signals
Based on the distribution of amplitude across frequencies:
- Low-pass: Amplitudes are significant in the lower part of the spectrum and negligible in the higher part.
- High-pass: Amplitudes are significant in the higher part of the spectrum and negligible in the lower part.
- Band-pass: Amplitudes are significant only in an intermediate range of the spectrum.
- Band-stop: Amplitudes are significant in the entire spectrum except for an intermediate range.

### Based on casualty
- Causal system: A system is causal if its output at any given time depends only on input values at the present moment and in the past.
\begin{equation}
x(t) = 0 \quad \forall t < 0
\end{equation}
- Non-causal systems: Although causal systems are of great importance, they are not the only systems that are of practical interest. For example, causality is not fundamentally important in applications like image processing, where the independent variable is not time. When working with pre-recorded data, i.e., when not operating in real-time, there is no obligation to process the data causally.

### Other critera
- Time-limited signals. This is conceptually linked to Finite energy signals.
- Even signals:
\begin{equation}
x(t) = x(-t)
\end{equation}
- Odd signals:
\begin{equation}
x(t) = -x(t)
\end{equation}

Odd and even signals are interesting if we try to integrate them over their whole domain. ¿Why? We will show later in Fourier series lesson, but try using your intuition.

Most functions (signals) are neither odd, neither even. But sinus $\sin(t)$ is an odd signal, while cosinus $\cos(t)$ is an even signal. Spoiler: main task of *Signals and Systems* subject, prior modulation, is converting any information signal to a sum of orthogonal sinus and cosinus signals.