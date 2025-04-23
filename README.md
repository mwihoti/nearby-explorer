# Nearby Explorer - Location Discovery and Sharing App

## Overview

Nearby Explorer is a web application that helps users discover and share interesting places around them. Using OpenStreetMap data and modern web technologies, it provides an interactive map interface where users can explore their surroundings, find points of interest, and share locations with others through unique, shareable links.

## Features

- **Location-Based Discovery**: Find restaurants, hotels, attractions, and more near your current location
- **Advanced Sharing Options**: Share places via QR codes, direct links, or popular map services
- **Marker Clustering**: Efficiently display large numbers of locations with automatic clustering
- **Category Filtering**: Filter places by type (restaurants, hotels, attractions, etc.)
- **Directions**: Get distance and time estimates between your location and points of interest
- **Saved Places**: Save your favorite locations for quick access later
- **Mobile Responsive**: Works seamlessly on both desktop and mobile devices

## Demo

[Watch the demo video](https://www.youtube.com/watch?v=kHsWO4yXHTM&ab_channel=Mwihoti8Dan)

## Installation and Setup

### Prerequisites

- Node.js (v18 or higher)
- MongoDB database
- OpenCage API key (for geocoding)

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
MONGODB_URI=your_mongodb_connection_string
OPENCAGE_API_KEY=your_opencage_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000 
```

### Installation Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/mwihoti/nearby-explorer.git
   cd nearby-explorer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Building for Production

```bash
npm run build
npm start
```
## Running with Docker

NearbyExplorer can be easily run using Docker, which ensures a consistent environment across different machines. Here's how to get started:

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed on your machine
- [Docker Compose](https://docs.docker.com/compose/install/) (included with Docker Desktop for Windows/Mac)

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/nearby-explorer.git
   cd nearby-explorer/explorer
   ```
2. **Environment Setup:**
Create a .env file in the root directory with your environment variables:

3. **Build and Start the Containers:**

```docker-compose up -d```

4. **Access the application**
```docker-compose up -d```

5. **Stopping application**
   ```docker-compose down```


## How It Works

Nearby Explorer uses a combination of modern web technologies to provide a seamless location discovery experience:

1. **Location Detection**: The app uses browser geolocation or IP-based location to determine your position.

2. **Data Sources**: Places are fetched from OpenStreetMap's Overpass API, providing rich, community-maintained data.

3. **Interactive Map**: Built with React Leaflet, the map interface allows for intuitive exploration.

4. **Sharing System**: The app generates unique URLs for each location that can be shared via:
   - Direct links
   - QR codes (for easy mobile scanning)
   - Integration with Google Maps and OpenStreetMap

5. **Offline Support**: Local caching of recently viewed places allows for some offline functionality.

## Why Use Nearby Explorer?

Unlike mainstream map applications, Nearby Explorer focuses on discovery and sharing. The app is designed to help you find interesting places around you and share them easily with friends and family. The integration with multiple map services gives users flexibility in how they view and navigate to shared locations.

The marker clustering system makes it easy to explore dense urban areas without overwhelming the map interface, and the category filtering helps you find exactly what you're looking for.

## Technologies Used

- Next.js (React framework)
- MongoDB (database)
- Leaflet (mapping library)
- OpenStreetMap & Overpass API (location data)
- OpenCage (geocoding)
- Tailwind CSS & shadcn/ui (styling)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Discord: danmwi
