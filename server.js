const express = require('express');
const graphqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql');
const Chance = require('chance');
const chance = new Chance();

// Construct a schema, using GraphQL schema language
// Valid types are: String, Int, Float, Boolean, and ID
const schema = buildSchema(`
  type Player {
    name: String!
    position: String!
    handedness: String!
    age: Int!
    errorOnThePlay: Boolean!
    bestFriends: [Player]
  }

  type setHelloReturnObj {
    wasSuccess: Boolean!
    message: String!
    newValue: String!
  }

  type Mutation {
    setHello(newHello: String!): setHelloReturnObj
  }

  type Query {
    hello: String
    getPlayers: [Player]
    rollDice(numDice: Int!, numSides: Int!): [Int]
  }
`);

class Player {
  constructor() {
    this.handedness = Math.random() < 0.1 ? 'left' : 'right';
    this.position = Math.random() < 0.1 ? 'pitcher' : 'field player';
    this.name = chance.name();
    this.age = chance.age();
    this.bestFriends = [];
  }
  errorOnThePlay() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(Math.random() < 0.3);
      }, 1000);
    });
  }
}

let helloResponse = 'Hello world!';

// The root provides a resolver function for each API endpoint
const root = {
  setHello: ({ newHello }) => {
    helloResponse = newHello;
    return {
      wasSuccess: true,
      message: `new hello response is: ${newHello}`,
      newValue: newHello,
    };
  },
  hello: () => {
    return helloResponse;
  },
  rollDice: ({ numDice, numSides }) => {
    const results = [];
    for (let i=0; i<numDice; i++) {
      const value = Math.floor(Math.random() * numSides) + 1;
      results.push(value);
    }
    return results;
  },
  getPlayers: () => {
    const players = [];
    for (let i=0; i<100; i++) {
      players.push(new Player());
    }
    players.forEach((player, i) => {
      [1, 2, 3].forEach(() => {
        const bestFriendIndex = chance.integer({ min: 0, max: 99 });
        player.bestFriends.push(players[bestFriendIndex]);
      });
    });

    return players;
  }
};

const app = express();
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));
app.listen(4000);
console.log('Running a GraphQL API server at localhost:4000/graphql');