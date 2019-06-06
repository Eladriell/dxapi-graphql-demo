const { ApolloServer, gql } = require("apollo-server");
const fetch = require("node-fetch");
const cripto = require("crypto-js");

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Query {
    cart(id: String): Cart
    airOffers(
      originLocationCode: String
      destinationLocationCode: String
      departureDateTime: String
      returnDateTime: String
      commercialFareFamily: String
      travelerTypes: String
    ): AirOfferList
    getHotels: HotelReply
    weatherForecast(
      location: String
      beginDate: String
      endDate: String
    ): [Weather]
  }

  type Mutation {
    createCart: Cart
    addAirOffer(cartId: String, airOfferInput: AirOfferInput): [AirOffer]
    addExtensions(cartId: String, extensions: [ExtensionInput]): [Extension]
    addTravelers(cartId: String, travelers: [TravelerInput]): [Traveler]
    addContacts(cartId: String, contacts: ContactInput): [IContact]
    addFrequentFlyers(
      cartId: String
      frequentFlyerCards: [FrequentFlyerCardInput]
    ): [FrequentFlyerCard]
  }

  type AirOfferList {
    airOffers: [AirOffer]
  }

  type AirOffer {
    id: String
    offerItems: [OfferItem]
  }

  type OfferItem {
    id: String
    prices: AirPricingRecords
    air: AirItem
  }

  type AirPricingRecords {
    unitPrices: [UnitPrice]
    totalPrices: [Price]
  }

  type UnitPrice {
    travelerIds: [String]
    prices: [Price]
  }
  type Price {
    base: Int
    total: Int
    currencyCode: String
    totalTaxes: Int
  }

  type AirItem {
    bounds: [Bound]
    prices: AirPricingRecords
    travelerIds: [String]
    fareFamilyCode: String
    fareInfos: [FareInfo]
  }

  type Bound {
    originLocationCode: String
    destinationLocationCode: String
    prices: AirPricingRecords
    flights: [Flight]
    fareFamilyCode: String
    duration: Int
  }

  type Flight {
    id: String
    cabin: String
    bookingClass: String
    statusCode: String
    quota: Int
  }

  type FareInfo {
    fareType: String
    fareClass: String
    pricedPassengerTypeCodes: [String]
    travelerIds: [String]
    ticketDesignator: String
    flightIds: [String]
  }
  type CartReply {
    data: Cart
    dictionaries: CartDictionaries
  }
  type HotelReply {
    hotels: HotelData
  }

  type WeatherReply {
    data: WeatherData
  }

  type WeatherData {
    request: [WeatherRequest]
    weather: [Weather]
  }

  type Weather {
    date: String
    maxtempC: String
    maxtempF: String
    mintempC: String
    mintempF: String
    hourly(time: [String]): [HourlyWeather]
  }

  type HourlyWeather {
    time: String
    tempC: String
    tempF: String
    visibility: String
    weatherIconUrl: String
    weatherDesc: String
  }

  type WeatherIconUrl {
    value: String
  }

  type WeatherDesc {
    value: String
  }

  type WeatherRequest {
    type: String
    query: String
  }

  type Cart {
    id: String
    dictionaries: CartDictionaries
    travelers: [Traveler]
    contacts: [IContact]
    frequentFlyerCards: [FrequentFlyerCard]
    airOffers: [AirOffer]
    accommodations: [Accommodation]
    weather: [Weather]
    extensions: [Extension]
  }

  type CartDictionaries {
    location: LocationDic
    flight: FlightDic
  }

  type FlightDic {
    id: String
    marketingAirlineCode: String
    operatingAirlineCode: String
    operatingAirlineName: String
    marketingFlightNumber: String
    departure: FlightEndPoint
    arrival: FlightEndPoint
    aircraftCode: String
    duration: Int
    secureFlightIndicator: Boolean
  }

  type LocationDic {
    code: String
    type: String
    airportName: String
    cityCode: String
    cityName: String
    countryCode: String
  }

  type FlightEndPoint {
    locationCode: String
    dateTime: String
    terminal: String
  }

  type HotelData {
    hotels: [Accommodation]
    checkIn: String
    total: Int
    checkOut: String
  }

  type Accommodation {
    code: String
    name: String
    destinationName: String
    latitude: String
    longitude: String
    rooms: [Room]
    minRate: String
    maxRate: String
    currencyCode: String
  }

  type Extension {
    id: String
    extensionType: String
    name: String
    content: String
  }

  input ExtensionInput {
    extensionType: String
    name: String
    content: String
  }

  type Room {
    code: String
    name: String
    rates: RoomRate
  }

  type RoomRate {
    rateKey: String
    rooms: Int
    adults: Int
    children: Int
    sellingRate: String
  }

  type Traveler {
    id: String
    passengerTypeCode: String
    names: [Identity]
    dateOfBirth: Date
  }

  input TravelerInput {
    passengerTypeCode: String
    names: [IdentityInput]
    dateOfBirth: Date
    tid: String
  }

  input AirOfferInput {
    airOfferId: String
  }

  type Identity {
    firstName: String
    lastName: String
    title: String
    nameType: NameTypeEnum
    isDisplayed: Boolean
  }

  input IdentityInput {
    firstName: String
    lastName: String
    title: String
    nameType: NameTypeEnum
    isDisplayed: Boolean
  }

  interface IContact {
    id: String
    travelerIds: [String]
    travelerTIds: [String]
    addresseeName: String
    category: CategoryEnum
    contactType: ContactTypeEnum
  }

  union Contact = Email | Phone

  type Email implements IContact {
    id: String
    travelerIds: [String]
    travelerTIds: [String]
    addresseeName: String
    category: CategoryEnum
    contactType: ContactTypeEnum
    purpose: PurposeEnum
    address: String
  }

  type Phone implements IContact {
    id: String
    travelerIds: [String]
    travelerTIds: [String]
    addresseeName: String
    category: CategoryEnum
    contactType: ContactTypeEnum
    purpose: PurposeEnum
    number: String
    countryPhoneExtension: String
    deviceType: DeviceTypeEnum
  }

  type FrequentFlyerCard {
    companyCode: String
    cardNumber: String
    id: String
    tid: String
    travelerId: String
    travelerTId: String
    tierLevel: String
    tierLevelName: String
    priorityCode: String
  }

  input EmailInput {
    travelerIds: [String]
    travelerTIds: [String]
    addresseeName: String
    category: CategoryEnum
    contactType: ContactTypeEnum
    purpose: PurposeEnum
    address: String
  }

  input PhoneInput {
    travelerIds: [String]
    travelerTIds: [String]
    addresseeName: String
    category: CategoryEnum
    contactType: ContactTypeEnum
    purpose: PurposeEnum
    number: String
    countryPhoneExtension: String
    deviceType: DeviceTypeEnum
  }

  input ContactInput {
    phones: [PhoneInput]
    emails: [EmailInput]
  }

  input FrequentFlyerCardInput {
    companyCode: String
    cardNumber: String
    id: String
    tid: String
    tierLevel: String
    priorityCode: String
    travelerId: String
    travelerTId: String
  }

  enum NameTypeEnum {
    universal
    native
  }

  enum CategoryEnum {
    personal
    business
    other
  }

  enum ContactTypeEnum {
    Email
    Address
    Phone
  }

  enum PurposeEnum {
    standard
    notification
  }

  enum DeviceTypeEnum {
    mobile
    landline
    fax
  }

  scalar Date
`;

const headers = {
  Authorization: "686013859UK9iLl9p5ZbZD26R78851yd",
  Accept: "application/json",
  "Content-Type": "application/json"
};

const baseUrl = "https://proxy.digitalforairlines.com/v2";

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    cart: (_, { id }) => {
      return fetch(baseUrl + `/shopping/carts/${id}`, { headers })
        .then(res => res.json())
        .then(res => {
          /*if (res.dictionaries && res.dictionaries.flight) {
            orchestrate3PCalls(res.dictionaries.flight);
          }*/
          return {...res.data, dictionaries: res.dictionaries};
        })
        .catch(error => {
          console.error(error);
          return error;
        });
    },
    weatherForecast: (_, { location, beginDate, endDate }) => {
      return whatsTheWeather(`${location}`, `${beginDate}`, `${endDate}`);
    },
    getHotels: () => {
      const apiKeyApiTude = "ex2hcrqn8f3c3uwrevcpncs8";
      const secretApiTude = "AJfrPvArP5";
      var signature = buildSignature(apiKeyApiTude, secretApiTude);

      const headersApiTude = {
        "Api-key": apiKeyApiTude,
        "X-Signature": signature,
        Accept: "application/json",
        "Accept-Encoding": "gzip",
        "Content-Type": "application/json",
        "User-Agent": "PostmanRuntime/7.13.0",
        Connection: "keep-alive",
        "cache-control": "no-cache"
      };

      const hotelSearch = {
        stay: {
          checkIn: "2019-06-15",
          checkOut: "2019-06-16"
        },
        occupancies: [
          {
            rooms: 1,
            adults: 1,
            children: 0
          }
        ],
        geolocation: {
          latitude: 51.4703,
          longitude: -0.45342,
          radius: 20,
          unit: "km"
        }
      };
      var apiTudeUrl =
        //  "https://46ae3f94-eacd-4b68-a8e3-78201f5163f1.mock.pstmn.io";
        "https://api.test.hotelbeds.com";

      console.log(JSON.stringify(headersApiTude));
      return (
        /*
        fetch(apiTudeUrl + "/hotel-api/1.0/hotels", {
          method: "POST",
          headersApiTude,
          body: JSON.stringify(hotelSearch)
        })
        */

        fetch(
          apiTudeUrl +
            "/hotel-content-api/1.0/hotels/78677/details?language=ENG&useSecondaryLanguage=False",
          {
            method: "GET",
            headersApiTude
          }
        )
          /* .then(res => res.json())
        .then(res => {
          console.log(res);

          return res;
        });
        */

          .then(checkStatus)
          .then(res => {
            return res.json();
          })
          .then(data => data && data.hotels)
          .catch(error => {
            console.error(error);
            return error;
          })
      );
    },
    airOffers: (
      _,
      {
        originLocationCode,
        destinationLocationCode,
        departureDateTime,
        returnDateTime,
        commercialFareFamily,
        travelerTypes
      }
    ) => {
      return fetch(
        baseUrl +
          `/search/air-offers?originLocationCode=${originLocationCode}&destinationLocationCode=${destinationLocationCode}&departureDateTime=${departureDateTime}&returnDateTime=${returnDateTime}&commercialFareFamilies=${commercialFareFamily}&travelers=${travelerTypes}`,
        { headers }
      )
        .then(res => res.json())
        .then(data => data && data.data);
    }
  },
  Mutation: {
    createCart: () => {
      return fetch(baseUrl + "/shopping/carts", {
        method: "POST",
        headers
      })
        .then(res => res.json())
        .then(data => data && data.data);
    },
    addAirOffer: (_, { cartId, airOfferInput }) => {
      return fetch(baseUrl + `/shopping/carts/${cartId}/air-offers`, {
        method: "POST",
        headers,
        body: JSON.stringify(airOfferInput)
      })
        .then(res => res.json())
        .then(res => {
          if (res.dictionaries) {
            orchestrate3PCalls(res.dictionaries.flight);
          }
          return res;
        })
        .then(data => data && data.data)
        .catch(error => {
          console.error(error);
          return error;
        });
    },
    addTravelers: (_, { cartId, travelers }) => {
      return fetch(baseUrl + `/shopping/carts/${cartId}/travelers`, {
        method: "POST",
        headers,
        body: JSON.stringify(travelers)
      })
        .then(res => res.json())
        .then(data => data && data.data)
        .catch(error => {
          console.error(error);
          return error;
        });
    },
    addExtensions: (_, { cartId, extensions }) => {
      fetch(baseUrl + `/shopping/carts/${cartId}/extensions`, {
        method: "POST",
        headers,
        body: JSON.stringify(extensions)
      })
        .then(res => res.json())
        .then(data => data && data.data)
        .catch(error => {
          console.error(error);
          return error;
        });
    },
    addContacts: (_, { cartId, contacts }) => {
      return fetch(baseUrl + `/shopping/carts/${cartId}/contacts`, {
        method: "POST",
        headers,
        body: JSON.stringify([
          ...(contacts.emails || []),
          ...(contacts.phones || [])
        ])
      })
        .then(res => res.json())
        .then(data => data && data.data)
        .catch(error => {
          console.error(error);
          return error;
        });
    },
    addFrequentFlyers: (_, { cartId, frequentFlyerCards }) => {
      return fetch(baseUrl + `/shopping/carts/${cartId}/frequent-flyer-cards`, {
        method: "POST",
        headers,
        body: JSON.stringify(frequentFlyerCards)
      })
        .then(res => res.json())
        .then(data => {
          console.log(data);
          return data;
        })
        .then(data => data && data.data)
        .catch(error => {
          console.error(error);
          return error;
        });
    }
  },
  IContact: {
    __resolveType: obj => {
      return obj.contactType;
    }
  },
  Cart: {
    weather: async (cart) => {
      if (!cart || !cart.airOffers || !cart.airOffers[0] || !cart.airOffers[0].offerItems || !cart.airOffers[0].offerItems[0]
        || !cart.airOffers[0].offerItems[0].air || !cart.airOffers[0].offerItems[0].air || !cart.airOffers[0].offerItems[0].air.bounds
        || cart.airOffers[0].offerItems[0].air.bounds.length !== 2) {
        return [];
      }
      const bounds = cart.airOffers[0].offerItems[0].air.bounds;
      const destinationCode = bounds[0].destinationLocationCode;
      const destinationCityName = cart.dictionaries.location[destinationCode].cityName;
      const lastDepartureFlight = cart.dictionaries.flight[bounds[0].flights[bounds[0].flights.length - 1].id];
      const firstReturnFlight = cart.dictionaries.flight[bounds[1].flights[0].id];

      const stayBeginDate = new Date(lastDepartureFlight.arrival.dateTime);
      const stayEndDate = new Date(firstReturnFlight.departure.dateTime);

      const stayBegin = `${stayBeginDate.getFullYear()}-${stayBeginDate.getMonth()+1}-${stayBeginDate.getDate()}`;
      const stayEnd = `${stayEndDate.getFullYear()}-${stayEndDate.getMonth()+1}-${stayEndDate.getDate()}`

      const weather = await whatsTheWeather(destinationCityName, stayBegin, stayEnd);
      //console.log('Destination: ', destinationCityName);
      //console.log('Begin date: ', stayBegin);
      //console.log('End date: ', stayEnd);
      //console.log(weather);
      return weather;
    }
  },
  Weather: {
    hourly: (weather, args) => {
      if (args.time) {
        return weather.hourly.filter((hourly) => args.time.indexOf(hourly.time) >= 0);
      }
      return weather.hourly;
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});

const checkStatus = function(res) {
  if (res.ok) {
    // res.status >= 200 && res.status < 300
    console.log(res.status);
  } else {
    console.log(res.statusText);
  }
  return res;
};
const performAPICall = function(url, method, headers, body) {
  fetch(url, {
    method: method,
    headers,
    body: JSON.stringify(body)
  })
    .then(res => res.json())
    .then(data => data && data.data)
    .catch(error => {
      console.error(error);
      return error;
    });
};

const buildSignature = function(apiKey, secret) {
  var d = new Date();
  var n = d.getTime();
  var datetime = Math.floor(n / 1000);
  var signature = cripto.SHA256(apiKey + secret + datetime);
  // var byteArray = wordToByteArray(signature.words);
  var mySign = signature.toString(cripto.enc.Hex);
  console.log(mySign);
  return mySign;
};

const orchestrate3PCalls = function(flightDic) {
  if (flightDic) {
    const myFlights = [];
    Object.entries(flightDic).forEach(([key, value]) => {
      myFlights.push(value);
    });
    if (
      myFlights.length > 1 &&
      (myFlights[0].arrival && myFlights[1].departure)
    ) {
      var firstBoundArrivalDate = new Date(myFlights[0].arrival.dateTime);
      var secondBoundDepartureDate = new Date(myFlights[1].departure.dateTime);
      var beginDate = firstBoundArrivalDate.toISOString().slice(0, 10);
      var endDate = secondBoundDepartureDate.toISOString().slice(0, 10);
      var timeDiff = Math.abs(
        secondBoundDepartureDate.getTime() - firstBoundArrivalDate.getTime()
      );
      var numberOfNights = Math.ceil(timeDiff / (1000 * 3600 * 24));

      var targetLocation = {
        iataCode: myFlights[0].arrival.locationCode
      };

      //retrieve geo coordinated of target location
      fetch(
        `http://nano.aviasales.ru/places_en?term=` + targetLocation.iataCode,
        { headers }
      )
        .then(locationRes => locationRes.json())
        .then(data => {
          targetLocation.latitude = data[0].coordinates[0];
          targetLocation.longitude = data[0].coordinates[1];

          console.log();
        })
        .catch(error => {
          console.error(error);
          return error;
        });

      //Hotel API call
      console.log(
        "Calling hotel search API on " +
          JSON.stringify(targetLocation) +
          " for " +
          numberOfNights +
          " nights"
      );

      //Weather API call
      console.log(
        "Calling Weather Forecast API on " +
          targetLocation.iataCode +
          " for the period " +
          beginDate +
          " to " +
          endDate
      );
      /* var forecast = whatsTheWeather(
        targetLocation.iataCode,
        beginDate,
        endDate
      );
      */
      /* 
              var myExt = [];
              myExt[0] = {
                extensionType: "TextExtension",
                name: "Flight data",
                content: JSON.stringify({
                  targetLocation: targetLocation,
                  numberOfNights: numberOfNights
                })
              };
              //addExtensions(_, { cartId, myExt });
              fetch(baseUrl + `/shopping/carts/${cartId}/extensions`, {
                method: "POST",
                headers,
                body: JSON.stringify(myExt)
              });
              */
    }
  }
  return;
};

const addDays = function(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result
    .toISOString()
    .replace(/T.*/, "")
    .split("/")
    .reverse()
    .join("-");
};

const whatsTheWeather = function(location, beginDate, endDate) {
  var appKey = "f5aa1ec3682b494abb755813193005";
  var cityNameOrLatLon = location;
  var today = new Date();
  var bufferForLocalAPI = addDays(today, 14);

  var flagForHistoricalAPI = false;
  var urlToCall = ""; /* var secondUrlToCall = ''; */
  // For this POC, if the entire journey falls under the Local API scope (i.e., till 15 days from now),
  // then then we call the Local API, else (in the case when even a single day of journey is out of Local API scope),
  // we call the Historical API.
  if (new Date(bufferForLocalAPI) >= new Date(endDate)) {
    //USING LOCAL WEATHER API
    var urlForLocalWeatherAPI =
      "https://api.worldweatheronline.com/premium/v1/weather.ashx?key=" +
      appKey +
      "&format=json&q=" +
      cityNameOrLatLon;
    urlToCall = urlForLocalWeatherAPI;
  } else {
    //USING HISTORICAL WEATHER API
    flagForHistoricalAPI = true;
    var beginDateArr = beginDate.split("-");
    beginDateArr[0] = today.getFullYear() - 1;
    beginDate = beginDateArr.join("-");

    var endDateArr = endDate.split("-");
    endDateArr[0] = today.getFullYear() - 1;
    endDate = endDateArr.join("-");

    var urlForHistoricalWeatherAPI =
      "https://api.worldweatheronline.com/premium/v1/past-weather.ashx?key=" +
      appKey +
      "&format=json&q=" +
      cityNameOrLatLon +
      "&date=" +
      beginDate +
      "&enddate=" +
      endDate;
    urlToCall = urlForHistoricalWeatherAPI;
  }
  return fetch(urlToCall)
    .then(function(res) {
      return res.json();
    })
    .then(function(json) {
      if (flagForHistoricalAPI) {
        for (w in json.data.weather) {
          var dateArr1 = json.data.weather[w].date.split("-");
          dateArr1[0] = parseInt(dateArr1[0]) + 1;
          json.data.weather[w].date = dateArr1.join("-");
        }
      } else {
        var diffTimeStart = Math.abs(new Date(beginDate) - today);
        var startIndex = Math.ceil(diffTimeStart / (1000 * 60 * 60 * 24));
        var diffTimeEnd = Math.abs(new Date(endDate) - today);
        var endIndex = Math.ceil(diffTimeEnd / (1000 * 60 * 60 * 24));
        var weathers = json.data.weather.slice(startIndex, endIndex + 1);
        json.data.weather = weathers;
      }
      return (json.data.weather || []).map((weather) => ({
        ...weather,
        hourly: weather.hourly.map((hourly) => 
          ({...hourly, weatherIconUrl: hourly.weatherIconUrl[0].value, weatherDesc: hourly.weatherDesc[0].value})
        )
      })
      );
    });
};
