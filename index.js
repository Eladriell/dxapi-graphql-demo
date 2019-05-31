const { ApolloServer, gql } = require("apollo-server");
const fetch = require("node-fetch");

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
          //duration = flight2.departure.datetime - flight1.arrival.datetime
          //targetLocation = flight1.arrival.locationCode

          const apiKeyApiTude = "ex2hcrqn8f3c3uwrevcpncs8";
          const secretApiTude = " AJfrPvArP5";
          var signature = buildSignature(apiKeyApiTude, secretApiTude);

          const headersApiTude = {
            "Api-key": apiKeyApiTude,
            "X-Signature": signature,
            Accept: "application/json",
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
          console.log("***** " + hotelSearch);
          fetch("https://api.test.hotelbeds.com/hotel-api/1.0/hotels", {
            method: "POST",
            headersApiTude,
            body: JSON.stringify(hotelSearch)
          })
            .then(hotels => hotels.json())
            .then(hotels => {
              console.log("***** " + JSON.stringify(hotels));
            });

          return res;
        });
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
        .then(data => {
          /* var flights = [];
          if (data.dictionaries)
            Object.values(data.dictionaries.flight).forEach(value => {
              flights.push(value);
            });
*/

          /*
          var myExt = [];
          myExt[0] = {
            extensionType: "TextExtension",
            name: "Flight data",
            content: JSON.stringify(flights)
          };
          //addExtensions(_, { cartId, myExt });
          fetch(baseUrl + `/shopping/carts/${cartId}/extensions`, {
            method: "POST",
            headers,
            body: JSON.stringify(myExt)
          });
          */
          return data;
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
      return fetch(baseUrl + `/shopping/carts/${cartId}/extensions`, {
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

const buildSignature = function(apiKey, secret) {
  var d = new Date();
  var n = d.getTime();
  var datetime = Math.floor(n / 1000);

  return sha256(apiKey + secret + datetime);
};

const sha256 = function(ascii) {
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }

  var mathPow = Math.pow;
  var maxWord = mathPow(2, 32);
  var lengthProperty = "length";
  var i, j; // Used as a counter across the whole file
  var result = "";

  var words = [];
  var asciiBitLength = ascii[lengthProperty] * 8;

  //* caching results is optional - remove/add slash from front of this line to toggle
  // Initial hash value: first 32 bits of the fractional parts of the square roots of the first 8 primes
  // (we actually calculate the first 64, but extra values are just ignored)
  var hash = (sha256.h = sha256.h || []);
  // Round constants: first 32 bits of the fractional parts of the cube roots of the first 64 primes
  var k = (sha256.k = sha256.k || []);
  var primeCounter = k[lengthProperty];
  /*/
	var hash = [], k = [];
	var primeCounter = 0;
	//*/

  var isComposite = {};
  for (var candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 313; i += candidate) {
        isComposite[i] = candidate;
      }
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }

  ascii += "\x80"; // Append Ƈ' bit (plus zero padding)
  while ((ascii[lengthProperty] % 64) - 56) ascii += "\x00"; // More zero padding
  for (i = 0; i < ascii[lengthProperty]; i++) {
    j = ascii.charCodeAt(i);
    if (j >> 8) return; // ASCII check: only accept characters in range 0-255
    words[i >> 2] |= j << (((3 - i) % 4) * 8);
  }
  words[words[lengthProperty]] = (asciiBitLength / maxWord) | 0;
  words[words[lengthProperty]] = asciiBitLength;

  // process each chunk
  for (j = 0; j < words[lengthProperty]; ) {
    var w = words.slice(j, (j += 16)); // The message is expanded into 64 words as part of the iteration
    var oldHash = hash;
    // This is now the undefinedworking hash", often labelled as variables a...g
    // (we have to truncate as well, otherwise extra entries at the end accumulate
    hash = hash.slice(0, 8);

    for (i = 0; i < 64; i++) {
      var i2 = i + j;
      // Expand the message into 64 words
      // Used below if
      var w15 = w[i - 15],
        w2 = w[i - 2];

      // Iterate
      var a = hash[0],
        e = hash[4];
      var temp1 =
        hash[7] +
        (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) + // S1
        ((e & hash[5]) ^ (~e & hash[6])) + // ch
        k[i] +
        // Expand the message schedule if needed
        (w[i] =
          i < 16
            ? w[i]
            : (w[i - 16] +
              (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) + // s0
                w[i - 7] +
                (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) | // s1
              0);
      // This is only used once, so *could* be moved below, but it only saves 4 bytes and makes things unreadble
      var temp2 =
        (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) + // S0
        ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2])); // maj

      hash = [(temp1 + temp2) | 0].concat(hash); // We don't bother trimming off the extra ones, they're harmless as long as we're truncating when we do the slice()
      hash[4] = (hash[4] + temp1) | 0;
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j + 1; j--) {
      var b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? 0 : "") + b.toString(16);
    }
  }
  return result;
};
