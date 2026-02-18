FROM node:22-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm@9

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json apps/api/
COPY packages/core/package.json packages/core/
COPY packages/node/package.json packages/node/
COPY packages/react/package.json packages/react/
COPY packages/vue/package.json packages/vue/

RUN pnpm install --frozen-lockfile || pnpm install

COPY apps/api/ apps/api/

WORKDIR /app/apps/api
RUN npx nest build

FROM node:22-alpine

WORKDIR /app

RUN npm install -g pnpm@9

COPY --from=builder /app/pnpm-lock.yaml /app/pnpm-workspace.yaml /app/package.json ./
COPY --from=builder /app/apps/api/package.json apps/api/
COPY --from=builder /app/packages/core/package.json packages/core/
COPY --from=builder /app/packages/node/package.json packages/node/
COPY --from=builder /app/packages/react/package.json packages/react/
COPY --from=builder /app/packages/vue/package.json packages/vue/

RUN pnpm install --frozen-lockfile --prod || pnpm install --prod

COPY --from=builder /app/apps/api/dist apps/api/dist

WORKDIR /app/apps/api

EXPOSE 15560

CMD ["node", "dist/main"]
