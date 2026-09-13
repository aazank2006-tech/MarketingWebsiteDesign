FROM node:20-slim

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .
RUN npm run build

ENV PORT=8000
EXPOSE 8000

# GROQ_API_KEY, ALLOWED_ORIGINS, GROQ_MODEL etc. are read from the
# container's environment at runtime -- pass them with `docker run -e ...`
# or your platform's secret manager. Do not bake them into the image.
CMD ["node", "dist/app.js"]
