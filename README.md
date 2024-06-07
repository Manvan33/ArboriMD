# ArboriMD

## Setup

Make sure you have Python venv installed. If not, run:

```bash
apt install python3.10-venv
```

Then you can create a virtual environment, activate it, and install the dependencies:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Create a file called `.env` and add the following:

```bash
cat << EOF > .env
CODIMD_URL=https://yourcodimdserver.com/
CODIMD_EMAIL=your@mail.com
CODIMD_PASSWORD=yourpassword
EOF
```

If you want to use OIDC login, add the following to `.env`:

```bash
cat << EOF >> .env
OIDC_CLIENT_ID=youroidcclientid
OIDC_CLIENT_SECRET=youroidcclientsecret
OIDC_DISCOVERY_URL=https://youroidcserver.com/.well-known/openid-configuration
SECRET_KEY=$(openssl rand -hex 32)
EOF
```

Otherwise, you have to disable login

```bash
cat << EOF >> .env
LOGIN_DISABLED=True
EOF
```

If you want ArboriMD to use a proxy to access CodiMD and your OIDC server, add the following to `.env`:

```bash
cat << EOF >> .env
HTTP_PROXY="http://yourproxy:port"
```

The same proxy is used for HTTP and HTTPS.

## Usage

To run the program, run:

```bash
python3 main.py
```

## Production

We will use gunicorn to serve the app, and nginx as a reverse proxy. Gunicorn can be started with `start.sh`

Example nginx config:

```config
server {
    if ($host = a.notes.rezel.net) {
        return 301 https://$host$request_uri;
    }
    listen                    80;
    listen                    [::]:80;
    server_name               a.notes.rezel.net;
    location / {
        proxy_pass http://127.0.0.1:5000;
    }
    location /static {
        alias /opt/ArboriMD/static;
    }
}

server {
    listen                    443 ssl;
    listen                    [::]:443 ssl http2;
    server_name               a.notes.rezel.net;

    ssl_protocols TLSv1.2 TLSv1.3;

    client_max_body_size 100M;

    location / {
        proxy_pass http://127.0.0.1:5000;
        include proxy_params;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrade";
    }
    location /static {
        alias /opt/ArboriMD/static;
    }
    ssl_certificate /etc/letsencrypt/live/a.notes.rezel.net/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/a.notes.rezel.net/privkey.pem; # managed by Certbot
}
```

## Docker

A `Dockerfile` and a `docker-compose.yml` files are provided.

To run with docker, be sure to have created a `.env` file as described above and run using `docker compose up -d`.
