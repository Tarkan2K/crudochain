#ifndef SHA256_H
#define SHA256_H

#include <string>
#include "picosha2.h"

inline std::string sha256(const std::string& src) {
    std::string hash_hex_str;
    picosha2::hash256_hex_string(src, hash_hex_str);
    return hash_hex_str;
}

#endif
