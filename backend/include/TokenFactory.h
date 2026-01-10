#ifndef TOKENFACTORY_H
#define TOKENFACTORY_H

#include "httplib.h"
#include "json.hpp"
#include <cmath>
#include <iostream>
#include <map>
#include <string>
#include <vector>

using json = nlohmann::json;

struct Token {
  std::string ticker;
  std::string name;
  std::string description;
  std::string imageUrl;
  std::string creator;
  double currentSupply;
  double marketCap;
  double price;

  json toJson() const {
    return {{"ticker", ticker},           {"name", name},
            {"description", description}, {"imageUrl", imageUrl},
            {"creator", creator},         {"currentSupply", currentSupply},
            {"marketCap", marketCap},     {"price", price}};
  }
};

class TokenFactory {
public:
  std::vector<Token> tokens;
  const double INITIAL_PRICE = 0.000001;
  const double K = 0.00000001; // Bonding curve constant

  double calculatePrice(double supply) {
    // Linear bonding curve: Price = m * supply + c
    // Or Exponential. Let's stick to simple linear for now: P = K * supply
    if (supply == 0)
      return INITIAL_PRICE;
    return K * supply + INITIAL_PRICE;
  }

  // Ticker -> Address -> Amount
  std::map<std::string, std::map<std::string, double>> tokenBalances;
  // Address -> Timestamp (seconds)
  std::map<std::string, long long> lastClaimTime;

  void saveBalances() {
    httplib::Client cli("localhost", 3001);
    json j_balances = tokenBalances;
    auto res =
        cli.Post("/balances/save", j_balances.dump(), "application/json");

    // Also save claim times (could be separate, but for now let's keep it
    // simple or ignore persistence for claims in MVP) Ideally we save this too.
  }

  bool claimDailyReward(std::string address) {
    // Simple mock time check or just allow every 60 seconds for demo
    long long now = std::time(nullptr);
    if (lastClaimTime.count(address)) {
      long long last = lastClaimTime[address];
      if (now - last < 60) { // 1 minute cooldown for demo
        return false;
      }
    }

    // Credit 100 CRDO
    // We don't have a "CRDO" ticker in tokenBalances usually, but we can treat
    // it as one. Or we can have a specific native balance map. Let's use "CRDO"
    // in tokenBalances for simplicity.
    tokenBalances["CRDO"][address] += 100.0;
    lastClaimTime[address] = now;
    saveBalances();
    std::cout << "🎁 Reward claimed by " << address << std::endl;
    return true;
  }

  void loadBalances() {
    httplib::Client cli("localhost", 3001);
    auto res = cli.Get("/balances/load");
    if (res && res->status == 200) {
      try {
        tokenBalances = json::parse(res->body);
      } catch (...) {
        std::cout << "⚠️ No balances found or invalid JSON." << std::endl;
      }
    }
  }

  bool createToken(std::string ticker, std::string name, std::string desc,
                   std::string img, std::string creator) {
    for (const auto &t : tokens) {
      if (t.ticker == ticker) {
        std::cerr << "❌ Token already exists: " << ticker << std::endl;
        return false;
      }
    }

    Token t;
    t.ticker = ticker;
    t.name = name;
    t.description = desc;
    t.imageUrl = img;
    t.creator = creator;
    t.currentSupply = 0;
    t.price = INITIAL_PRICE;
    t.marketCap = 0;

    tokens.push_back(t);
    saveTokens();
    std::cout << "🚀 Token Created: " << name << " (" << ticker << ")"
              << std::endl;
    return true;
  }

  bool deleteToken(std::string ticker) {
    for (auto it = tokens.begin(); it != tokens.end(); ++it) {
      if (it->ticker == ticker) {
        tokens.erase(it);
        saveTokens();
        // Also clear balances for this token
        tokenBalances.erase(ticker);
        saveBalances();
        std::cout << "🗑️ Token Deleted: " << ticker << std::endl;
        return true;
      }
    }
    return false;
  }

  bool buyToken(std::string ticker, double amountUSDT,
                std::string buyerAddress) {
    for (auto &t : tokens) {
      if (t.ticker == ticker) {
        double tokensToBuy = amountUSDT / t.price;
        t.currentSupply += tokensToBuy;
        t.marketCap = t.currentSupply * t.price;
        t.price = calculatePrice(t.currentSupply);

        // Credit the buyer
        tokenBalances[ticker][buyerAddress] += tokensToBuy;

        saveTokens();
        saveBalances();
        std::cout << "💰 Bought " << tokensToBuy << " " << ticker << " for $"
                  << amountUSDT << " by " << buyerAddress << std::endl;
        return true;
      }
    }
    return false;
  }

  std::map<std::string, double> getUserBalances(std::string address) {
    std::map<std::string, double> userPortfolio;
    for (auto const &[ticker, balances] : tokenBalances) {
      if (balances.count(address)) {
        userPortfolio[ticker] = balances.at(address);
      }
    }
    return userPortfolio;
  }

  TokenFactory() {
    loadTokens();
    loadBalances();
  }

  void saveTokens() {
    httplib::Client cli("localhost", 3001);
    json jTokens = json::array();
    for (const auto &t : tokens) {
      jTokens.push_back(t.toJson());
    }

    auto res = cli.Post("/tokens/save", jTokens.dump(), "application/json");
    if (res && res->status == 200) {
      // Success
    } else {
      std::cerr << "Error saving tokens to DB" << std::endl;
    }
  }

  void loadTokens() {
    httplib::Client cli("localhost", 3001);
    auto res = cli.Get("/tokens/load");
    if (res && res->status == 200) {
      try {
        json jTokens = json::parse(res->body);
        tokens.clear();
        for (const auto &j : jTokens) {
          Token t;
          t.ticker = j["ticker"];
          t.name = j["name"];
          t.description = j["description"];
          t.imageUrl = j["imageUrl"];
          t.creator = j["creator"];
          t.currentSupply = j["currentSupply"];
          t.marketCap = j["marketCap"];
          t.price = j["price"];
          tokens.push_back(t);
        }
        std::cout << "Loaded " << tokens.size() << " tokens from DB."
                  << std::endl;
      } catch (...) {
        std::cerr << "Error parsing tokens from DB" << std::endl;
      }
    }
  }

  json toJson() const {
    json jTokens = json::array();
    for (const auto &t : tokens) {
      jTokens.push_back(t.toJson());
    }
    return jTokens;
  }
};

#endif
