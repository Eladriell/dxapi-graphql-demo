const { ApolloServer, gql } = require("apollo-server");
const fetch = require("node-fetch");
const SHA256 = require("crypto-js/sha256");

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Query {
    cart(id: String): CartReply
    airOffers(
      originLocationCode: String
      destinationLocationCode: String
      departureDateTime: String
      returnDateTime: String
      commercialFareFamily: String
      travelerTypes: String
    ): AirOfferList
    getHotels: HotelReply
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

  type Cart {
    id: String
    travelers: [Traveler]
    contacts: [IContact]
    frequentFlyerCards: [FrequentFlyerCard]
    airOffers: [AirOffer]
    accommodations: [Accommodation]
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
          //determine duration + location for hotel search

          return res;
        });
    },
    getHotels: () => {
      const apiKeyApiTude = "ex2hcrqn8f3c3uwrevcpncs8";
      const secretApiTude = "AJfrPvArP5";
      var signature = buildSignature(apiKeyApiTude, secretApiTude);

      const headersApiTude = {
        "Api-key": apiKeyApiTude,
        "X-Signature": signature,
        Accept: "application/json",
        "Accept-Encoding": "Gzip",
        "Content-Type": "application/json"
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
        "https://4798193b-60a5-4ca7-b064-7625627f013e.mock.pstmn.io";
      //    "https://api.test.hotelbeds.com";
      return fetch(apiTudeUrl + "/hotel-api/1.0/hotels", {
        method: "POST",
        headersApiTude,
        body: JSON.stringify(hotelSearch)
      })
        .then(res => res.json())
        .then(res => {
          console.log(res);

          return res;
        });
      /*
        .then(checkStatus)
        .then(res => {
          return res.json();
        })
        .then(data => data && data.hotels)
        .catch(error => {
          console.error(error);
          return error;
        });
        */
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
            const myFlights = [];
            Object.entries(res.dictionaries.flight).forEach(([key, value]) => {
              myFlights.push(value);
            });
            if (myFlights.length > 1) {
              var firstBoundArrival = new Date(myFlights[0].arrival.dateTime);
              var secondBoundDeparture = new Date(
                myFlights[1].departure.dateTime
              );
              var timeDiff = Math.abs(
                secondBoundDeparture.getTime() - firstBoundArrival.getTime()
              );
              var numberOfNights = Math.ceil(timeDiff / (1000 * 3600 * 24));

              var targetLocation = {
                iataCode: myFlights[0].arrival.locationCode
              };

              fetch(
                `http://nano.aviasales.ru/places_en?term=` +
                  targetLocation.iataCode,
                { headers }
              )
                .then(locationRes => locationRes.json())
                .then(data => {
                  targetLocation.latitude = data[0].coordinates[0];
                  targetLocation.longitude = data[0].coordinates[1];

                  console.log(
                    JSON.stringify(myFlights) +
                      ": flights -" +
                      JSON.stringify(targetLocation) +
                      "targetLocation" +
                      numberOfNights +
                      " nights"
                  );
                })
                .catch(error => {
                  console.error(error);
                  return error;
                });

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
  return SHA256(apiKey + secret + datetime);
};
