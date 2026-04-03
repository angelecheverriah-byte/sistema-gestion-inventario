FROM node:20-alpine

WORKDIR /app

# Copiamos solo los package para aprovechar el cache de capas de Docker
COPY package*.json ./

RUN npm install

# Copiamos el resto del código (respetando el .gitignore)
COPY . .

EXPOSE 3100

# Ejecutamos el setup de las tablas antes de iniciar el servidor
CMD node scripts/setup.js && npm start