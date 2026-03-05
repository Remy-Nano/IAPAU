# Deploiement OVH Manuel (Docker)

Ce document decrit la procedure reelle de deploiement actuellement utilisee sur le VPS OVH.

## Contexte constate

- Hebergement: VPS OVH (`vps-ae28ab08.vps.ovh.net`)
- Runtime app: conteneur Docker
- Conteneur actif observe: `studia`
- Image observee: `studia:1.0.0`
- Politique de redemarrage: `unless-stopped`
- Exposition port: `3000:3000`
- Pas de CD automatique detecte a ce stade:
  - pas de cron `ubuntu` ni `root`
  - pas de service `pm2`
  - pas de service/timer `deploy` ou `watchtower`

## 1) Se connecter au VPS

```bash
ssh ubuntu@51.255.203.117
```

## 2) Aller dans le dossier projet

Exemples:

```bash
cd /var/www/...
# ou
cd /home/ubuntu/...
```

Verifier:

```bash
pwd
ls -la
```

## 3) Mettre a jour le code

```bash
git pull
```

Option recommandee:

```bash
git status
git log -1 --oneline
```

## 4) Rebuild de l'image Docker

Le repo contient un `Dockerfile` multi-stage pour Next.js production.

```bash
docker build -t studia:1.0.0 .
```

Si tu veux versionner les images:

```bash
docker build -t studia:$(date +%Y%m%d-%H%M) .
```

## 5) Remplacer le conteneur en production

```bash
docker stop studia || true
docker rm studia || true
docker run -d \
  --name studia \
  --restart unless-stopped \
  -p 3000:3000 \
  studia:1.0.0
```

Si ton app depend d'un fichier d'environnement:

```bash
docker run -d \
  --name studia \
  --restart unless-stopped \
  --env-file .env.docker \
  -p 3000:3000 \
  studia:1.0.0
```

## 6) Verifications apres deploiement

```bash
docker ps
docker logs --tail 100 studia
curl -I http://localhost:3000/api/health
```

Si un domaine/proxy est en place, verifier aussi en externe:

```bash
curl -I https://ton-domaine
```

## 7) Rollback rapide

Si tu as tagge une image precedente:

```bash
docker images | head
docker stop studia
docker rm studia
docker run -d --name studia --restart unless-stopped -p 3000:3000 studia:<tag-precedent>
```

## 8) Check "CD automatique ou non"

Commandes de diagnostic:

```bash
crontab -l
sudo crontab -l
systemctl --no-pager list-timers --all
systemctl --no-pager list-units --type=service | grep -Ei "pm2|node|docker|deploy|watchtower"
docker ps
pm2 list
```

Interpretation:

- Si pas de webhook/cron/service deploy: deploiement manuel
- Si pipeline/hook relance build+run apres push: CD automatique

## 9) Amelioration simple vers semi-automatique

Option minimale:

1. Ajouter un script serveur `deploy.sh` (git pull + docker build + docker run)
2. Lancer ce script via SSH depuis GitHub Actions sur merge branche principale

Cela permet d'annoncer:

- CI: deja en place (tests/build)
- CD: semi-automatique ou automatique selon ton choix final

## 10) CD automatique configure (GitHub Actions -> OVH)

Un workflow est ajoute dans le repo:

- `.github/workflows/cd-ovh.yml`

Declenchement:

- automatique apres succes du workflow CI sur `main`
- manuel possible via `workflow_dispatch` (bouton "Run workflow")

### Secrets GitHub a creer

Dans GitHub: `Settings` -> `Secrets and variables` -> `Actions` -> `New repository secret`

- `OVH_SSH_HOST`: IP ou hostname du VPS (ex: `51.255.203.117`)
- `OVH_SSH_USER`: utilisateur SSH (ex: `ubuntu`)
- `OVH_SSH_PRIVATE_KEY`: cle privee SSH (contenu complet)
- `OVH_SSH_PORT`: port SSH (souvent `22`)
- `OVH_APP_DIR`: chemin absolu du projet sur VPS (ex: `/home/ubuntu/IAPAU-main`)

### Ce que fait le CD

Sur le VPS, le workflow execute:

```bash
cd "$OVH_APP_DIR"
git fetch origin main
git checkout main
git pull --ff-only origin main
docker compose build --pull web
docker compose up -d web
curl -fsS http://localhost:3000/api/health
```

### Verification

1. Faire un commit sur `main`.
2. Verifier dans `GitHub -> Actions` que:
   - `CI - E2E (Playwright + Mongo)` passe
   - `CD - OVH VPS` passe ensuite
3. Confirmer sur VPS:

```bash
docker compose ps
docker compose logs --tail=100 web
```

### Important

- Le serveur doit deja avoir:
  - git
  - docker + docker compose plugin
  - le repo clone dans `OVH_APP_DIR`
- Si l'utilisateur SSH n'a pas acces a Docker:
  - ajouter l'utilisateur au groupe docker
  - ou executer via sudo (a adapter dans le workflow)
