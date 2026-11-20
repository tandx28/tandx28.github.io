---
title: Settle
short: 'game-night settle-up app'
tagline: Settle up after mahjong, poker or card nights in seconds, with shared live tables and PayNow QR codes made on the device.
tier: featured
order: 2
year: '2024 - 2026'
role: Solo developer
status: live
stack: [JavaScript, Node.js, Webpack, Redis, Vercel, node:test]
live: https://settlelah-sg.vercel.app
repo: https://github.com/tandx28/Payment_Calculator
cover: ../../assets/shots/settle.jpg
accent: '#a3e635'
stats:
  - { value: '0', label: 'cents lost to rounding' }
  - { value: '24h', label: 'shared table lifetime' }
  - { value: 'SGD', label: 'PayNow QR, made locally' }
---

## What it is

A fast, private payment calculator for game nights in Singapore. Each player enters
a result, or their chip count and buy-ins, and Settle works out the fewest transfers
that settle the table.

## How it started

I wrote the first version by hand in September 2024 as a simple calculator for Chinese New Year
card games with friends. In 2026 I rebuilt it into what it is now: shared live tables, exact chip
maths, PayNow QR codes and a test suite.

## Shared tables

A host opens a table that lasts 24 hours and shares an invite link or QR code. Players
join with their own name and optional PayNow number, then submit their own result.
The server saves each result and marks the player ready in one atomic action, and
payments unlock only when everyone is ready and the total is exactly zero.

## Getting the money right

- **Integer maths only.** Chip results are converted with BigInt rational arithmetic
  and fractional cents are shared out by largest remainder, so net amounts always sum
  to exactly zero.
- **PayNow QR codes on the device.** Codes follow the EMVCo format with a CRC-16
  checksum and are generated locally; no payment data goes to an outside QR service.
- **Privacy by default.** Solo data never leaves the browser. Usage counters are
  aggregate, carry no names, numbers or amounts, and can be switched off.

## Stack

Webpack single-page app, Node serverless functions on Vercel, Upstash Redis for shared
tables, and tests with `node:test` covering rebuys, rounding, gating and QR encoding.
