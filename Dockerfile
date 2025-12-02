# ──────────────────────────────────────────
# Base image: Bun official
# ──────────────────────────────────────────
FROM oven/bun:1.0.35 as base

WORKDIR /app

# Copy app files
COPY package.json bun.lockb ./
COPY src ./src
COPY ffmpeg ./ffmpeg

RUN chmod +x ./ffmpeg/ffmpeg

# Install deps
RUN bun install --production

# Expose port
EXPOSE 8080

# Start app
CMD ["bun", "run", "src/index.ts"]
