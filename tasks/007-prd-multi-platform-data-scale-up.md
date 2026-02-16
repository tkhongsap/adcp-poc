# PRD: Multi-Platform Synthetic Data Scale-Up

> **Save to:** `/tasks/007-prd-multi-platform-data-scale-up.md`
> **Prerequisite:** Enable Claude Code Agent Teams (see Technical Considerations)

---

## 1. Introduction/Overview

The ADCP Sales Demo currently operates with a small, single-platform data set: 5 campaigns, 10 products, all programmatic display/video. Following a successful demo with Adform's country manager (which led to board-level interest and a potential proof-of-concept with Chang'an Automobile), the platform needs to scale up significantly.

This PRD covers expanding the data layer to support **6 advertising platforms** with **8-10 brands** and **~40-50 campaigns**, creating a realistic multi-platform advertising portfolio. The AI agent should be able to analyze performance across Facebook Ads, Google Ads, programmatic display, social influencer campaigns, car dealership advertising, and CRM outcome data — demonstrating that the ADCP can handle real-world, cross-channel media operations.

**Key Message**: "We can rebuild marketing operations from the ground up for the AI era."

---

## 2. Goals

- Scale from 5 campaigns on 1 platform to **~40-50 campaigns across 6 platforms**
- Introduce **synthetic data** for Facebook Ads, Google Ads, Social Influencer, Car Sales (advertising), and CRM (outcome/attribution data)
- Maintain **statistically plausible metrics** with embedded optimization opportunities the AI can discover and recommend
- Preserve backward compatibility — existing demo flows (Apex Motors pause/resume, delivery reports) must continue working
- Support **cross-platform portfolio analysis** (e.g., "How is Facebook performing vs Google for TechFlow?")
- Enable the AI to **correlate advertising data with CRM outcomes** (e.g., "Which platform is driving the most qualified leads?")
- Use **Claude Code Agent Teams** to parallelize implementation across 4 specialized teammates

---

## 3. User Stories

### Data Architecture Stories

#### US-101: Extend data types for multi-platform support
#### US-102: Update data loader for multi-file platform data
#### US-103: Migrate existing data to platform format

### Platform Data Stories

#### US-104: Generate Facebook Ads synthetic data
#### US-105: Generate Google Ads synthetic data
#### US-106: Generate Social Influencer synthetic data
#### US-107: Generate Car Sales advertising data
#### US-108: Generate CRM outcome/attribution data

### Tool & Integration Stories

#### US-109: Add platform filter to get_products tool
#### US-110: Update system prompt for multi-platform awareness
#### US-111: Compute cross-platform aggregations
#### US-112: Add platform filter to get_media_buy_delivery tool

---

## Status: IMPLEMENTING
