# Cloud Server Deployment Guide

This guide covers provisioning a fresh cloud server (Ubuntu 22.04 LTS or 24.04 LTS) and deploying the IEDC platform backend and observability stack.

## Architecture

The frontend is deployed automatically via Vercel.
The backend is deployed via GitHub Actions to a Cloud Server (EC2/DigitalOcean/Hetzner).

* **Reverse Proxy**: Caddy handles automatic Let's Encrypt HTTPS certificates and routes traffic.
* **Internal Network**: PostgreSQL, Redis, Prometheus, and Tempo are locked inside the Docker network. They are not accessible from the public internet.

---

## Step 1: Server Provisioning

Create a new VPS instance and SSH into it:

```bash
ssh root@<your_server_ip>
```

### Install Docker & Docker Compose

Run the official Docker installation script:

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### Configure UFW (Firewall)

Lock down the server to only allow SSH (22), HTTP (80), and HTTPS (443):

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## Step 2: Clone the Repository

Clone the project to the server (you may need to set up deploy keys if the repo is private):

```bash
sudo mkdir -p /opt/iedc
sudo chown -R $USER:$USER /opt/iedc
git clone https://github.com/rohith-roblelal/IEDC.git /opt/iedc
cd /opt/iedc
```

---

## Step 3: Configure Environment Variables

Copy the example production config and fill in your secrets:

```bash
cp .env.production.example .env
nano .env
```

Ensure the following variables are strictly correct:
* `DOMAIN_API` (e.g. `api.iedcsnmimt.com`)
* `DOMAIN_GRAFANA` (e.g. `grafana.iedcsnmimt.com`)
* `POSTGRES_PASSWORD` (make this secure!)
* `SUPABASE_SERVICE_ROLE_KEY`
* `FRONTEND_URLS`

---

## Step 4: Configure DNS Records

Go to your domain registrar (e.g., Cloudflare, Namecheap, Route53) and point your A Records to the Server IP:

* `A Record` for `api.yourdomain.com` -> `<SERVER_IP>`
* `A Record` for `grafana.yourdomain.com` -> `<SERVER_IP>`

*Note: DNS propagation can take up to 24 hours but is usually instant.*

---

## Step 5: First Manual Deployment

Before GitHub Actions can automate this, verify it works manually:

```bash
cd /opt/iedc
bash scripts/deploy.sh
```

Wait a few minutes, then visit `https://api.yourdomain.com/api/v1/health`. You should see `{ "status": "ok" }`.

---

## Step 6: GitHub Actions CI/CD Setup

To automate future deployments on every `git push` to `main`, add the following Secrets to your GitHub Repository (`Settings` > `Secrets and variables` > `Actions`):

1. **`PROD_SERVER_IP`**: The public IP address of your server.
2. **`PROD_SERVER_USER`**: The SSH user (e.g., `root` or `ubuntu`).
3. **`PROD_SSH_PRIVATE_KEY`**: The raw private SSH key used to authenticate with the server.

Once configured, any push to `main` will trigger the `deploy-production.yml` workflow, which SSHs into the server, pulls code, rebuilds the Docker image, applies migrations, and restarts the containers automatically with zero downtime.
