#ifndef NETWORK_H
#define NETWORK_H

#include "httplib.h"
#include "json.hpp"
#include <iostream>
#include <mutex>
#include <string>
#include <thread>
#include <vector>

using json = nlohmann::json;

struct Peer {
  std::string ip;
  int port;
};

class NetworkManager {
public:
  std::vector<Peer> peers;
  std::mutex peersMutex;

  void addPeer(const std::string &ip, int port) {
    std::lock_guard<std::mutex> lock(peersMutex);
    for (const auto &peer : peers) {
      if (peer.ip == ip && peer.port == port)
        return;
    }
    peers.push_back({ip, port});
    std::cout << "Connected to peer: " << ip << ":" << port << std::endl;
  }

  std::vector<Peer> getPeers() {
    std::lock_guard<std::mutex> lock(peersMutex);
    return peers;
  }

  void broadcastBlock(const json &blockData) {
    std::lock_guard<std::mutex> lock(peersMutex);
    for (const auto &peer : peers) {
      // Run in a separate thread to avoid blocking
      std::thread([peer, blockData]() {
        httplib::Client cli(peer.ip, peer.port);
        auto res =
            cli.Post("/block/receive", blockData.dump(), "application/json");
        if (res && res->status == 200) {
          std::cout << "Block broadcasted to " << peer.ip << ":" << peer.port
                    << std::endl;
        } else {
          std::cout << "Failed to broadcast to " << peer.ip << ":" << peer.port
                    << std::endl;
        }
      }).detach();
    }
  }
};

#endif // NETWORK_H
