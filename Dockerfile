# Use an official Node.js runtime as a parent image
FROM node:18-bullseye

# Set the working directory in the container
WORKDIR /app

# Copy package.json and yarn.lock to the working directory
COPY package.json yarn.lock ./
COPY prisma/ ./prisma
# Install dependencies
RUN yarn install
RUN yarn prisma:generate

# Copy the rest of the application source code to the working directory
COPY . .

# Expose the port your app runs on
EXPOSE 5000


# Command to run your application
CMD ["yarn", "start"]

