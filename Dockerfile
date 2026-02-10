# Use Node.js LTS (Long Term Support) image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Create directory for uploads if it doesn't exist
RUN mkdir -p uploads tmp/uploads

# Expose the port the app runs on
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
