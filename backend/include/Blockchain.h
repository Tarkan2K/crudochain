#ifndef BLOCKCHAIN_H
#define BLOCKCHAIN_H

#include "httplib.h"
#include "json.hpp"
#include "sha256.h"
#include <ctime>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>

extern "C" {
#include "monocypher.h"
}

using json = nlohmann::json;

// Helper: Hex string to vector<uint8_t>
std::vector<uint8_t> hexToBytes(const std::string &hex) {
  std::vector<uint8_t> bytes;
  for (unsigned int i = 0; i < hex.length(); i += 2) {
    std::string byteString = hex.substr(i, 2);
    uint8_t byte = (uint8_t)strtol(byteString.c_str(), nullptr, 16);
    bytes.push_back(byte);
  }
  return bytes;
}

struct Block {
  int index;
  long long timestamp;
  json data;
  std::string prevHash;
  std::string hash;
  int nonce;

  Block(int idx, json d, std::string ph)
      : index(idx), data(d), prevHash(ph), nonce(0) {
    timestamp = std::time(nullptr);
    hash = calculateHash();
  }

  std::string calculateHash() const {
    std::stringstream ss;
    ss << index << timestamp << data.dump() << prevHash << nonce;
    return sha256(ss.str());
  }

  void mineBlock(int difficulty) {
    std::string target(difficulty, '0');
    while (hash.substr(0, difficulty) != target) {
      nonce++;
      hash = calculateHash();
    }
    std::cout << "Block mined: " << hash << std::endl;
  }

  json toJson() const {
    return {{"index", index},       {"timestamp", timestamp}, {"data", data},
            {"prevHash", prevHash}, {"hash", hash},           {"nonce", nonce}};
  }
};

class Blockchain {
public:
  std::vector<Block> chain;
  int difficulty;
  const std::string filename = "chain.json";

  Blockchain() {
    difficulty = 4;
    if (!loadChain()) {
      chain.emplace_back(createGenesisBlock());
      saveChain();
    }
  }

  Block createGenesisBlock() {
    json genesisTx = {
        {"to",
         "be45e02d8cbe78a506257c2e6a4bfa26222cff54e79448d1e5b29636b795878b"},
        {"amount", 1000000000},
        {"type", "genesis_mint"},
        {"from", "SYSTEM"},
        {"signature", "GENESIS"}};
    return Block(0, genesisTx, "0");
  }

  Block getLatestBlock() const { return chain.back(); }

  bool verifyTransaction(const json &tx) {
    if (!tx.contains("from") || !tx.contains("to") || !tx.contains("amount") ||
        !tx.contains("signature")) {
      return false;
    }

    std::string from = tx["from"];
    std::string to = tx["to"];
    int amount = tx["amount"];
    std::string signatureHex = tx["signature"];

    std::string message = from + to + std::to_string(amount);

    std::vector<uint8_t> pubKey = hexToBytes(from);
    std::vector<uint8_t> signature = hexToBytes(signatureHex);

    if (pubKey.size() != 32 || signature.size() != 64) {
      return false;
    }

    if (crypto_eddsa_check(signature.data(), pubKey.data(),
                           (const uint8_t *)message.c_str(),
                           message.size()) == 0) {
      return true;
    }
    return false;
  }

  void addBlock(Block &newBlock) {
    if (newBlock.data.is_object() && newBlock.data.contains("signature")) {
      if (!verifyTransaction(newBlock.data)) {
        std::cout << "Invalid signature! Block rejected." << std::endl;
        throw std::runtime_error("Invalid signature");
      }
    }

    newBlock.prevHash = getLatestBlock().hash;
    newBlock.mineBlock(difficulty);
    chain.push_back(newBlock);
    std::cout << "Block added. Chain size: " << chain.size() << ". Saving..."
              << std::endl;
    saveChain();
  }

  void saveChain() {
    httplib::Client cli("localhost", 3001);
    auto res = cli.Post("/chain/save", toJson().dump(), "application/json");
    if (res && res->status == 200) {
      std::cout << "Blockchain saved to DB (Height: " << chain.size() << ")"
                << std::endl;
    } else {
      std::cerr << "Error saving to DB" << std::endl;
    }
  }

  bool loadChain() {
    httplib::Client cli("localhost", 3001);
    auto res = cli.Get("/chain/load");
    if (res && res->status == 200) {
      try {
        json jChain = json::parse(res->body);
        chain.clear();
        for (const auto &jBlock : jChain) {
          Block block(jBlock["index"], jBlock["data"], jBlock["prevHash"]);
          block.timestamp = jBlock["timestamp"];
          block.hash = jBlock["hash"];
          block.nonce = jBlock["nonce"];
          chain.push_back(block);
        }
        std::cout << "Blockchain loaded from DB (Height: " << chain.size()
                  << ")" << std::endl;
        return true;
      } catch (...) {
        std::cerr << "Error parsing chain from DB" << std::endl;
      }
    }
    return false;
  }

  bool isChainValid() const {
    for (size_t i = 1; i < chain.size(); i++) {
      const Block &currentBlock = chain[i];
      const Block &prevBlock = chain[i - 1];

      if (currentBlock.hash != currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.prevHash != prevBlock.hash) {
        return false;
      }
    }
    return true;
  }

  json toJson() const {
    json jChain = json::array();
    for (const auto &block : chain) {
      jChain.push_back(block.toJson());
    }
    return jChain;
  }
};

#endif
