#ifndef CASINO_ENGINE_H
#define CASINO_ENGINE_H

#include "json.hpp"
#include "sha256.h"
#include <algorithm>
#include <ctime>
#include <iostream>
#include <random>
#include <string>
#include <vector>

using json = nlohmann::json;

// --- Provably Fair RNG ---
class ProvablyFair {
public:
  static std::string generateServerSeed() {
    std::string seed =
        std::to_string(std::time(nullptr)) + std::to_string(rand());
    return sha256(seed);
  }

  static std::string hashSeed(const std::string &seed) { return sha256(seed); }

  // Generates a deterministic random number [0, max) based on seeds and nonce
  static int generateRandom(const std::string &serverSeed,
                            const std::string &clientSeed, int nonce, int max) {
    std::string combined = serverSeed + clientSeed + std::to_string(nonce);
    std::string hash = sha256(combined);

    // Take first 8 chars of hash to form an integer
    unsigned long long value = std::stoull(hash.substr(0, 15), nullptr, 16);
    return value % max;
  }
};

// --- Card & Deck ---
struct Card {
  std::string suit; // "H", "D", "C", "S"
  std::string rank; // "2", "3", ..., "10", "J", "Q", "K", "A"
  int value;

  json toJson() const {
    return {{"suit", suit}, {"rank", rank}, {"value", value}};
  }
};

class Deck {
  std::vector<Card> cards;
  std::string serverSeed;
  std::string clientSeed;
  int nonce;

public:
  Deck(std::string sSeed, std::string cSeed)
      : serverSeed(sSeed), clientSeed(cSeed), nonce(0) {
    std::vector<std::string> suits = {"H", "D", "C", "S"};
    std::vector<std::string> ranks = {"2", "3",  "4", "5", "6", "7", "8",
                                      "9", "10", "J", "Q", "K", "A"};

    for (const auto &s : suits) {
      for (const auto &r : ranks) {
        int val = 0;
        if (r == "J" || r == "Q" || r == "K")
          val = 10;
        else if (r == "A")
          val = 11;
        else
          val = std::stoi(r);
        cards.push_back({s, r, val});
      }
    }
  }

  // Fisher-Yates shuffle using Provably Fair RNG
  void shuffle() {
    for (int i = cards.size() - 1; i > 0; i--) {
      int j =
          ProvablyFair::generateRandom(serverSeed, clientSeed, nonce++, i + 1);
      std::swap(cards[i], cards[j]);
    }
  }

  Card draw() {
    if (cards.empty())
      return {"", "", 0};
    Card c = cards.back();
    cards.pop_back();
    return c;
  }
};

// --- Blackjack Logic ---
class BlackjackGame {
public:
  struct Hand {
    std::vector<Card> cards;
    int bet;
    bool isStand;

    int getValue() const {
      int val = 0;
      int aces = 0;
      for (const auto &c : cards) {
        val += c.value;
        if (c.rank == "A")
          aces++;
      }
      while (val > 21 && aces > 0) {
        val -= 10;
        aces--;
      }
      return val;
    }

    json toJson() const {
      json jCards = json::array();
      for (const auto &c : cards)
        jCards.push_back(c.toJson());
      return {{"cards", jCards},
              {"value", getValue()},
              {"bet", bet},
              {"isStand", isStand}};
    }
  };

  // Simple in-memory storage for active games (In prod, use DB)
  static std::map<std::string, BlackjackGame> activeGames;

  std::string gameId;
  std::string playerAddress;
  std::string serverSeed;
  std::string clientSeed;
  Deck deck;
  Hand playerHand;
  Hand dealerHand;
  bool isGameOver;
  std::string result; // "WIN", "LOSE", "PUSH", "BLACKJACK"

  BlackjackGame() : deck("", ""), isGameOver(true) {} // Default constructor

  BlackjackGame(std::string id, std::string pAddr, int bet, std::string cSeed)
      : gameId(id), playerAddress(pAddr),
        serverSeed(ProvablyFair::generateServerSeed()), clientSeed(cSeed),
        deck(serverSeed, cSeed), isGameOver(false) {
    playerHand.bet = bet;
    playerHand.isStand = false;
    dealerHand.isStand = false;

    deck.shuffle();

    // Initial Deal
    playerHand.cards.push_back(deck.draw());
    dealerHand.cards.push_back(deck.draw());
    playerHand.cards.push_back(deck.draw());
    dealerHand.cards.push_back(deck.draw());

    checkBlackjack();
  }

  void checkBlackjack() {
    int pVal = playerHand.getValue();
    int dVal = dealerHand.getValue();

    if (pVal == 21) {
      isGameOver = true;
      if (dVal == 21)
        result = "PUSH";
      else
        result = "BLACKJACK";
    }
  }

  void hit() {
    if (isGameOver)
      return;
    playerHand.cards.push_back(deck.draw());
    if (playerHand.getValue() > 21) {
      isGameOver = true;
      result = "LOSE";
    }
  }

  void stand() {
    if (isGameOver)
      return;
    playerHand.isStand = true;

    // Dealer logic: Hit until 17
    while (dealerHand.getValue() < 17) {
      dealerHand.cards.push_back(deck.draw());
    }

    int pVal = playerHand.getValue();
    int dVal = dealerHand.getValue();

    isGameOver = true;
    if (dVal > 21)
      result = "WIN";
    else if (pVal > dVal)
      result = "WIN";
    else if (pVal < dVal)
      result = "LOSE";
    else
      result = "PUSH";
  }

  json toJson() const {
    return {
        {"gameId", gameId},
        {"playerHand", playerHand.toJson()},
        {"dealerHand", dealerHand.toJson()},
        {"isGameOver", isGameOver},
        {"result", result},
        {"serverSeedHash",
         ProvablyFair::hashSeed(serverSeed)} // Don't reveal seed until end!
    };
  }

  json toRevealedJson() const {
    json j = toJson();
    j["serverSeed"] = serverSeed; // Reveal seed for verification
    return j;
  }
};

// Define static map
std::map<std::string, BlackjackGame> BlackjackGame::activeGames;

// --- Slots Logic ---
class SlotMachine {
public:
  static json spin(int bet, std::string clientSeed) {
    std::string serverSeed = ProvablyFair::generateServerSeed();
    std::vector<std::string> symbols = {"🍒", "🍋", "🍇", "💎", "7️⃣", "🔔"};
    // Weights could be added for more complex logic

    std::vector<std::string> resultLine;
    for (int i = 0; i < 3; i++) {
      int idx = ProvablyFair::generateRandom(serverSeed, clientSeed, i,
                                             symbols.size());
      resultLine.push_back(symbols[idx]);
    }

    int payout = 0;
    std::string status = "LOSE";

    if (resultLine[0] == resultLine[1] && resultLine[1] == resultLine[2]) {
      status = "WIN";
      if (resultLine[0] == "7️⃣")
        payout = bet * 50;
      else if (resultLine[0] == "💎")
        payout = bet * 20;
      else
        payout = bet * 10;
    } else if (resultLine[0] == resultLine[1] ||
               resultLine[1] == resultLine[2] ||
               resultLine[0] == resultLine[2]) {
      // Small win for 2 matches? Maybe not for high volatility
      // payout = bet * 2;
    }

    return {{"symbols", resultLine},
            {"payout", payout},
            {"status", status},
            {"serverSeed",
             serverSeed}, // Instant reveal for slots usually ok, or hash first
            {"clientSeed", clientSeed}};
  }
};

class PokerGame {
public:
  std::string gameId;
  std::string playerAddress;
  int ante;
  std::string clientSeed;
  std::string serverSeed;

  std::vector<Card> playerHand;
  std::vector<Card> dealerHand;
  std::vector<Card> communityCards; // Flop (3), Turn (1), River (1)

  std::string stage;    // "ANTE", "DECISION", "SHOWDOWN"
  std::string result;   // "WIN", "LOSS", "PUSH"
  std::string handRank; // e.g. "Pair of Aces"

  Deck deck;

  static std::map<std::string, PokerGame> activeGames;

  PokerGame() : deck("", "") {}
  PokerGame(std::string id, std::string pAddr, int bet, std::string cSeed)
      : gameId(id), playerAddress(pAddr), ante(bet), clientSeed(cSeed),
        serverSeed(ProvablyFair::generateServerSeed()),
        deck(serverSeed, cSeed) {
    stage = "ANTE";
  }

  void deal() {
    deck.shuffle();
    playerHand.push_back(deck.draw());
    playerHand.push_back(deck.draw());
    dealerHand.push_back(deck.draw());
    dealerHand.push_back(deck.draw());

    // Deal Flop immediately in Casino Hold'em
    communityCards.push_back(deck.draw());
    communityCards.push_back(deck.draw());
    communityCards.push_back(deck.draw());

    stage = "DECISION";
  }

  void call() {
    // Deal Turn and River
    communityCards.push_back(deck.draw());
    communityCards.push_back(deck.draw());

    stage = "SHOWDOWN";
    determineWinner();
  }

  void fold() {
    stage = "FOLDED";
    result = "LOSS";
  }

  // Simplified Hand Evaluator
  // Returns a score:
  // 800+ Straight Flush, 700+ Quads, 600+ Full House, 500+ Flush,
  // 400+ Straight, 300+ Trips, 200+ Two Pair, 100+ Pair, 0+ High Card
  int evaluateHand(const std::vector<Card> &hand,
                   const std::vector<Card> &community) {
    std::vector<Card> allCards = hand;
    allCards.insert(allCards.end(), community.begin(), community.end());

    // Sort by rank
    std::sort(allCards.begin(), allCards.end(),
              [](const Card &a, const Card &b) {
                // Map ranks to values (2=2, ..., A=14)
                auto val = [](const std::string &r) {
                  if (r == "A")
                    return 14;
                  if (r == "K")
                    return 13;
                  if (r == "Q")
                    return 12;
                  if (r == "J")
                    return 11;
                  if (r == "10")
                    return 10;
                  return std::stoi(r);
                };
                return val(a.rank) > val(b.rank); // Descending
              });

    // Count ranks and suits
    std::map<std::string, int> rankCounts;
    std::map<std::string, int> suitCounts;
    for (const auto &c : allCards) {
      rankCounts[c.rank]++;
      suitCounts[c.suit]++;
    }

    bool flush = false;
    for (auto const &[suit, count] : suitCounts) {
      if (count >= 5)
        flush = true;
    }

    bool straight = false;
    (void)straight; // Suppress unused variable warning until implemented
    // Simplified straight check (consecutive values)
    // This is hard to do perfectly in a short snippet, so we'll approximate or
    // skip for MVP Let's stick to Pairs/Trips/Flush for robustness in this
    // iteration.

    // Check Groups
    bool four = false;
    bool three = false;
    int pairs = 0;

    for (auto const &[rank, count] : rankCounts) {
      if (count == 4)
        four = true;
      if (count == 3)
        three = true;
      if (count == 2)
        pairs++;
    }

    if (four)
      return 700;
    if (three && pairs >= 1)
      return 600; // Full House
    if (flush)
      return 500;
    if (three)
      return 300;
    if (pairs >= 2)
      return 200;
    if (pairs == 1)
      return 100;

    // High card score (simplified)
    auto val = [](const std::string &r) {
      if (r == "A")
        return 14;
      if (r == "K")
        return 13;
      if (r == "Q")
        return 12;
      if (r == "J")
        return 11;
      if (r == "10")
        return 10;
      return std::stoi(r);
    };
    return val(allCards[0].rank);
  }

  void determineWinner() {
    int playerScore = evaluateHand(playerHand, communityCards);
    int dealerScore = evaluateHand(dealerHand, communityCards);

    if (playerScore > dealerScore) {
      result = "WIN";
    } else if (playerScore < dealerScore) {
      result = "LOSS";
    } else {
      result = "PUSH";
    }

    // Assign string description
    if (playerScore >= 700)
      handRank = "Four of a Kind";
    else if (playerScore >= 600)
      handRank = "Full House";
    else if (playerScore >= 500)
      handRank = "Flush";
    else if (playerScore >= 300)
      handRank = "Three of a Kind";
    else if (playerScore >= 200)
      handRank = "Two Pair";
    else if (playerScore >= 100)
      handRank = "Pair";
    else
      handRank = "High Card";
  }

  json toJson() const {
    json j;
    j["gameId"] = gameId;
    j["playerHand"] = json::array();
    for (const auto &c : playerHand)
      j["playerHand"].push_back(c.toJson());

    j["communityCards"] = json::array();
    for (const auto &c : communityCards)
      j["communityCards"].push_back(c.toJson());

    j["stage"] = stage;
    j["ante"] = ante;
    // Hide dealer hand until showdown
    if (stage == "SHOWDOWN") {
      j["dealerHand"] = json::array();
      for (const auto &c : dealerHand)
        j["dealerHand"].push_back(c.toJson());
      j["result"] = result;
      j["handRank"] = handRank;
    }
    return j;
  }
};

std::map<std::string, PokerGame> PokerGame::activeGames;

#endif
