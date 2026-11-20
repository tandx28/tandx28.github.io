---
title: Content pipeline service
short: 'scheduled media pipeline (building)'
tagline: A scheduled backend pipeline that plans, renders and publishes short videos end to end, built as small restartable stages with idempotent uploads. In progress.
tier: featured
order: 6
year: '2026'
role: Solo developer
status: in progress
stack: [Python, FFmpeg, YouTube Data API, launchd, Ollama]
accent: '#c084fc'
stats:
  - { value: '5', label: 'restartable stages' }
  - { value: '0', label: 'duplicate uploads by design' }
---

## What I'm building

A backend job that turns a topic into a finished, uploaded video every day without anyone
touching it: plan the content, generate assets, add narration, render with FFmpeg and publish
through the YouTube Data API. The first version runs on one machine on a schedule; the
current work is making it portable.

## How it is put together

- **Stages with files in between.** Each stage writes its output (plan, images, audio, video,
  state) to a dated folder, so any stage can be rerun alone instead of redoing the whole job.
- **Idempotent publishing.** The job records the video ID after upload and refuses to retry
  blindly if a previous run stopped mid-upload, so a network failure can never post twice.
- **Scheduled like a service.** A macOS LaunchAgent runs it daily with logs to disk; OAuth
  tokens and settings live outside the repository.
- **Local generation, no API bill.** Content and images come from local models today, so a
  daily run costs nothing beyond the machine it runs on.

## What's next

Add the hosted-model adapters, package the pipeline in a container, move the schedule to a
cloud runner, and add health checks and alerts so a failed day is noticed. This is where I'm
practising the DevOps side: deployment, scheduling, secrets and monitoring.
