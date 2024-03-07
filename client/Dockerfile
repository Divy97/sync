# Use an official Node.js runtime as a parent image
# Use an official Node.js runtime as a parent image
FROM node:latest

# Set the working directory in the container
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed packages specified in package.json
RUN npm install

# Build the frontend application
RUN npm run build

# Make port 80 available to the world outside this container
EXPOSE 80

# Start the app
CMD ["npm", "run", "dev"]
