---
title: Local AI content pipeline
short: 'local LLM + image model pipeline'
tagline: A pipeline that plans, writes, reviews, illustrates, narrates and renders a short video entirely with local models, then uploads it through the YouTube API. No API costs.
tier: featured
order: 6
year: '2026'
role: Solo developer
status: private
stack: [Python, Ollama, Qwen, FLUX, FFmpeg, YouTube Data API]
accent: '#c084fc'
stats:
  - { value: '$0', label: 'per run in API fees' }
  - { value: '5', label: 'stages, each checkable' }
---

## What it does

Each run produces a five-scene illustrated learning story: a local language model (Qwen 9B on
Ollama) plans and writes it, then reviews its own draft against a checklist; a local image
model (FLUX) draws one reference portrait and uses it to keep the character consistent across
scenes; macOS speech narrates; FFmpeg renders a 720p video; the YouTube Data API uploads it.

## Engineering choices

- **Local models, zero marginal cost.** Everything runs on one Mac, so a daily job costs nothing
  per run. The trade-off is time and disk, which the README documents.
- **Every stage writes files.** The plan, images, audio and video are saved per day, so a bad
  scene can be regenerated alone instead of rerunning the whole pipeline.
- **No double uploads.** The job records the video ID after upload and stops if a previous run
  was interrupted mid-upload, so a retry never publishes twice.
- **Honest limits.** Automated checks cannot judge whether a story is good, so the README says
  plainly that a human reviews the first videos.

The project is archived; it was a study in running a full generative pipeline on local hardware.
