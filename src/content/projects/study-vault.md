---
title: Study vault and agent pipeline
short: 'nightly Canvas sync with AI agents'
tagline: A nightly pipeline that pulls every course's files, deadlines and grades from Canvas into a searchable notes vault, coordinated with a separate AI planner agent.
tier: featured
order: 2
year: '2026'
role: Solo developer
status: private
stack: [Python, Canvas API, Claude Code, Codex, Notion, Obsidian]
accent: '#1f4fd1'
stats:
  - { value: '5', label: 'modules synced nightly' }
  - { value: '2', label: 'agents with separate jobs' }
---

## The problem

Each university module keeps its files, announcements, assignments and grades in Canvas,
spread over many pages. I wanted all of it in one searchable place, every morning, without
clicking through anything.

## What it does

- **Syncs Canvas** through its API into an Obsidian vault: syllabus, assignments, pages,
  announcements, modules, submissions and feedback, plus the original files.
- **Extracts the text** of every PDF and slide deck so a single search covers the whole term.
- **Runs every night** as a scheduled agent, and only after the planner agent has finished.

## Two agents, clear boundaries

A Codex agent owns the weekly Notion planner and writes it at midnight. A Claude Code agent
runs at 00:10, waits for a "done" signal from the planner, refreshes Canvas and mirrors the
planner into the vault **read-only**. Each agent writes only its own data, so neither can
overwrite the other's work, and either can be swapped out.

## What I learned

Agents are most reliable with narrow jobs, explicit ownership of data, and a written brief
they reread every run. Keeping the brief short also keeps every nightly run cheap.
