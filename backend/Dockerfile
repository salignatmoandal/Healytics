FROM oven/bun:latest

WORKDIR /app

# Copier d'abord les fichiers de configuration
COPY package.json bun.lockb ./

# Installer les dépendances
RUN bun install

# Copier le code source, mais pas node_modules
COPY src ./src
COPY prisma ./prisma
COPY tsconfig.json ./
COPY .env ./

# Générer les clients Prisma
RUN bun run prisma generate

# Exposer le port
EXPOSE 3000

# Commande de démarrage
CMD ["bun", "run", "dev"]