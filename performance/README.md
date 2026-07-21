# Performance Testing Framework

This repository contains the performance, load, and stress testing suite for the IEDC website.

## Prerequisites

- Docker and Docker Compose
- k6
- Make

## Quick Start

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Start the monitoring stack:
   ```bash
   make monitor-up
   ```

3. Run a local smoke test:
   ```bash
   make local
   ```

## Folder Structure

- `monitoring/`: Docker configuration for Grafana, Prometheus, Loki, Tempo.
- `k6/`: Load testing scripts, scenarios, and configuration.
- `scripts/`: Shell scripts for executing tests against different environments.
- `docs/`: Detailed performance testing documentation and plans.
