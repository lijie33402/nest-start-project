# 多阶段构建优化镜像大小
FROM node:20-alpine AS builder

# 创建并设置工作目录
WORKDIR /app

# 复制依赖文件
COPY package*.json yarn.lock ./

# 安装所有依赖（包括开发依赖，用于构建）
RUN yarn install --frozen-lockfile

# 复制源代码
COPY . .

# 构建应用
RUN yarn build

# 生产环境镜像
FROM node:20-alpine AS production

# 创建应用用户
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

# 设置工作目录
WORKDIR /app

# 复制依赖文件
COPY package*.json yarn.lock ./

# 只安装生产依赖
RUN yarn install --frozen-lockfile --production && yarn cache clean

# 复制构建产物和配置
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/config ./config

# 修改文件所有者
RUN chown -R nestjs:nodejs /app
USER nestjs

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["yarn", "start:prod"] 