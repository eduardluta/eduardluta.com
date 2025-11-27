---
title: HTTP Live Streaming
date: 2020-05-31
---

I'm fascinated by the way livestreaming infrastructure has become accessible over the last few years. HLS, Apple's HTTP Live Streaming format, is still the easiest way to get solid playback across platforms.

This week I set up a simple FFmpeg pipeline that segments the stream and uploads it to object storage. A static site then serves the playlist. No servers to maintain, just a CDN in front of plain files.

The last hurdle is latency, but for most of my use cases ten seconds is totally fine. Knowing that I can ship an idea to the world with so little machinery is motivating.
