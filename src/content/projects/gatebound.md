---
title: Gatebound
short: '3D browser action game'
tagline: A 3D browser game I built by directing AI agents, kept honest by 640+ tests, CI and a bot that plays every level to measure the difficulty.
tier: featured
order: 3
year: '2026'
role: Solo, built with Claude Code
status: live
stack: [TypeScript, Three.js, Vite, Vitest, Web Audio, GitHub Actions]
live: https://tandx28.github.io/gatebound/
repo: https://github.com/tandx28/gatebound
cover: ../../assets/shots/gatebound.jpg
accent: '#60a5fa'
stats:
  - { value: '27k', label: 'lines of TypeScript' }
  - { value: '640+', label: 'unit tests' }
  - { value: '0', label: 'audio or texture files' }
---

## What it is

A top-down 3D dungeon crawler that runs in the browser. You play the lowest-ranked
hunter in the city of Veyra, who wakes up with a system only they can see. Gates
of rank E to S open onto generated rooms that end in a boss with phases. You
level to 60, collect gear in six rarities, choose one of four classes and raise
an army of "echoes" from what you defeat. The world, characters and story are
all original.

## How it is built

The game is split into three layers that only depend downward:

- **Simulation**: plain TypeScript on a 2D plane. One `World` object and a fixed
  120 Hz `step()`. It never touches the DOM, WebGL, the clock or `Math.random`,
  so every rule can be unit-tested and replayed from a seed.
- **Presentation**: a Three.js scene and a 2D canvas HUD that only read the
  world. Figures are either jointed rigs built from boxes or skinned CC0 models.
  All sound and music is synthesised in code.
- **Shell**: the frame loop, input, saves in `localStorage` and recovery from a
  lost WebGL context.

## Things I am proud of

- **Difficulty is measured.** A scripted bot plays every rank and a test pins how
  it fares: a wall at the entry level, routine by the end. Changing a combat
  number means re-running the report, not guessing.
- **Every hit is fair.** Each damaging attack is telegraphed on the ground before
  it lands, and a test checks that nothing hurts on its first frame.
- **Saves survive releases.** The save format is versioned and validated field
  by field, with migration tests that load old saves.
- **Continuous deployment.** Every push to `main` runs the tests, builds and
  publishes to GitHub Pages.
