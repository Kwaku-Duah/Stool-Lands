# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and yarn.lock to the working directory
COPY package.json yarn.lock ./

COPY prisma/ ./prisma

# Install dependencies
RUN yarn install --production

# Generate Prisma client
RUN yarn prisma:generate

# Copy the rest of the application source code to the working directory
COPY . .

# Expose the port your app runs on
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider https://stoollands-cs7f40ga.b4a.run/ || exit 1

# Command to run your application
CMD ["yarn", "start"]
