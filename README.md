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
CODIMD_FQDN=yourcodimdserver.com
CODIMD_EMAIL=your@mail.com
CODIMD_PASSWORD=yourpassword
EOF
```

## Usage

To run the program, run:

```bash
python3 main.py
```