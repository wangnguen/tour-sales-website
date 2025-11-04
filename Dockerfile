FROM node:22-alpine AS builder

# Set workdir
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies (production=false vì cần build SSR)
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

FROM node:22-alpine

WORKDIR /app

# Copy only built files + node_modules
COPY --from=builder /app /app

# Thiết lập biến môi trường
ENV NODE_ENV=development \
  PORT=3000

# Expose cổng
EXPOSE 3000

# Lệnh khởi chạy
CMD ["yarn", "start"]
