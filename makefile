APP_NAME=lms
BACKEND_DIR=backend
FRONTEND_DIR=frontend
DOCKER_COMPOSE=docker-compose
help:
	@echo "Available commands:"
	@echo " make docker-build   → build docker images"
	@echo " make docker-up      → start full stack"
	@echo " make docker-down    → stop containers"
	@echo " make clean          → clean all"

build-back:
	cd $(BACKEND_DIR) && mvn clean package

# ========================
# DOCKER
# ========================
docker-build:
	$(DOCKER_COMPOSE) build

docker-up:
	$(DOCKER_COMPOSE) up -d

docker-down:
	$(DOCKER_COMPOSE) down

docker-logs:
	$(DOCKER_COMPOSE) logs -f

docker-restart: 
	docker-down docker-up

# ========================
# CLEAN
# ========================
clean:
	cd $(BACKEND_DIR) && mvn clean
	cd $(FRONTEND_DIR) && rm -rf node_modules dist
	$(DOCKER_COMPOSE) down -v
