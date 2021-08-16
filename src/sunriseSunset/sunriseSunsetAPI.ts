import { URL } from "url";
import axios from "axios";

type SunriseSunsetDto = {
  sunrise: string,
  sunset: string,
  solar_noon: string,
  /**
   * The day length in seconds.
   */
  day_length: number,
  civil_twilight_begin: string,
  civil_twilight_end: string,
  nautical_twilight_begin: string,
  nautical_twilight_end: string,
  astronomical_twilight_begin: string,
  astronomical_twilight_end: string
};

export type SunriseSunset = {
  sunrise: Date,
  sunset: Date,
  solarNoon: Date,
  dayLengthSeconds: number,
  civilTwilightBegin: Date,
  civilTwilightEnd: Date,
  nauticalTwilightBegin: Date,
  nauticalTwilightEnd: Date,
  astronomicalTwilightBegin: Date,
  astronomicalTwilightEnd: Date
};

enum SunriseSunsetRequestStatus {
  Ok = "OK",
  InvalidRequest = "INVALID_REQUEST",
  InvalidDate = "INVALID_DATE",
  UnknownError = "UNKNOWN_ERROR"
}

type SunsetSunriseResponse = {
  results: SunriseSunsetDto,
  status: SunriseSunsetRequestStatus
};

const apiUrl = "https://api.sunrise-sunset.org/json";
const apiLatitudeParam = "lat";
const apiLogituteParam = "lng";
const apiFormattedDateParam = "formatted";
const apiFormattedDateParamValue = "0";

/**
 * 
 * @param latitude 
 * @param longitude 
 * @returns The ULR object with the latitude and longitude params
 */
const buildRequestUrl = (latitude: number, longitude: number): URL => {
  const url = new URL(apiUrl);
  url.searchParams.set(apiLatitudeParam, latitude.toString());
  url.searchParams.set(apiLogituteParam, longitude.toString());
  url.searchParams.set(apiFormattedDateParam, apiFormattedDateParamValue);
  return url;
}

const mapSunriseSunset = (sunriseSunsetDto: SunriseSunsetDto): SunriseSunset => {
  return {
    sunrise: new Date(sunriseSunsetDto.sunrise),
    sunset: new Date(sunriseSunsetDto.sunset),
    solarNoon: new Date(sunriseSunsetDto.solar_noon),
    dayLengthSeconds: sunriseSunsetDto.day_length,
    civilTwilightBegin: new Date(sunriseSunsetDto.civil_twilight_begin),
    civilTwilightEnd: new Date(sunriseSunsetDto.civil_twilight_end),
    astronomicalTwilightBegin: new Date(sunriseSunsetDto.astronomical_twilight_begin),
    astronomicalTwilightEnd: new Date(sunriseSunsetDto.astronomical_twilight_end),
    nauticalTwilightBegin: new Date(sunriseSunsetDto.nautical_twilight_begin),
    nauticalTwilightEnd: new Date(sunriseSunsetDto.nautical_twilight_end)
  }
};

/**
 * 
 * @param latitude 
 * @param logitude 
 * @returns SunriseSunset object for the given coordinates or an Error object
 * @async
 */
export const fetchSunriseAndSunset = async (latitude: number, logitude: number): Promise<SunriseSunset | Error> => {

  const url = buildRequestUrl(latitude, logitude);
  try {
    const response = await axios.get<SunsetSunriseResponse>(url.toString());
    const sunsetSunriseResponse = response.data;
    if (sunsetSunriseResponse.status !== SunriseSunsetRequestStatus.Ok)
      return new Error(`Api call unsuccessful, response status: ${sunsetSunriseResponse.status}`)

    return mapSunriseSunset(sunsetSunriseResponse.results);
  } catch (error) {
    let errorMessage = "Error while making the api call!";
    if (error.response) {
      errorMessage += `\n\tResponse status: ${error.response.status}`;
      errorMessage += `\n\tResponse data: ${error.response.data}`;
      errorMessage += `\n\tResponse headers: ${error.response.headers}`;
    }
    return new Error(errorMessage);
  }
}

