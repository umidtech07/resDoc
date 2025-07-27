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
EXPOSE 3000




# Start React dev server
CMD ["npm", "start"]
