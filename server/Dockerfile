FROM node:20-alpine

WORKDIR /app

# Copy package.json and package-lock.json (if available)
# We assume the server dependencies are in the root package.json or a separate one?
# Looking at the file structure, there is a root package.json.
# The server seems to be part of the same repo but runs separately.
# Let's check if there is a package.json inside server/
# The list_dir of server/ showed: config, index.js, models, routes. No package.json.
# So it uses the root package.json.

COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy server source code
COPY server ./server

# Expose port
EXPOSE 9002

# Start the server
CMD ["npm", "run", "server"]
