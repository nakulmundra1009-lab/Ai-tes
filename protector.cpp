#include <cstdint>
#include <cstring>
#include <string>
#include <vector>

static const char* kTargets[3] = {
    "https://kuro-api-pannel.vercel.app/connect",
    "https://rjloader.vippanel.online/connect",
    "https://gamesever.vippanel.space/connect"
};

static std::vector<uint8_t> xor_encrypt(const std::string& src) {
    std::vector<uint8_t> out(src.begin(), src.end());
    for (size_t i = 0; i < out.size(); ++i) {
        out[i] ^= static_cast<uint8_t>(0xAA ^ (i & 0xFF));
    }
    return out;
}

static bool constant_time_eq(const std::vector<uint8_t>& a, const std::vector<uint8_t>& b) {
    if (a.size() != b.size()) return false;
    uint8_t diff = 0;
    for (size_t i = 0; i < a.size(); ++i) diff |= (a[i] ^ b[i]);
    return diff == 0;
}

extern "C" bool verify_target_url(const char* candidate) {
    if (!candidate) return false;
    std::string in(candidate);
    auto encrypted = xor_encrypt(in);

    for (auto* target : kTargets) {
      if (constant_time_eq(encrypted, xor_encrypt(target))) {
        return true;
      }
    }
    return false;
}
