// develop-only bridge for a PTP-only macOS preview.
// This is deliberately NOT a replacement for Sony Camera Remote SDK.
// The official build continues to use SonySDKBridge.cpp and the vendor runtime.
#include <cstddef>
#include <cstdint>
#include <cstring>

namespace {
constexpr int kVendorSdkUnavailable = -150;
void clearText(char* output, std::size_t capacity) {
    if (output != nullptr && capacity > 0) {
        output[0] = '\0';
    }
}
}

extern "C" int ZencheProbeSonyCameraRemoteSDK(
    char* output, std::size_t capacity) {
    static constexpr const char kUnavailable[] =
        "{\"loaded\":false,\"initialized\":false,\"version\":0,"
        "\"errorCode\":150,\"devices\":[]}";
    clearText(output, capacity);
    if (output == nullptr || capacity < sizeof(kUnavailable)) {
        return kVendorSdkUnavailable;
    }
    std::memcpy(output, kUnavailable, sizeof(kUnavailable));
    return 0;
}

extern "C" int ZencheSonySDKConnect(
    const char*, char* modelOutput, std::size_t modelCapacity) {
    clearText(modelOutput, modelCapacity);
    return kVendorSdkUnavailable;
}

extern "C" int ZencheSonySDKDisconnect() { return 0; }

extern "C" int ZencheSonySDKGetLiveViewImage(
    std::uint8_t*, std::size_t, std::size_t* actualSize) {
    if (actualSize != nullptr) *actualSize = 0;
    return kVendorSdkUnavailable;
}

extern "C" int ZencheSonySDKCapture(char* output, std::size_t capacity) {
    clearText(output, capacity);
    return kVendorSdkUnavailable;
}

extern "C" int ZencheSonySDKSetMovieRecording(bool) {
    return kVendorSdkUnavailable;
}

extern "C" int ZencheSonySDKAutofocus(bool) {
    return kVendorSdkUnavailable;
}

extern "C" int ZencheSonySDKSetProperty(std::uint32_t, std::uint64_t) {
    return kVendorSdkUnavailable;
}
