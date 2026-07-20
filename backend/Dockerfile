FROM node:20-slim

WORKDIR /app

# OpenSSL is required by the Prisma query engine
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE $PORT

CMD ["npm", "start"]
