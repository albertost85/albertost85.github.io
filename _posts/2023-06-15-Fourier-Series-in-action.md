---
layout: post
title: Fourier Series
date: 2023-06-15 14:28:00 +0200
categories: [Signals and Systems, Introduction]
tags: [Signals, Signal processing, Fourier Series]
math: true
img_path: /assets/img/
---
This is the content of an introductory lesson to Signals. Inmersive content about Fourier series and how to apply the formulae.

Time: Exposition time: about 10 minutes and then go through the practical examples.

## Fourier series in action
#### Fourier Transform and Periodicity
Are Fourier transforms only useful for periodic functions? No. A Fourier transform completely defines a periodic function, but it can also precisely define a section of a non-periodic function. Although most real signals are not periodic, there are cases of periodic signals that can be fully defined, for instance in power.

#### Decomposition of a Periodic Function
If I have a periodic function, I can decompose it as a sum of coefficients multiplied by complex exponential functions.

\begin{equation}
f(t) = \sum_{n=-\infty}^\infty d_n e^{j 2 \pi n f_0 n t}
\end{equation}

#### Coefficients
The coefficients 'd_n' are obtained by integrating.

\begin{equation}
d_n = \frac{1}{T_0} \int_{-T / 2}^{T/2} f(t) e^{-j 2 \pi n f_0 t} dt
\end{equation}

#### Integration
The integral will be more or less complicated depending on the function we want to approximate and the period we take. Whenever possible, we will avoid integrating; by applying properties, we will be able to obtain the value of the integral through other means.

#### Fourier Series
The terms **Fourier Transform** and **Fourier Series** are related, but not equivalent. The Fourier series rewrites the original signal as a sum of sines and cosines.

#### Generating Function
When we have a periodic signal, there is always a series of values that repeats, and we can express the signal as the repetition of that period. The repeating function is called the **generating function**.

#### Period 'T'
It is the time it takes for something to repeat; it is the same as the inverse of frequency 'f_0'.

#### Hertz
If we measure frequency in **Hertz**, we are measuring cycles of repetition per second. The conversion to radians per second is done by multiplying the frequency by '2π'.

\begin{equation}
ω = 2πf
\end{equation}
