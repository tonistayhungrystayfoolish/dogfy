FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY pnpm-lock.yaml ./

RUN npm install -g pnpm
RUN pnpm install --no-frozen-lockfile

COPY . .

EXPOSE 3000

ENV NODE_ENV=production

CMD ["npx", "tsx", "src/main.ts"]