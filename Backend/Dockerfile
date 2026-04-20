FROM node:20-alpine

WORKDIR /app

# Copiamos archivos de dependencias
COPY package*.json ./

# Instalamos dependencias
RUN npm install

# Copiamos todo el contenido de la carpeta Backend al contenedor
COPY . .

# EXPOSE es informativo
EXPOSE 3100

# IMPORTANTE: Usamos la ruta exacta que definiste en tu package.json
# Primero corre el setup de la DB y luego arranca el servidor en src/app.js
CMD ["sh", "-c", "node scripts/setup.js && node src/app.js"]