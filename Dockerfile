# Use the official Node.js image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package.json ./
COPY package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

COPY .env ./

# Build the application
RUN npm run build

# Expose the port the app runs on
EXPOSE 4173

# Start the application
CMD ["npm", "run", "preview"]
