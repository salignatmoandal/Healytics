FROM node:18

WORKDIR /app

# Installer Expo CLI globalement
RUN npm install -g expo-cli

# Copier les fichiers de dépendances
COPY package.json package-lock.json* ./

# Installer les dépendances
RUN npm install

# Copier le reste du code source
COPY . .

# Exposer le port pour Expo
EXPOSE 19000
EXPOSE 19001
EXPOSE 19002

# Commande pour démarrer l'application
CMD ["npm", "start"]