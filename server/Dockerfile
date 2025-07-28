# Base image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
RUN npm install

# Copy rest of the app
COPY . .

# Expose port
EXPOSE 5000

# Start server
CMD ["npm", "start"]
