FROM node:22-alpine AS builder

WORKDIR /app

# Enable Corepack so Docker can use Yarn v4
RUN corepack enable

# Copy files
COPY package.json yarn.lock .yarnrc.yml ./

# Install dependencies
RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]