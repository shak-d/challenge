import { fetchSunriseAndSunset, SunriseSunset } from "./sunriseSunset/sunriseSunsetAPI";

type Coordinates = {
  latitude: number,
  longitude: number
};

const maxApiSimultaneusRequests = 2;

const minLatitude = -90;
const maxLatitude = 90;
const minLongitude = -180;
const maxLongitude = 180;

/**
 * 
 * @param min 
 * @param max
 * @returns A random number between min(inclusive) and max(inclusive) with a 3 dicimals precision
 */
const generateRandomNumber = (min: number, max: number) => Math.round((Math.random() * (max - min + 1) + min) * (1000)) / (1000);
const generateRandomLatitude = () => generateRandomNumber(minLatitude,maxLatitude);
const generateRandomLongitude = () => generateRandomNumber(minLongitude,maxLongitude);

/**
 * Generates a random array of coordinates and prints the length of day in seconds of the location with the earliest sunrise 
 * 
 * @param randomCoordinatesAmount The amount of random coordinates to generate
 */
const challenge = (randomCoordinatesAmount: number) => {

  const randomCoordinatesArray: Coordinates[] = [];
  let returnedFetches = 0;
  let earliestCoordinatesSunset: SunriseSunset | null = null;

  for (let i = 0; i < randomCoordinatesAmount; i++) {
    const randomCoordinates: Coordinates = {
      latitude: generateRandomLatitude(),
      longitude: generateRandomLongitude()
    }
    randomCoordinatesArray.push(randomCoordinates);
  }

  const finalizeCheckFinishedAndPrint = () => {
    returnedFetches++;
    if (returnedFetches === randomCoordinatesAmount) {
      if (earliestCoordinatesSunset)
        console.info(`day length of earliest sunset: ${earliestCoordinatesSunset.dayLengthSeconds}`);
      else
        // Successful fetches in locations where there is no sunrise are considered a fail
        console.info('All fetches have failed or there is no sunrise!');
    }
  }

  const logError = (error: any) => console.error(error);

  const fetchCallback = (coordinates: Coordinates, result: SunriseSunset | Error) => {
    if (result instanceof Error) {
      logError(result);
    }
    else {
      if (result.dayLengthSeconds === 0) {
        console.info(`Seems like the coordinates[lat=${coordinates.latitude} lon=${coordinates.longitude}] are too close to the pole, there may not be any sunrise there!`);
      }
      else if (earliestCoordinatesSunset === null || result.sunrise < earliestCoordinatesSunset.sunrise) {
        earliestCoordinatesSunset = result;
      }
      fetchNextCoordinatesSunrise();
    }
  }

  const fetchNextCoordinatesSunrise = () => {
    const nextCoordinates = randomCoordinatesArray.pop();
    if (nextCoordinates)
      fetchSunriseAndSunset(nextCoordinates.latitude, nextCoordinates.longitude)
        .then((result) => fetchCallback(nextCoordinates, result))
        .catch(logError)
        .finally(finalizeCheckFinishedAndPrint);
  };

  for (let i = 0; i < maxApiSimultaneusRequests; i++) {
    fetchNextCoordinatesSunrise();
  }

}

challenge(10);