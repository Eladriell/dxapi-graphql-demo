const { ApolloServer, gql } = require("apollo-server");
const fetch = require("node-fetch");

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Query {
    cart(id: String): Cart
  }

  type Mutation {
    createCart: Cart
    addTravelers(cartId: String, travelers: [TravelerInput]): [Traveler]
    addContacts(cartId: String, contacts: ContactInput): [IContact]
    addFrequentFlyers(
      cartId: String
      frequentFlyerCards: [FrequentFlyerCardInput]
    ): [FrequentFlyerCard]
  }

  type Cart {
    id: String
    travelers: [Traveler]
    contacts: [IContact]
    frequentFlyerCards: [FrequentFlyerCard]
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

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    cart: (_, { id }) => {
      return fetch(
        `https://proxy.digitalforairlines.com/v2/shopping/carts/${id}`,
        { headers }
      )
        .then(res => res.json())
        .then(data => data && data.data);
    }
  },
  Mutation: {
    createCart: () => {
      return fetch("https://proxy.digitalforairlines.com/v2/shopping/carts", {
        method: "POST",
        headers
      })
        .then(res => res.json())
        .then(data => data && data.data);
    },
    addTravelers: (_, { cartId, travelers }) => {
      return fetch(
        `https://proxy.digitalforairlines.com/v2/shopping/carts/${cartId}/travelers`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(travelers)
        }
      )
        .then(res => res.json())
        .then(data => data && data.data)
        .catch(error => {
          console.error(error);
          return error;
        });
    },
    addContacts: (_, { cartId, contacts }) => {
      return fetch(
        `http://proxy.digitalforairlines.com/v2/shopping/carts/${cartId}/contacts`,
        {
          method: "POST",
          headers,
          body: JSON.stringify([
            ...(contacts.emails || []),
            ...(contacts.phones || [])
          ])
        }
      )
        .then(res => res.json())
        .then(data => data && data.data)
        .catch(error => {
          console.error(error);
          return error;
        });
    },
    addFrequentFlyers: (_, { cartId, frequentFlyerCards }) => {
      return fetch(
        `http://proxy.digitalforairlines.com/v2/shopping/carts/${cartId}/frequent-flyer-cards`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(frequentFlyerCards)
        }
      )
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
