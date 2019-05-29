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
  }
  
  type CartDictionaries {
    location: LocationDic
    flight: FlightDic
  }
  
  type FlightDic {
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
        .then(res => res.json());
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
          console.log(res);
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
