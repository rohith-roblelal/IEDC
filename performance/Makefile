.PHONY: setup local staging production clean monitor-up monitor-down

# Variables
K6_CMD=k6 run
REPORT_DIR=k6/reports
DOCKER_COMPOSE=docker-compose -f docker-compose.yml

setup:
	@echo "Setting up performance testing environment..."
	@mkdir -p $(REPORT_DIR)
	@chmod +x scripts/*.sh
	@echo "Setup complete. Don't forget to copy .env.example to .env and configure."

monitor-up:
	@echo "Starting monitoring stack..."
	$(DOCKER_COMPOSE) up -d

monitor-down:
	@echo "Stopping monitoring stack..."
	$(DOCKER_COMPOSE) down -v

local:
	@echo "Running local smoke test..."
	./scripts/run-local.sh

staging:
	@echo "Running staging load test..."
	./scripts/run-staging.sh

production:
	@echo "Running production safe test..."
	./scripts/run-production.sh

clean:
	@echo "Cleaning up reports and test data..."
	./scripts/cleanup.sh
