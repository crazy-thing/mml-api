# Use Node.js official image
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install 

# Copy app source
COPY . .

# Expose port your API runs on
EXPOSE 3000

# Start the app
CMD ["node", "server.js"]
