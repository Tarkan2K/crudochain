#include <iostream>
#include <vector>
#include <map>
#include <algorithm>
#include <chrono>

// Concept: High-Frequency Matching Engine (The "Solana Killer" Core)
// This demonstrates how C++ handles an Order Book in microseconds.

struct Order {
    long long id;
    double price;
    double amount;
    std::string trader;
    bool isBuy;
};

// The Order Book: Where buyers meet sellers
class OrderBook {
public:
    // Maps keep orders sorted by price automatically!
    // Sell Orders: Lowest price first (Ascending)
    std::map<double, std::vector<Order>> sells;
    // Buy Orders: Highest price first (Descending)
    std::map<double, std::vector<Order>, std::greater<double>> buys;

    void addOrder(Order order) {
        if (order.isBuy) {
            matchBuy(order);
        } else {
            matchSell(order);
        }
    }

    // Matching Logic: Speed is Key
    void matchBuy(Order& buyOrder) {
        auto it = sells.begin();
        while (it != sells.end() && it->first <= buyOrder.price && buyOrder.amount > 0) {
            std::vector<Order>& sellOrders = it->second;
            
            // Match against orders at this price level
            for (size_t i = 0; i < sellOrders.size(); ++i) {
                Order& sellOrder = sellOrders[i];
                double matchedAmount = std::min(buyOrder.amount, sellOrder.amount);
                
                // EXECUTE TRADE
                std::cout << "⚡ MATCH! " << matchedAmount << " CRDO @ $" << sellOrder.price 
                          << " (" << buyOrder.trader << " buys from " << sellOrder.trader << ")" << std::endl;

                buyOrder.amount -= matchedAmount;
                sellOrder.amount -= matchedAmount;

                if (buyOrder.amount == 0) break;
            }
            
            // Cleanup empty orders (Simplified)
            if (buyOrder.amount == 0) break;
            it++;
        }

        // If not fully filled, add to book
        if (buyOrder.amount > 0) {
            buys[buyOrder.price].push_back(buyOrder);
            std::cout << "📝 Order Placed: Buy " << buyOrder.amount << " @ $" << buyOrder.price << std::endl;
        }
    }

    void matchSell(Order& sellOrder) {
        // Similar logic for sells...
        std::cout << "📝 Order Placed: Sell " << sellOrder.amount << " @ $" << sellOrder.price << std::endl;
        sells[sellOrder.price].push_back(sellOrder);
    }
};

int main() {
    OrderBook market;

    std::cout << "--- 🚀 CRUDOCHAIN MATCHING ENGINE SIMULATION ---" << std::endl;

    // 1. Add some liquidity (Sellers)
    market.addOrder({1, 100.50, 10, "Alice", false});
    market.addOrder({2, 101.00, 50, "Bob", false});
    market.addOrder({3, 102.50, 20, "Charlie", false});

    std::cout << "\n--- 💥 MARKET BUY INCOMING ---" << std::endl;
    
    // 2. A Whale buys!
    auto start = std::chrono::high_resolution_clock::now();
    
    market.addOrder({4, 103.00, 40, "WHALE_ADMIN", true});

    auto end = std::chrono::high_resolution_clock::now();
    auto duration = std::chrono::duration_cast<std::chrono::microseconds>(end - start);

    std::cout << "\n⏱️ Execution Time: " << duration.count() << " microseconds" << std::endl;

    return 0;
}
