#include "Blockchain.h"
#include "CasinoEngine.h"
#include "GameFactory.h"
#include "Network.h"
#include "NewsFactory.h"
#include "OrderBook.h"
#include "PaymentGateway.h"
#include "TokenFactory.h"
#include "httplib.h"
#include "json.hpp"

using json = nlohmann::json;

int main(int argc, char *argv[]) {
  int port = 18080;
  if (argc > 1) {
    port = std::stoi(argv[1]);
  }

  httplib::Server svr;
  Blockchain crudochain;
  OrderBook orderBook;
  NetworkManager networkManager;
  TokenFactory tokenFactory;
  GameFactory gameFactory;
  NewsFactory newsFactory;
  PaymentGateway paymentGateway;

  // --- Blockchain Endpoints ---

  svr.Get("/chain",
          [&crudochain](const httplib::Request &, httplib::Response &res) {
            res.set_header("Access-Control-Allow-Origin", "*");
            res.set_content(crudochain.toJson().dump(), "application/json");
          });

  svr.Post("/transaction",
           [&crudochain](const httplib::Request &req, httplib::Response &res) {
             res.set_header("Access-Control-Allow-Origin", "*");
             try {
               json tx = json::parse(req.body);
               Block newBlock(crudochain.chain.size(), tx, "");
               crudochain.addBlock(newBlock);
               res.set_content("{\"status\": \"success\"}", "application/json");
             } catch (...) {
               res.status = 400;
               res.set_content("Invalid JSON", "text/plain");
             }
           });

  svr.Get("/mine",
          [&crudochain](const httplib::Request &, httplib::Response &res) {
            res.set_header("Access-Control-Allow-Origin", "*");
            // Simple mining simulation: just create a block with empty data
            json data = {{"type", "mining_reward"}, {"miner", "System"}};
            Block newBlock(crudochain.chain.size(), data, "");
            crudochain.addBlock(newBlock);
            res.set_content("{\"status\": \"mined\"}", "application/json");
          });

  // --- OrderBook Endpoints REMOVED ---
  // Trading disabled as per user request.
  // --- Poker Endpoints ---
  // Placeholder for Poker endpoints, content to be added later.

  // --- CrudoGames Endpoints ---

  svr.Get("/games/list",
          [&gameFactory](const httplib::Request &, httplib::Response &res) {
            res.set_header("Access-Control-Allow-Origin", "*");
            res.set_content(gameFactory.toJson().dump(), "application/json");
          });

  svr.Get(R"(/games/developer/([^/]+))",
          [&gameFactory](const httplib::Request &req, httplib::Response &res) {
            res.set_header("Access-Control-Allow-Origin", "*");
            std::string developer = req.matches[1];
            json stats = gameFactory.getDeveloperStats(developer);
            res.set_content(stats.dump(), "application/json");
          });

  svr.Get(R"(/games/library/([^/]+))",
          [&gameFactory](const httplib::Request &req, httplib::Response &res) {
            res.set_header("Access-Control-Allow-Origin", "*");
            std::string user = req.matches[1];
            auto games = gameFactory.getLibrary(user);
            json jGames = json::array();
            for (const auto &g : games)
              jGames.push_back(g.toJson());
            res.set_content(jGames.dump(), "application/json");
          });

  svr.Options("/games/publish",
              [](const httplib::Request &, httplib::Response &res) {
                res.set_header("Access-Control-Allow-Origin", "*");
                res.set_header("Access-Control-Allow-Methods", "POST, OPTIONS");
                res.set_header("Access-Control-Allow-Headers", "Content-Type");
                res.set_content("", "text/plain");
              });

  svr.Post("/games/publish", [&gameFactory](const httplib::Request &req,
                                            httplib::Response &res) {
    res.set_header("Access-Control-Allow-Origin", "*");
    try {
      json data = json::parse(req.body);
      bool success = gameFactory.publishGame(
          data["title"], data["description"], data["price"],
          data["developerAddress"], data["gameUrl"], data["imageUrl"]);
      if (success) {
        res.set_content("{\"status\": \"success\"}", "application/json");
      } else {
        res.status = 400;
        res.set_content("{\"status\": \"failed\"}", "application/json");
      }
    } catch (...) {
      res.status = 400;
      res.set_content("Invalid JSON", "text/plain");
    }
  });

  svr.Options("/games/buy",
              [](const httplib::Request &, httplib::Response &res) {
                res.set_header("Access-Control-Allow-Origin", "*");
                res.set_header("Access-Control-Allow-Methods", "POST, OPTIONS");
                res.set_header("Access-Control-Allow-Headers", "Content-Type");
                res.set_content("", "text/plain");
              });

  svr.Post(
      "/games/buy", [&gameFactory, &tokenFactory](const httplib::Request &req,
                                                  httplib::Response &res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        try {
          json data = json::parse(req.body);
          std::string gameId = data["gameId"];
          std::string buyer = data["buyerAddress"];

          // Pass tokenBalances by reference to update them
          auto result =
              gameFactory.buyGame(gameId, buyer, tokenFactory.tokenBalances);

          if (result.first) {
            tokenFactory.saveBalances(); // Persist the balance changes
            res.set_content("{\"status\": \"success\", \"message\": \"" +
                                result.second + "\"}",
                            "application/json");
          } else {
            res.status = 400;
            res.set_content("{\"status\": \"failed\", \"message\": \"" +
                                result.second + "\"}",
                            "application/json");
          }
        } catch (...) {
          res.status = 400;
          res.set_content("Invalid JSON", "text/plain");
        }
      });

  // --- Payment Gateway Endpoints ---

  svr.Options("/payments/create",
              [](const httplib::Request &, httplib::Response &res) {
                res.set_header("Access-Control-Allow-Origin", "*");
                res.set_header("Access-Control-Allow-Methods", "POST, OPTIONS");
                res.set_header("Access-Control-Allow-Headers", "Content-Type");
                res.set_content("", "text/plain");
              });

  svr.Post("/payments/create", [&paymentGateway](const httplib::Request &req,
                                                 httplib::Response &res) {
    res.set_header("Access-Control-Allow-Origin", "*");
    try {
      json data = json::parse(req.body);
      std::string txId = paymentGateway.createTransaction(
          data["type"], data["amount"], data["currency"], data["gameId"],
          data["buyerAddress"]);

      json response = {
          {"status", "success"},
          {"txId", txId},
          {"redirectUrl", "http://localhost:3000/payments/mock_gateway?txId=" +
                              txId} // Mock URL
      };
      res.set_content(response.dump(), "application/json");
    } catch (...) {
      res.status = 400;
      res.set_content("Invalid JSON", "text/plain");
    }
  });

  svr.Post("/payments/confirm", [&paymentGateway, &gameFactory,
                                 &tokenFactory](const httplib::Request &req,
                                                httplib::Response &res) {
    res.set_header("Access-Control-Allow-Origin", "*");
    try {
      json data = json::parse(req.body);
      std::string txId = data["txId"];

      if (paymentGateway.confirmTransaction(txId)) {
        // If confirmed, unlock the game
        auto tx = paymentGateway.transactions[txId];

        // If it was CRDO, we already handled balance in buyGame?
        // No, buyGame handles CRDO logic directly.
        // This endpoint is for external gateways (Transbank/PayPal) callback.
        // But for simplicity, let's say the frontend calls this after "success"
        // on gateway.

        // Add game to library (bypass balance check since it's paid via Fiat)
        // We need a method in GameFactory to force add game.
        // For now, let's just use a hack or assume buyGame can take a flag.
        // Actually, let's just add it to library manually here.
        gameFactory.userLibraries[tx.buyerAddress].push_back(tx.gameId);
        gameFactory.saveLibraries();

        res.set_content("{\"status\": \"success\"}", "application/json");
      } else {
        res.status = 400;
        res.set_content(
            "{\"status\": \"failed\", \"message\": \"Transaction not found\"}",
            "application/json");
      }
    } catch (...) {
      res.status = 400;
      res.set_content("Invalid JSON", "text/plain");
    }
  });

  // --- CrudoLauncher Endpoints ---

  svr.Options("/launcher/create",
              [](const httplib::Request &, httplib::Response &res) {
                res.set_header("Access-Control-Allow-Origin", "*");
                res.set_header("Access-Control-Allow-Methods", "POST, OPTIONS");
                res.set_header("Access-Control-Allow-Headers", "Content-Type");
                res.set_content("", "text/plain");
              });

  svr.Post("/launcher/create", [&tokenFactory](const httplib::Request &req,
                                               httplib::Response &res) {
    res.set_header("Access-Control-Allow-Origin", "*");
    try {
      json data = json::parse(req.body);
      bool success = tokenFactory.createToken(
          data["ticker"], data["name"], data["description"], data["imageUrl"],
          data["creator"]);
      if (success) {
        res.set_content("{\"status\": \"success\"}", "application/json");
      } else {
        res.status = 400;
        res.set_content(
            "{\"status\": \"failed\", \"message\": \"Token already exists\"}",
            "application/json");
      }
    } catch (...) {
      res.status = 400;
      res.set_content("Invalid JSON", "text/plain");
    }
  });

  svr.Options("/launcher/delete",
              [](const httplib::Request &, httplib::Response &res) {
                res.set_header("Access-Control-Allow-Origin", "*");
                res.set_header("Access-Control-Allow-Methods", "POST, OPTIONS");
                res.set_header("Access-Control-Allow-Headers", "Content-Type");
                res.set_content("", "text/plain");
              });

  svr.Post("/launcher/delete", [&tokenFactory](const httplib::Request &req,
                                               httplib::Response &res) {
    res.set_header("Access-Control-Allow-Origin", "*");
    try {
      json data = json::parse(req.body);
      bool success = tokenFactory.deleteToken(data["ticker"]);
      if (success) {
        res.set_content("{\"status\": \"success\"}", "application/json");
      } else {
        res.status = 400;
        res.set_content(
            "{\"status\": \"failed\", \"message\": \"Token not found\"}",
            "application/json");
      }
    } catch (...) {
      res.status = 400;
      res.set_content("Invalid JSON", "text/plain");
    }
  });

  svr.Options("/launcher/buy",
              [](const httplib::Request &, httplib::Response &res) {
                res.set_header("Access-Control-Allow-Origin", "*");
                res.set_header("Access-Control-Allow-Methods", "POST, OPTIONS");
                res.set_header("Access-Control-Allow-Headers", "Content-Type");
                res.set_content("", "text/plain");
              });

  svr.Post("/launcher/buy", [&tokenFactory](const httplib::Request &req,
                                            httplib::Response &res) {
    res.set_header("Access-Control-Allow-Origin", "*");
    try {
      json data = json::parse(req.body);
      std::string address = data.contains("address") ? data["address"] : "Anon";
      bool success =
          tokenFactory.buyToken(data["ticker"], data["amount"], address);
      if (success) {
        res.set_content("{\"status\": \"success\"}", "application/json");
      } else {
        res.status = 400;
        res.set_content(
            "{\"status\": \"failed\", \"message\": \"Token not found\"}",
            "application/json");
      }
    } catch (...) {
      res.status = 400;
      res.set_content("Invalid JSON", "text/plain");
    }
  });

  svr.Get(R"(/wallet/([^/]+))",
          [&tokenFactory](const httplib::Request &req, httplib::Response &res) {
            res.set_header("Access-Control-Allow-Origin", "*");
            std::string address = req.matches[1];
            auto balances = tokenFactory.getUserBalances(address);
            res.set_content(json(balances).dump(), "application/json");
          });

  svr.Options("/wallet/claim",
              [](const httplib::Request &, httplib::Response &res) {
                res.set_header("Access-Control-Allow-Origin", "*");
                res.set_header("Access-Control-Allow-Methods", "POST, OPTIONS");
                res.set_header("Access-Control-Allow-Headers", "Content-Type");
                res.set_content("", "text/plain");
              });

  svr.Post("/wallet/claim", [&tokenFactory](const httplib::Request &req,
                                            httplib::Response &res) {
    res.set_header("Access-Control-Allow-Origin", "*");
    try {
      json data = json::parse(req.body);
      std::string address = data["address"];
      bool success = tokenFactory.claimDailyReward(address);
      if (success) {
        res.set_content(
            "{\"status\": \"success\", \"message\": \"Reward Claimed!\"}",
            "application/json");
      } else {
        res.status = 400;
        res.set_content("{\"status\": \"failed\", \"message\": \"Cooldown "
                        "active. Try again later.\"}",
                        "application/json");
      }
    } catch (...) {
      res.status = 400;
      res.set_content("Invalid JSON", "text/plain");
    }
  });

  svr.Get("/launcher/tokens",
          [&tokenFactory](const httplib::Request &, httplib::Response &res) {
            res.set_header("Access-Control-Allow-Origin", "*");
            res.set_content(tokenFactory.toJson().dump(), "application/json");
          });

  // --- Casino Endpoints ---

  svr.Options(R"(/casino/.*)",
              [](const httplib::Request &, httplib::Response &res) {
                res.set_header("Access-Control-Allow-Origin", "*");
                res.set_header("Access-Control-Allow-Methods", "POST, OPTIONS");
                res.set_header("Access-Control-Allow-Headers", "Content-Type");
                res.set_content("", "text/plain");
              });

  svr.Post(
      "/casino/blackjack/deal",
      [&tokenFactory](const httplib::Request &req, httplib::Response &res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        try {
          json data = json::parse(req.body);
          std::string player = data["playerAddress"];
          int bet = data["bet"];
          std::string clientSeed =
              data.contains("clientSeed") ? data["clientSeed"] : "default";

          // Check balance
          if (tokenFactory.tokenBalances[player]["CRDO"] < bet) {
            res.status = 400;
            res.set_content(
                "{\"status\": \"failed\", \"message\": \"Insufficient funds\"}",
                "application/json");
            return;
          }

          // Deduct bet
          tokenFactory.tokenBalances[player]["CRDO"] -= bet;
          tokenFactory.saveBalances();

          // Create game
          std::string gameId =
              sha256(player + std::to_string(std::time(nullptr)));
          BlackjackGame game(gameId, player, bet, clientSeed);
          BlackjackGame::activeGames[gameId] = game;

          // If instant blackjack, payout immediately
          if (game.isGameOver && game.result == "BLACKJACK") {
            int payout = bet * 2.5; // 3:2 payout
            tokenFactory.tokenBalances[player]["CRDO"] += payout;
            tokenFactory.saveBalances();
            res.set_content(game.toRevealedJson().dump(), "application/json");
          } else if (game.isGameOver && game.result == "PUSH") {
            tokenFactory.tokenBalances[player]["CRDO"] += bet;
            tokenFactory.saveBalances();
            res.set_content(game.toRevealedJson().dump(), "application/json");
          } else {
            res.set_content(game.toJson().dump(), "application/json");
          }

        } catch (...) {
          res.status = 400;
          res.set_content("Invalid JSON", "text/plain");
        }
      });

  svr.Post("/casino/blackjack/hit", [](const httplib::Request &req,
                                       httplib::Response &res) {
    res.set_header("Access-Control-Allow-Origin", "*");
    try {
      json data = json::parse(req.body);
      std::string gameId = data["gameId"];

      if (BlackjackGame::activeGames.find(gameId) !=
          BlackjackGame::activeGames.end()) {
        BlackjackGame &game = BlackjackGame::activeGames[gameId];
        game.hit();

        if (game.isGameOver) {
          res.set_content(game.toRevealedJson().dump(), "application/json");
          // No payout on bust (LOSE)
          BlackjackGame::activeGames.erase(gameId);
        } else {
          res.set_content(game.toJson().dump(), "application/json");
        }
      } else {
        res.status = 404;
        res.set_content(
            "{\"status\": \"failed\", \"message\": \"Game not found\"}",
            "application/json");
      }
    } catch (...) {
      res.status = 400;
      res.set_content("Invalid JSON", "text/plain");
    }
  });

  svr.Post(
      "/casino/blackjack/stand",
      [&tokenFactory](const httplib::Request &req, httplib::Response &res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        try {
          json data = json::parse(req.body);
          std::string gameId = data["gameId"];

          if (BlackjackGame::activeGames.find(gameId) !=
              BlackjackGame::activeGames.end()) {
            BlackjackGame &game = BlackjackGame::activeGames[gameId];
            game.stand();

            if (game.result == "WIN") {
              tokenFactory.tokenBalances[game.playerAddress]["CRDO"] +=
                  game.playerHand.bet * 2;
              tokenFactory.saveBalances();
            } else if (game.result == "PUSH") {
              tokenFactory.tokenBalances[game.playerAddress]["CRDO"] +=
                  game.playerHand.bet;
              tokenFactory.saveBalances();
            }

            res.set_content(game.toRevealedJson().dump(), "application/json");
            BlackjackGame::activeGames.erase(gameId);
          } else {
            res.status = 404;
            res.set_content(
                "{\"status\": \"failed\", \"message\": \"Game not found\"}",
                "application/json");
          }
        } catch (...) {
          res.status = 400;
          res.set_content("Invalid JSON", "text/plain");
        }
      });

  svr.Post("/casino/slots/spin", [&tokenFactory](const httplib::Request &req,
                                                 httplib::Response &res) {
    res.set_header("Access-Control-Allow-Origin", "*");
    try {
      json data = json::parse(req.body);
      std::string player = data["playerAddress"];
      int bet = data["bet"];
      std::string clientSeed =
          data.contains("clientSeed") ? data["clientSeed"] : "default";

      if (tokenFactory.tokenBalances[player]["CRDO"] < bet) {
        res.status = 400;
        res.set_content(
            "{\"status\": \"failed\", \"message\": \"Insufficient funds\"}",
            "application/json");
        return;
      }

      tokenFactory.tokenBalances[player]["CRDO"] -= bet;

      json result = SlotMachine::spin(bet, clientSeed);
      int payout = result["payout"];

      if (payout > 0) {
        tokenFactory.tokenBalances[player]["CRDO"] += payout;
      }
      tokenFactory.saveBalances();

      res.set_content(result.dump(), "application/json");

    } catch (...) {
      res.status = 400;
      res.set_content("Invalid JSON", "text/plain");
    }
  });

  // --- Poker Endpoints ---

  svr.Post("/casino/poker/deal", [&tokenFactory](const httplib::Request &req,
                                                 httplib::Response &res) {
    res.set_header("Access-Control-Allow-Origin", "*");
    try {
      json data = json::parse(req.body);
      std::string player = data["playerAddress"];
      int ante = data["ante"];
      std::string clientSeed =
          data.contains("clientSeed") ? data["clientSeed"] : "default";

      if (tokenFactory.tokenBalances[player]["CRDO"] < ante) {
        res.status = 400;
        res.set_content(
            "{\"status\": \"failed\", \"message\": \"Insufficient funds\"}",
            "application/json");
        return;
      }

      tokenFactory.tokenBalances[player]["CRDO"] -= ante;
      tokenFactory.saveBalances();

      std::string gameId = sha256(player + std::to_string(std::time(nullptr)));
      PokerGame game(gameId, player, ante, clientSeed);
      game.deal();
      PokerGame::activeGames[gameId] = game;

      res.set_content(game.toJson().dump(), "application/json");
    } catch (...) {
      res.status = 400;
      res.set_content("Invalid JSON", "text/plain");
    }
  });

  svr.Post("/casino/poker/call", [&tokenFactory](const httplib::Request &req,
                                                 httplib::Response &res) {
    res.set_header("Access-Control-Allow-Origin", "*");
    try {
      json data = json::parse(req.body);
      std::string gameId = data["gameId"];

      if (PokerGame::activeGames.count(gameId)) {
        PokerGame &game = PokerGame::activeGames[gameId];
        int callBet = game.ante * 2;

        if (tokenFactory.tokenBalances[game.playerAddress]["CRDO"] < callBet) {
          res.status = 400;
          res.set_content("{\"status\": \"failed\", \"message\": "
                          "\"Insufficient funds to Call\"}",
                          "application/json");
          return;
        }

        tokenFactory.tokenBalances[game.playerAddress]["CRDO"] -= callBet;
        game.call();

        if (game.result == "WIN") {
          // Payout: Ante (1:1) + Call (1:1) + Returned Bets
          // Total returned = Ante*2 + Call*2 = Ante*2 + (Ante*2)*2 = 6x Ante?
          // Standard Casino Holdem:
          // Ante pays according to table (usually 1:1 if dealer qualifies)
          // Call pays 1:1
          // Let's simplify: Win = Take Pot (Ante + Call) * 2?
          // Let's do: Win = (Ante + Call) * 2.
          int totalBet = game.ante + callBet;
          tokenFactory.tokenBalances[game.playerAddress]["CRDO"] +=
              totalBet * 2;
        } else if (game.result == "PUSH") {
          int totalBet = game.ante + callBet;
          tokenFactory.tokenBalances[game.playerAddress]["CRDO"] += totalBet;
        }

        tokenFactory.saveBalances();
        res.set_content(game.toJson().dump(), "application/json");
        PokerGame::activeGames.erase(gameId);
      } else {
        res.status = 404;
        res.set_content(
            "{\"status\": \"failed\", \"message\": \"Game not found\"}",
            "application/json");
      }
    } catch (...) {
      res.status = 400;
      res.set_content("Invalid JSON", "text/plain");
    }
  });

  svr.Post("/casino/poker/fold", [](const httplib::Request &req,
                                    httplib::Response &res) {
    res.set_header("Access-Control-Allow-Origin", "*");
    try {
      json data = json::parse(req.body);
      std::string gameId = data["gameId"];

      if (PokerGame::activeGames.count(gameId)) {
        PokerGame &game = PokerGame::activeGames[gameId];
        game.fold();
        res.set_content(game.toJson().dump(), "application/json");
        PokerGame::activeGames.erase(gameId);
      } else {
        res.status = 404;
        res.set_content(
            "{\"status\": \"failed\", \"message\": \"Game not found\"}",
            "application/json");
      }
    } catch (...) {
      res.status = 400;
      res.set_content("Invalid JSON", "text/plain");
    }
  });

  // --- CMS Endpoints (News & Blog) ---

  svr.Get("/news",
          [&newsFactory](const httplib::Request &, httplib::Response &res) {
            res.set_header("Access-Control-Allow-Origin", "*");
            json posts = json::array();
            for (const auto &p : newsFactory.getPosts("NEWS")) {
              posts.push_back(p.toJson());
            }
            res.set_content(posts.dump(), "application/json");
          });

  svr.Get("/blog",
          [&newsFactory](const httplib::Request &, httplib::Response &res) {
            res.set_header("Access-Control-Allow-Origin", "*");
            json posts = json::array();
            for (const auto &p : newsFactory.getPosts("BLOG")) {
              posts.push_back(p.toJson());
            }
            res.set_content(posts.dump(), "application/json");
          });

  svr.Get(R"(/cms/post/([^/]+))",
          [&newsFactory](const httplib::Request &req, httplib::Response &res) {
            res.set_header("Access-Control-Allow-Origin", "*");
            std::string id = req.matches[1];
            Post *p = newsFactory.getPost(id);
            if (p) {
              res.set_content(p->toJson().dump(), "application/json");
            } else {
              res.status = 404;
              res.set_content("{}", "application/json");
            }
          });

  svr.Options("/cms/create",
              [](const httplib::Request &, httplib::Response &res) {
                res.set_header("Access-Control-Allow-Origin", "*");
                res.set_header("Access-Control-Allow-Methods", "POST, OPTIONS");
                res.set_header("Access-Control-Allow-Headers", "Content-Type");
                res.set_content("", "text/plain");
              });

  svr.Post("/cms/create", [&newsFactory](const httplib::Request &req,
                                         httplib::Response &res) {
    res.set_header("Access-Control-Allow-Origin", "*");
    try {
      json data = json::parse(req.body);
      newsFactory.createPost(data["title"], data["content"], data["author"],
                             data["imageUrl"], data["type"]);
      res.set_content("{\"status\": \"success\"}", "application/json");
    } catch (...) {
      res.status = 400;
      res.set_content("Invalid JSON", "text/plain");
    }
  });

  std::cout << "Server started at http://localhost:" << port << std::endl;
  svr.listen("0.0.0.0", port);
}
