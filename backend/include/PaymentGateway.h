#ifndef PAYMENTGATEWAY_H
#define PAYMENTGATEWAY_H

#include "json.hpp"
#include <ctime>
#include <iostream>
#include <map>
#include <string>

using json = nlohmann::json;

class PaymentGateway {
public:
  struct Transaction {
    std::string id;
    std::string type; // "TRANSBANK", "PAYPAL", "CRDO"
    double amount;
    std::string currency; // "CLP", "USD", "CRDO"
    std::string status;   // "PENDING", "COMPLETED", "FAILED"
    std::string gameId;
    std::string buyerAddress;
    long long timestamp;
  };

  std::map<std::string, Transaction> transactions;

  // Exchange Rates (Mock)
  const double USD_TO_CLP = 950.0;
  const double CRDO_TO_USD = 0.10; // 1 CRDO = $0.10 USD
  // 1 CRDO = 95 CLP

  std::string createTransaction(std::string type, double amount,
                                std::string currency, std::string gameId,
                                std::string buyer) {
    std::string txId = "tx_" + std::to_string(std::time(nullptr)) + "_" + type;

    Transaction tx;
    tx.id = txId;
    tx.type = type;
    tx.amount = amount;
    tx.currency = currency;
    tx.status = "PENDING";
    tx.gameId = gameId;
    tx.buyerAddress = buyer;
    tx.timestamp = std::time(nullptr);

    transactions[txId] = tx;

    std::cout << "💳 Payment Initiated: " << type << " | " << amount << " "
              << currency << " | TX: " << txId << std::endl;

    // In a real app, we would call Transbank/PayPal APIs here to get a redirect
    // URL. For now, we return the internal TX ID.
    return txId;
  }

  bool confirmTransaction(std::string txId) {
    if (transactions.count(txId)) {
      transactions[txId].status = "COMPLETED";
      std::cout << "✅ Payment Confirmed: " << txId << std::endl;
      return true;
    }
    return false;
  }

  double getPriceInCRDO(double priceInUSD) {
    // Apply 20% Discount for CRDO users
    double standardCrdo = priceInUSD / CRDO_TO_USD;
    return standardCrdo * 0.8; // 20% off
  }

  double getPriceInCLP(double priceInUSD) { return priceInUSD * USD_TO_CLP; }
};

#endif
