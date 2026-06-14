FROM node:22-alpine
RUN apk add --no-cache openssl
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci && npx prisma generate
COPY . .
RUN npm run build
EXPOSE 4000
RUN chmod +x docker-entrypoint.sh
CMD ["./docker-entrypoint.sh"]
