#include <napi.h>
#include <windows.h>
#include <iostream>
#include <sstream>
#include <string>


void simulateAltKey(int code) {
    INPUT inputs[4] = {};

    inputs[0].type = INPUT_KEYBOARD;
    inputs[0].ki.wVk = VK_MENU;

    inputs[1].type = INPUT_KEYBOARD;
    inputs[1].ki.wVk = code;

    inputs[2].type = INPUT_KEYBOARD;
    inputs[2].ki.wVk = code;
    inputs[2].ki.dwFlags = KEYEVENTF_KEYUP;

    inputs[3].type = INPUT_KEYBOARD;
    inputs[3].ki.wVk = VK_MENU;
    inputs[3].ki.dwFlags = KEYEVENTF_KEYUP;

    SendInput(ARRAYSIZE(inputs), inputs, sizeof(INPUT));
}

void zoomFocus() {
    INPUT inputs[6] = {};

    inputs[0].type = INPUT_KEYBOARD;
    inputs[0].ki.wVk = VK_MENU;

    inputs[1].type = INPUT_KEYBOARD;
    inputs[1].ki.wVk = VK_CONTROL;

    inputs[2].type = INPUT_KEYBOARD;
    inputs[2].ki.wVk = VK_SHIFT;

    inputs[3].type = INPUT_KEYBOARD;
    inputs[3].ki.wVk = VK_SHIFT;
    inputs[3].ki.dwFlags = KEYEVENTF_KEYUP;

    inputs[4].type = INPUT_KEYBOARD;
    inputs[4].ki.wVk = VK_CONTROL;
    inputs[4].ki.dwFlags = KEYEVENTF_KEYUP;

    inputs[5].type = INPUT_KEYBOARD;
    inputs[5].ki.wVk = VK_MENU;
    inputs[5].ki.dwFlags = KEYEVENTF_KEYUP;

    SendInput(ARRAYSIZE(inputs), inputs, sizeof(INPUT));
}

Napi::Value SimulateAltKeyWrapper(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    int arg0 = info[0].As<Napi::Number>();
    simulateAltKey(arg0);
    return env.Undefined();
}

Napi::Value ZoomFocusWrapper(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    zoomFocus();
    return env.Undefined();
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set(Napi::String::New(env, "simulateAltKey"), Napi::Function::New(env, SimulateAltKeyWrapper));
    exports.Set(Napi::String::New(env, "zoomFocus"), Napi::Function::New(env, ZoomFocusWrapper));
    return exports;
}

NODE_API_MODULE(keyboard, Init)