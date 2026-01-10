#ifndef NEWSFACTORY_H
#define NEWSFACTORY_H

#include "json.hpp"
#include <algorithm>
#include <ctime>
#include <fstream>
#include <iostream>
#include <string>
#include <vector>

using json = nlohmann::json;

struct Post {
  std::string id;
  std::string title;
  std::string content;
  std::string author;
  std::string imageUrl;
  std::string type; // "NEWS" or "BLOG"
  long long createdAt;

  json toJson() const {
    return {{"id", id},
            {"title", title},
            {"content", content},
            {"author", author},
            {"imageUrl", imageUrl},
            {"type", type},
            {"createdAt", createdAt}};
  }

  static Post fromJson(const json &j) {
    Post p;
    p.id = j.value("id", "");
    p.title = j.value("title", "");
    p.content = j.value("content", "");
    p.author = j.value("author", "");
    p.imageUrl = j.value("imageUrl", "");
    p.type = j.value("type", "NEWS");
    p.createdAt = j.value("createdAt", 0LL);
    return p;
  }
};

class NewsFactory {
private:
  const std::string DB_FILE = "uploads/cms_data.json";

public:
  std::vector<Post> posts;

  NewsFactory() {
    loadPosts();
    // Seed if empty
    if (posts.empty()) {
      seedData();
    }
  }

  void createPost(std::string title, std::string content, std::string author,
                  std::string imageUrl, std::string type) {
    Post p;
    p.id = std::to_string(std::time(nullptr)) + "_" + type;
    p.title = title;
    p.content = content;
    p.author = author;
    p.imageUrl = imageUrl;
    p.type = type;
    p.createdAt = std::time(nullptr);

    posts.push_back(p);
    savePosts();
    std::cout << "📝 Post Created: " << title << " [" << type << "]"
              << std::endl;
  }

  bool deletePost(std::string id) {
    auto it = std::remove_if(posts.begin(), posts.end(),
                             [&id](const Post &p) { return p.id == id; });
    if (it != posts.end()) {
      posts.erase(it, posts.end());
      savePosts();
      return true;
    }
    return false;
  }

  std::vector<Post> getPosts(std::string type) {
    std::vector<Post> filtered;
    for (const auto &p : posts) {
      if (p.type == type) {
        filtered.push_back(p);
      }
    }
    // Sort by date desc
    std::sort(
        filtered.begin(), filtered.end(),
        [](const Post &a, const Post &b) { return a.createdAt > b.createdAt; });
    return filtered;
  }

  Post *getPost(std::string id) {
    for (auto &p : posts) {
      if (p.id == id)
        return &p;
    }
    return nullptr;
  }

  void savePosts() {
    json jPosts = json::array();
    for (const auto &p : posts) {
      jPosts.push_back(p.toJson());
    }
    std::ofstream file(DB_FILE);
    if (file.is_open()) {
      file << jPosts.dump(4);
      file.close();
    } else {
      std::cerr << "❌ Error saving CMS data to " << DB_FILE << std::endl;
    }
  }

  void loadPosts() {
    std::ifstream file(DB_FILE);
    if (file.is_open()) {
      try {
        json jPosts;
        file >> jPosts;
        posts.clear();
        for (const auto &j : jPosts) {
          posts.push_back(Post::fromJson(j));
        }
        std::cout << "✅ Loaded " << posts.size() << " CMS posts." << std::endl;
      } catch (...) {
        std::cerr << "⚠️ Error parsing CMS data, starting fresh." << std::endl;
      }
      file.close();
    }
  }

  void seedData() {
    createPost("Welcome to CrudoChain News",
               "This is the start of something big.", "Admin",
               "https://picsum.photos/seed/news1/800/400", "NEWS");
    createPost("The Future of Gaming",
               "Blockchain meets gameplay in an unprecedented way.", "Satoshi",
               "https://picsum.photos/seed/blog1/800/400", "BLOG");
  }
};

#endif
