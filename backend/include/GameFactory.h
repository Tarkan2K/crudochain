#ifndef GAMEFACTORY_H
#define GAMEFACTORY_H

#include "httplib.h"
#include "json.hpp"
#include <ctime>
#include <fstream>
#include <iostream>
#include <map>
#include <string>
#include <vector>

using json = nlohmann::json;

struct Game {
  std::string id;
  std::string title;
  std::string description;
  double price;
  std::string developerAddress;
  std::string gameUrl;
  std::string imageUrl;
  long long createdAt;

  json toJson() const {
    return {{"id", id},
            {"title", title},
            {"description", description},
            {"price", price},
            {"developerAddress", developerAddress},
            {"gameUrl", gameUrl},
            {"imageUrl", imageUrl},
            {"createdAt", createdAt}};
  }
};

class GameFactory {
private:
  const std::string GAMES_FILE = "uploads/games.json";
  const std::string LIBS_FILE = "uploads/libraries.json";

public:
  std::vector<Game> availableGames;
  // User Address -> List of Game IDs owned
  std::map<std::string, std::vector<std::string>> userLibraries;

  GameFactory() {
    loadGames();
    loadLibraries();
  }

  bool publishGame(std::string title, std::string description, double price,
                   std::string developer, std::string url, std::string image) {
    Game g;
    g.id = std::to_string(std::time(nullptr)) + "_" + developer.substr(0, 5);
    g.title = title;
    g.description = description;
    g.price = price;
    g.developerAddress = developer;
    g.gameUrl = url;
    g.imageUrl = image;
    g.createdAt = std::time(nullptr);

    availableGames.push_back(g);
    saveGames();
    std::cout << "🎮 Game Published: " << title << " by " << developer
              << std::endl;
    return true;
  }

  // Returns pair<success, message>
  std::pair<bool, std::string>
  buyGame(std::string gameId, std::string buyer,
          std::map<std::string, std::map<std::string, double>> &balances) {
    // Check if game exists
    Game *targetGame = nullptr;
    for (auto &g : availableGames) {
      if (g.id == gameId) {
        targetGame = &g;
        break;
      }
    }

    if (!targetGame) {
      return {false, "Game not found"};
    }

    // Check if user already owns it
    if (userLibraries.count(buyer)) {
      for (const auto &id : userLibraries[buyer]) {
        if (id == gameId) {
          return {false, "You already own this game"};
        }
      }
    }

    // Check balance (assuming CRDO)
    if (balances["CRDO"][buyer] < targetGame->price) {
      return {false, "Insufficient funds"};
    }

    // Process transaction
    balances["CRDO"][buyer] -= targetGame->price;

    // Dynamic Commission Logic (Smart Tax)
    // Base: 20%
    // High Volume/Price (> 1000 CRDO): 30%
    double commissionRate = 0.20;
    if (targetGame->price > 1000.0) {
      commissionRate = 0.30;
    }

    double devShare = targetGame->price * (1.0 - commissionRate);
    balances["CRDO"][targetGame->developerAddress] += devShare;

    // Platform fee stays in system (burned or treasury)
    std::cout << "💰 Sale! Price: " << targetGame->price
              << " | Dev Share: " << devShare
              << " | Commission: " << (targetGame->price * commissionRate)
              << " (" << (commissionRate * 100) << "%)" << std::endl;

    // Add to library
    userLibraries[buyer].push_back(gameId);
    saveLibraries();

    std::cout << "👾 Game Bought: " << targetGame->title << " by " << buyer
              << std::endl;
    return {true, "Game purchased successfully!"};
  }

  std::vector<Game> getLibrary(std::string user) {
    std::vector<Game> myGames;
    if (userLibraries.count(user)) {
      for (const auto &gameId : userLibraries[user]) {
        for (const auto &g : availableGames) {
          if (g.id == gameId) {
            myGames.push_back(g);
            break; // Found the game, move to next ID
          }
        }
      }
    }
    return myGames;
  }

  // Returns {totalSales, totalRevenue, gamesList}
  json getDeveloperStats(std::string developer) {
    json stats;
    int totalSales = 0;
    double totalRevenue = 0.0;
    json gamesList = json::array();

    for (const auto &g : availableGames) {
      if (g.developerAddress == developer) {
        int gameSales = 0;
        // Count how many users own this game
        for (const auto &pair : userLibraries) {
          for (const auto &ownedId : pair.second) {
            if (ownedId == g.id) {
              gameSales++;
            }
          }
        }

        // Calculate revenue (approximate based on current price & commission)
        // Note: In a real system, we'd sum actual transaction logs.
        // Here we assume all sales were at current price.
        double commissionRate = (g.price > 1000.0) ? 0.30 : 0.20;
        double revenue = gameSales * g.price * (1.0 - commissionRate);

        totalSales += gameSales;
        totalRevenue += revenue;

        json gameStat = g.toJson();
        gameStat["sales"] = gameSales;
        gameStat["revenue"] = revenue;
        gamesList.push_back(gameStat);
      }
    }

    stats["totalSales"] = totalSales;
    stats["totalRevenue"] = totalRevenue;
    stats["games"] = gamesList;
    return stats;
  }

  void saveGames() {
    std::cout << "DEBUG: Saving games to " << GAMES_FILE << "..." << std::endl;
    json jGames = json::array();
    for (const auto &g : availableGames) {
      jGames.push_back(g.toJson());
    }
    std::ofstream file(GAMES_FILE);
    if (file.is_open()) {
      file << jGames.dump(4);
      file.close();
      std::cout << "DEBUG: Saved " << availableGames.size() << " games."
                << std::endl;
    } else {
      std::cerr << "❌ Error saving Games to " << GAMES_FILE << std::endl;
      std::perror("Error details");
    }
  }

  void loadGames() {
    std::ifstream file(GAMES_FILE);
    if (file.is_open()) {
      try {
        json jGames;
        file >> jGames;
        availableGames.clear();
        for (const auto &j : jGames) {
          Game g;
          g.id = j["id"];
          g.title = j["title"];
          g.description = j["description"];
          g.price = j["price"];
          g.developerAddress = j["developerAddress"];
          g.gameUrl = j["gameUrl"];
          g.imageUrl = j["imageUrl"];
          g.createdAt = j["createdAt"];
          availableGames.push_back(g);
        }
        std::cout << "✅ Loaded " << availableGames.size() << " Games."
                  << std::endl;
      } catch (...) {
        std::cerr << "⚠️ Error parsing Games data, starting fresh." << std::endl;
      }
      file.close();
    }
  }

  void saveLibraries() {
    json jLibs = userLibraries;
    std::ofstream file(LIBS_FILE);
    if (file.is_open()) {
      file << jLibs.dump(4);
      file.close();
    } else {
      std::cerr << "❌ Error saving Libraries to " << LIBS_FILE << std::endl;
    }
  }

  void loadLibraries() {
    std::ifstream file(LIBS_FILE);
    if (file.is_open()) {
      try {
        userLibraries = json::parse(file);
        std::cout << "✅ Loaded User Libraries." << std::endl;
      } catch (...) {
        std::cerr << "⚠️ Error parsing Libraries data." << std::endl;
      }
      file.close();
    }
  }

  json toJson() const {
    json jGames = json::array();
    for (const auto &g : availableGames) {
      jGames.push_back(g.toJson());
    }
    return jGames;
  }
};

#endif
